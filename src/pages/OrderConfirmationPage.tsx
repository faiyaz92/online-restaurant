import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package } from 'lucide-react';
import { Address } from '@/types/product';
import { Header } from '@/components/shopping/Header';
import { useAuth } from '@/contexts/AuthContext';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  priceAtPurchase: number;
}

interface OrderConfirmationData {
  orderNumber: string;
  shippingAddress: Address;
  items: OrderItem[];
  totalAmount: number;
}

export const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const orderData = location.state as OrderConfirmationData | undefined;
  const [showLogin, setShowLogin] = useState(false);

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleLogin = () => {
    setShowLogin(true);
  };

  const handleOrdersClick = () => {
    navigate('/orders');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header
          onLogin={handleLogin}
          onLogout={logout}
          onAdminClick={handleAdminClick}
          onOrdersClick={handleOrdersClick}
        />
        <div className="max-w-3xl mx-auto p-6 text-center">
          <h2 className="text-2xl font-semibold text-red-600">No Order Data Available</h2>
          <p className="mt-2 text-muted-foreground">Please place an order from the checkout page.</p>
          <Button className="mt-4" onClick={() => navigate('/')}>
            Return to Store
          </Button>
        </div>
      </div>
    );
  }

  const { orderNumber, shippingAddress, items, totalAmount } = orderData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header
        onLogin={handleLogin}
        onLogout={logout}
        onAdminClick={handleAdminClick}
        onOrdersClick={handleOrdersClick}
      />
      <div className="max-w-3xl mx-auto p-6">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <CardTitle className="text-2xl font-bold mt-2">Order Confirmed!</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Thank you for your purchase.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium">Order Number:</span> {orderNumber}
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold">Shipping Address</h3>
              <div className="mt-2 text-sm text-muted-foreground space-y-1">
                <p>{shippingAddress.fullName}</p>
                <p>{shippingAddress.address}</p>
                <p>
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                </p>
                <p>{shippingAddress.country}</p>
                <p>{shippingAddress.phoneNumber}</p>
                <p>{shippingAddress.email}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold">Order Items</h3>
              <div className="mt-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} | Price: ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-lg font-semibold">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                className="flex-1 mt-6"
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </Button>
              <Button
                className="flex-1 mt-6"
                variant="outline"
                onClick={() => navigate('/orders')}
              >
                View All Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
