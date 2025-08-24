import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useCartStore } from '@/hooks/store/cartStore';
import { useFirebaseProducts } from '@/hooks/useFirebaseProducts';
import { useFirebaseAddresses } from '@/hooks/useAddress';
import { addDoc, collection } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { useFirestorePaths } from '@/hooks/useFirestorePaths';
import { useUserInfo } from '@/hooks/useUserInfo';
import { toast } from 'sonner';
import { MapPin, CreditCard, Loader2, Plus } from 'lucide-react';
import { Address } from '@/types/product';

interface CheckoutFormProps {
  onOrderComplete: () => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ onOrderComplete }) => {
  const { currentUser } = useAuth();
  const userInfo = useUserInfo();
  const { items, clearCart, getTotalPrice } = useCartStore();
  const { products, loading: productsLoading } = useFirebaseProducts();
  const { addresses, loading: addressesLoading, addAddress, setDefaultAddress } = useFirebaseAddresses(currentUser?.uid);
  const paths = useFirestorePaths('shopping_cart');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(addresses.length === 0);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState({
    fullName: userInfo.name || '',
    email: userInfo.email || '',
    phoneNumber: userInfo.mobileNumber || '',
    address: userInfo.address || '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: true,
  });

  // Recalculate total using Firestore product data
  const calculatedTotal = productsLoading ? 0 : getTotalPrice(products);
  const finalTotal = calculatedTotal + 5 + calculatedTotal * 0.1; // Subtotal + Shipping + Tax (10%)

  // Set default address on load
  useEffect(() => {
    if (!addressesLoading && addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddress?.addressId || null);
      setShowNewAddressForm(false); // Hide new address form if addresses exist
    } else if (!addressesLoading && addresses.length === 0) {
      setShowNewAddressForm(true); // Show new address form for first-time users
    }
  }, [addresses, addressesLoading, selectedAddressId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('Please login to place an order');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Only require selectedAddressId if addresses exist and new address form is not shown
    if (addresses.length > 0 && !showNewAddressForm && !selectedAddressId) {
      toast.error('Please select an address');
      return;
    }

    let shippingAddress: Address;
    let finalAddressId: string | null = selectedAddressId;

    if (showNewAddressForm) {
      // Validate new address fields
      if (
        !newAddress.fullName ||
        !newAddress.email ||
        !newAddress.phoneNumber ||
        !newAddress.address ||
        !newAddress.city ||
        !newAddress.state ||
        !newAddress.zipCode ||
        !newAddress.country
      ) {
        toast.error('Please fill in all required fields for the new address');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newAddress.email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      // Basic phone number validation (e.g., 10 digits)
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(newAddress.phoneNumber)) {
        toast.error('Please enter a valid 10-digit phone number');
        return;
      }

      try {
        console.log('Calling addAddress with:', newAddress);
        const newAddressDoc = await addAddress(newAddress);
        console.log('New address document:', newAddressDoc, 'ID:', newAddressDoc.id);
        finalAddressId = newAddressDoc.id;
        shippingAddress = {
          ...newAddress,
          addressId: newAddressDoc.id,
          userId: currentUser.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          companyId: 'shopping_cart',
        };
        await setDefaultAddress(newAddressDoc.id);
      } catch (err: any) {
        console.error('Failed to add new address:', err.message, err.code);
        toast.error(`Failed to add new address: ${err.message}`);
        return;
      }
    } else {
      shippingAddress = addresses.find((addr) => addr.addressId === selectedAddressId)!;
      if (!shippingAddress) {
        toast.error('Please select a valid address');
        return;
      }
      try {
        await setDefaultAddress(selectedAddressId!);
      } catch (err: any) {
        console.error('Failed to set default address:', err.message, err.code);
        toast.error(`Failed to set default address: ${err.message}`);
        return;
      }
    }

    setLoading(true);
    try {
      const orderData = {
        userId: currentUser.uid,
        companyId: 'shopping_cart',
        items: items.map((item) => {
          const product = products.find((p) => p.productId === item.productId);
          const price = Number(product?.discountedPrice || product?.price || item.price) || 0;
          return {
            productId: item.productId,
            name: item.name,
            price,
            quantity: item.quantity,
            priceAtPurchase: price,
          };
        }),
        totalAmount: finalTotal,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress,
        orderNumber: `ORD-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('Placing order:', orderData);

      await addDoc(collection(firestore, paths.getOrdersPath()), orderData);

      clearCart();
      toast.success('Order placed successfully!');
      onOrderComplete();
      navigate('/order-confirmation', { state: orderData });
    } catch (error: any) {
      console.error('Error placing order:', error.message, error.code);
      toast.error(`Failed to place order: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleNewAddressForm = () => {
    setShowNewAddressForm(!showNewAddressForm);
    if (!showNewAddressForm) {
      setSelectedAddressId(null); // Clear selection when showing new address form
    }
  };

  if (productsLoading || addressesLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Shipping Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Saved Addresses */}
            {addresses.length > 0 && (
              <div className="space-y-4">
                <Label>Select Saved Address</Label>
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <div key={addr.addressId} className="flex items-center gap-2 p-2 border rounded-md hover:bg-muted/50 transition-colors">
                      <input
                        type="radio"
                        id={addr.addressId}
                        name="address"
                        checked={selectedAddressId === addr.addressId}
                        onChange={() => setSelectedAddressId(addr.addressId)}
                        className="h-4 w-4"
                      />
                      <label htmlFor={addr.addressId} className="flex-1 cursor-pointer">
                        <p className="font-medium">{addr.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {addr.address}, {addr.city}, {addr.state} {addr.zipCode}, {addr.country}
                        </p>
                        <p className="text-sm text-muted-foreground">{addr.phoneNumber}</p>
                        {addr.isDefault && (
                          <span className="text-xs text-primary font-semibold">Default</span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleNewAddressForm}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {showNewAddressForm ? 'Cancel New Address' : 'Add New Address'}
                </Button>
              </div>
            )}

            {/* New Address Form */}
            {showNewAddressForm && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">
                  {addresses.length === 0 ? 'Enter Shipping Address' : 'Add New Address'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={newAddress.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newAddress.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={newAddress.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={newAddress.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={newAddress.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your full address"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={newAddress.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={newAddress.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={newAddress.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <span>Subtotal:</span>
                <span>₹{Number(calculatedTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span>Shipping:</span>
                <span>₹5.00</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span>Tax (10%):</span>
                <span>₹{Number(calculatedTotal * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-lg font-semibold">₹{Number(finalTotal).toFixed(2)}</span>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || items.length === 0 || productsLoading || addressesLoading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Place Order
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
