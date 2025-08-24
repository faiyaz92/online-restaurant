import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Package, Clock, CheckCircle, Truck, Package as PackageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebaseOrders } from '@/hooks/useFirebaseOrders';
import { Header } from '@/components/shopping/Header';
import { Footer } from '@/components/shopping/Footer'; // Import the Footer component
import { Order } from '@/types/product';

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
    navigate('/login');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: Order['status']) => {
    const variants = {
      pending: { variant: 'destructive' as const, icon: Clock },
      confirmed: { variant: 'secondary' as const, icon: CheckCircle },
      processing: { variant: 'default' as const, icon: PackageIcon },
      packed: { variant: 'default' as const, icon: PackageIcon },
      shipped: { variant: 'default' as const, icon: Truck },
      delivered: { variant: 'default' as const, icon: CheckCircle },
      cancelled: { variant: 'destructive' as const, icon: Clock },
    };
    const config = variants[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Sort orders by createdAt in descending order
  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (showLogin || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
        <Header
          onLogin={handleLogin}
          onLogout={logout}
          onAdminClick={handleAdminClick}
          onOrdersClick={handleOrdersClick}
        />
        <div className="max-w-3xl mx-auto p-6 text-center flex-grow">
          <h2 className="text-2xl font-semibold text-red-600">Please Log In</h2>
          <p className="mt-2 text-muted-foreground">You need to be logged in to view your orders.</p>
          <Button className="mt-4" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
        <Header
          onLogin={handleLogin}
          onLogout={logout}
          onAdminClick={handleAdminClick}
          onOrdersClick={handleOrdersClick}
        />
        <div className="max-w-3xl mx-auto p-6 text-center flex-grow">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-muted-foreground">Loading orders...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
        <Header
          onLogin={handleLogin}
          onLogout={logout}
          onAdminClick={handleAdminClick}
          onOrdersClick={handleOrdersClick}
        />
        <div className="max-w-3xl mx-auto p-6 text-center flex-grow">
          <h2 className="text-2xl font-semibold text-red-600">Error</h2>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={() => navigate('/')}>
            Return to Store
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (sortedOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
        <Header
          onLogin={handleLogin}
          onLogout={logout}
          onAdminClick={handleAdminClick}
          onOrdersClick={handleOrdersClick}
        />
        <div className="max-w-3xl mx-auto p-6 text-center flex-grow">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold">No Orders Found</h2>
          <p className="mt-2 text-muted-foreground">You haven't placed any orders yet.</p>
          <Button className="mt-4" onClick={() => navigate('/')}>
            Shop Now
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      <Header
        onLogin={handleLogin}
        onLogout={logout}
        onAdminClick={handleAdminClick}
        onOrdersClick={handleOrdersClick}
      />
      <div className="max-w-4xl mx-auto p-6 flex-grow">
        <h2 className="text-3xl font-bold tracking-tight mb-6">Your Orders</h2>
        <div className="space-y-6">
          {sortedOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Order #{order.orderNumber || 'N/A'}</span>
                  {getStatusBadge(order.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Placed on: {formatDate(order.createdAt)}
                    </p>
                    {order.deliveryDate && (
                      <p className="text-sm text-muted-foreground">
                        Delivered: {formatDate(order.deliveryDate)}
                      </p>
                    )}
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Original Price</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Tax</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{Number(item.originalPrice).toFixed(2)}</TableCell>
                          <TableCell>₹{Number(item.priceAtPurchase).toFixed(2)}</TableCell>
                          <TableCell>₹{Number(item.taxAmount).toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            ₹{Number(item.priceAtPurchase * item.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} className="font-medium">Subtotal (without discount)</TableCell>
                        <TableCell />
                        <TableCell className="text-right font-medium">
                          ₹{Number(order.priceWithoutDiscount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} className="font-medium">Subtotal (with discount)</TableCell>
                        <TableCell />
                        <TableCell className="text-right font-medium">
                          ₹{Number(order.priceWithDiscount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} className="font-medium">Total Tax</TableCell>
                        <TableCell />
                        <TableCell className="text-right font-medium">
                          ₹{Number(order.totalTax).toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} className="font-medium">Shipping</TableCell>
                        <TableCell />
                        <TableCell className="text-right font-medium">
                          ₹{Number(order.shippingCharge).toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} className="font-medium">Subtotal (with discount, tax, shipping)</TableCell>
                        <TableCell />
                        <TableCell className="text-right font-medium">
                          ₹{Number(order.priceWithDiscountTaxShipping).toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} className="font-medium">Final Total</TableCell>
                        <TableCell />
                        <TableCell className="text-right font-medium">
                          ₹{Number(order.totalAmount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <div>
                    <p className="font-medium">Shipping Address:</p>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                    <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};