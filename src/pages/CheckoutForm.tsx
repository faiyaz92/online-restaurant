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

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  priceAtPurchase: number;
  taxAmount: number;
}

interface OrderData {
  userId: string;
  companyId: string;
  items: OrderItem[];
  totalAmount: number;
  totalTax: number;
  status: string;
  paymentStatus: string;
  shippingAddress: Address;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
}

interface CheckoutFormProps {
  onOrderComplete: () => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ onOrderComplete }) => {
  const { currentUser } = useAuth();
  const userInfo = useUserInfo();
  const { items, clearCart, getTotalPrice, getTotalTax } = useCartStore();
  const { products, loading: productsLoading } = useFirebaseProducts();
  const { addresses, loading: addressesLoading, addAddress, setDefaultAddress } = useFirebaseAddresses(currentUser?.uid ?? '');
  const paths = useFirestorePaths('shopping_cart');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(addresses.length === 0);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
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

  const subtotalWithoutTax = productsLoading ? 0 : getTotalPrice(products);
  const totalTax = productsLoading ? 0 : getTotalTax(products);
  const shipping = 5;
  const finalTotal = subtotalWithoutTax + totalTax + shipping;
  const subtotalWithoutDiscount = productsLoading ? 0 : items.reduce((total, item) => {
    const product = products.find((p) => p.productId === item.productId);
    const price = Number(product?.price || item.price) || 0;
    return total + price * item.quantity;
  }, 0);

  useEffect(() => {
    if (!addressesLoading && addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddress?.addressId || null);
      setShowNewAddressForm(false);
    } else if (!addressesLoading && addresses.length === 0) {
      setShowNewAddressForm(true);
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

    if (addresses.length > 0 && !showNewAddressForm && !selectedAddressId) {
      toast.error('Please select an address');
      return;
    }

    let shippingAddress: Address;
    let finalAddressId: string | null = selectedAddressId;

    if (showNewAddressForm) {
      if (
        !newAddress.fullName ||
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

      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(newAddress.phoneNumber)) {
        toast.error('Please enter a valid 10-digit phone number');
        return;
      }

      // Ensure email is a string or null
      const email = newAddress.email && typeof newAddress.email === 'string' ? newAddress.email : null;

      try {
        console.log('Calling addAddress with:', { ...newAddress, email });
        const newAddressDoc = await addAddress({ ...newAddress, email } as Address);
        console.log('New address document:', newAddressDoc, 'ID:', newAddressDoc.id);
        finalAddressId = newAddressDoc.id;
        shippingAddress = {
          ...newAddress,
          email,
          addressId: newAddressDoc.id,
          userId: currentUser.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          companyId: 'shopping_cart',
        } as Address;
        await setDefaultAddress(newAddressDoc.id);
      } catch (err: unknown) {
        console.error('Failed to add new address:', err);
        toast.error(`Failed to add new address: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
      } catch (err: unknown) {
        console.error('Failed to set default address:', err);
        toast.error(`Failed to set default address: ${err instanceof Error ? err.message : 'Unknown error'}`);
        return;
      }
    }

    setLoading(true);
    try {
      const orderData: OrderData = {
        userId: currentUser.uid,
        companyId: 'shopping_cart',
        items: items.map((item) => {
          const product = products.find((p) => p.productId === item.productId);
          const price = Number(product?.discountedPrice || product?.price || item.price) || 0;
          const taxRate = product?.taxRate || 0;
          const taxAmount = price * item.quantity * (taxRate / 100);
          return {
            productId: item.productId,
            name: item.name,
            price,
            quantity: item.quantity,
            priceAtPurchase: price,
            taxAmount,
          };
        }),
        totalAmount: finalTotal,
        totalTax,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress,
        orderNumber: `ORD-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Sanitize orderData to remove any undefined fields
      const sanitizedOrderData: any = {
        userId: orderData.userId,
        companyId: orderData.companyId,
        items: orderData.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          priceAtPurchase: item.priceAtPurchase,
          taxAmount: item.taxAmount,
        })),
        totalAmount: orderData.totalAmount,
        totalTax: orderData.totalTax,
        status: orderData.status,
        paymentStatus: orderData.paymentStatus,
        shippingAddress: {
          fullName: orderData.shippingAddress.fullName,
          address: orderData.shippingAddress.address,
          city: orderData.shippingAddress.city,
          state: orderData.shippingAddress.state,
          zipCode: orderData.shippingAddress.zipCode,
          country: orderData.shippingAddress.country,
          phoneNumber: orderData.shippingAddress.phoneNumber,
          email: orderData.shippingAddress.email && typeof orderData.shippingAddress.email === 'string' ? orderData.shippingAddress.email : null,
          addressId: orderData.shippingAddress.addressId,
          userId: orderData.shippingAddress.userId,
          createdAt: orderData.shippingAddress.createdAt,
          updatedAt: orderData.shippingAddress.updatedAt,
          companyId: orderData.shippingAddress.companyId,
          isDefault: orderData.shippingAddress.isDefault,
        },
        orderNumber: orderData.orderNumber,
        createdAt: orderData.createdAt,
        updatedAt: orderData.updatedAt,
      };

      console.log('Placing order:', sanitizedOrderData);

      await addDoc(collection(firestore, paths.getOrdersPath()), sanitizedOrderData);
      console.log('Order placed successfully, clearing cart');
      clearCart();
      toast.success('Order placed successfully!');

      console.log('Calling onOrderComplete, type:', typeof onOrderComplete);
      if (typeof onOrderComplete === 'function') {
        onOrderComplete();
      } else {
        console.warn('onOrderComplete is not a function:', onOrderComplete);
      }

      navigate('/order-confirmation', { state: sanitizedOrderData });
    } catch (error: unknown) {
      console.error('Error placing order:', error);
      toast.error(`Failed to place order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Address, value: string) => {
    setNewAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleNewAddressForm = () => {
    setShowNewAddressForm(!showNewAddressForm);
    if (!showNewAddressForm) {
      setSelectedAddressId(null);
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
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newAddress.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
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

            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <span>Subtotal (without discount):</span>
                <span>₹{Number(subtotalWithoutDiscount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span>Subtotal (with discount):</span>
                <span>₹{Number(subtotalWithoutTax).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span>Total Tax:</span>
                <span>₹{Number(totalTax).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span>Shipping:</span>
                <span>₹{Number(shipping).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Final Total:</span>
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