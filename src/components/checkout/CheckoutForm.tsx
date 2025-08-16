import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useCartStore } from '@/store/cartStore';
import { doc, addDoc, collection } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { useFirestorePaths } from '@/hooks/useFirestorePaths';
import { useUserInfo } from '@/hooks/useUserInfo';
import { toast } from 'sonner';
import { MapPin, CreditCard } from 'lucide-react';

interface CheckoutFormProps {
  onOrderComplete: () => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ onOrderComplete }) => {
  const { currentUser } = useAuth();
  const userInfo = useUserInfo();
  const { items, total, clearCart } = useCartStore();
  const paths = useFirestorePaths('abc_pvt_ltd');
  
  const [loading, setLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: userInfo.name || '',
    email: userInfo.email || '',
    phone: userInfo.mobileNumber || '',
    address: userInfo.address || '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

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

    setLoading(true);
    try {
      // Create order in Firebase
      const orderData = {
        userId: currentUser.uid,
        companyId: 'abc_pvt_ltd',
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          priceAtPurchase: item.price
        })),
        totalAmount: total,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress: shippingInfo,
        orderNumber: `ORD-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(firestore, paths.getOrdersPath()), orderData);
      
      // Clear cart
      clearCart();
      
      toast.success('Order placed successfully!');
      onOrderComplete();
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={shippingInfo.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={shippingInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={shippingInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={shippingInfo.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={shippingInfo.address}
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
                  value={shippingInfo.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={shippingInfo.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={shippingInfo.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total: ₹{total.toFixed(2)}</span>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <CreditCard className="mr-2 h-4 w-4 animate-spin" />
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