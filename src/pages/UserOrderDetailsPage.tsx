import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebaseOrders, Order } from '@/hooks/useFirebaseOrders';
import { Header } from '@/components/shopping/Header';

export const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { currentUser, logout } = useAuth();
  const { getOrderById } = useFirebaseOrders(currentUser?.uid);
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!currentUser || !orderId) {
      setError('Please login to view order details');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      const orderData = await getOrderById(orderId);
      setOrder(orderData);
      setLoading(false);
    };

    fetchOrder();
  }, [currentUser, orderId, getOrderById]);

  const handleCartClick = () => {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }
    navigate('/cart');
  };

  const handleLogin = () => {
    setShowLogin(true);
  };

  const handleOrdersClick = () => {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }
    navigate('/orders');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  if (showLogin || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header
          onCartClick={handleCartClick}
          onLogin={handleLogin}
          onLogout={logout}
          onAdminClick={handleAdminClick}
          onOrdersClick={handleOrdersClick}
        />
        <div className="max-w-3xl mx-auto p-6 text-center">
          <h2 className="text-2xl font-semibold text-red-600">Please Log In</h2>
          <p className="mt-2 text-muted-foreground">You need to be logged in to view order details.</p>
          <Button className="mt-4" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header
          onCartClick={handleCartClick}
          onLogin={handleLogin}
          onLogout={logout}
          onAdminClick={handleAdminClick}
          onOrdersClick={handleOrdersClick}
        />
        <div className="max-w-3xl mx-auto p-6 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header
          onCartClick={handleCartClick}
          onLogin={handleLogin}
          onLogout={logout}
          onAdminClick={handleAdminClick}
          onOrdersClick={handleOrdersClick}
        />
        <div className="max-w-3xl mx-auto p-6 text-center">
          <h2 className="text-2xl font-semibold text-red-600">Error</h2>
          <p className="mt-2 text-muted-foreground">{error || 'Order not found'}</p>
          <Button className="mt-4" onClick={() => navigate('/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header
        onCartClick={handleCartClick}
        onLogin={handleLogin}
        onLogout={logout}
        onAdminClick={handleAdminClick}
        onOrdersClick={handleOrdersClick}
      />
      <div className="max-w-3xl mx-auto p-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Package className="h-6 w-6" />
              Order #{order.orderNumber}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Placed on: {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold">Order Details</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium">Status:</span> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Payment Status:</span> {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold">Shipping Address</h3>
              <div className="mt-2 text-sm text-muted-foreground space-y-1">
                <p>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p>{order.shippingAddress.phoneNumber}</p>
                <p>{order.shippingAddress.email}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold">Order Items</h3>
              <div className="mt-2 space-y-4">
                {order.items.map((item) => (
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
                <span className="text-lg font-semibold">₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="w-full mt-6"
              onClick={() => navigate('/orders')}
            >
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};