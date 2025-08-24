import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebaseOrders } from '@/hooks/useFirebaseOrders';
import { Header } from '@/components/shopping/Header';

export const OrderListPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { orders, loading, error } = useFirebaseOrders(currentUser?.uid);
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);

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

  if (showLogin) {
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
          <p className="mt-2 text-muted-foreground">You need to be logged in to view your orders.</p>
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
          <p className="mt-2 text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={() => navigate('/')}>
            Return to Store
          </Button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
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
          <h2 className="text-2xl font-semibold">No Orders Found</h2>
          <p className="mt-2 text-muted-foreground">You haven't placed any orders yet.</p>
          <Button className="mt-4" onClick={() => navigate('/')}>
            Shop Now
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
              Your Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="border rounded-md p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Order #{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        Placed on: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total: ₹{order.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/orders/${order.orderId}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              className="w-full mt-6"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
