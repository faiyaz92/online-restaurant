import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Package, Clock, CheckCircle, Truck, Package as PackageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebaseOrders } from '@/hooks/useFirebaseOrders';
import { Header } from '@/components/shopping/Header';
import { Footer } from '@/components/shopping/Footer';
import { Order } from '@/types/product';

export const OrderListPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { orders, loading, error } = useFirebaseOrders(currentUser?.uid);
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<{ [key: string]: boolean }>({});

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

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
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
      <Badge variant={config.variant} className="flex items-center gap-1 text-xs sm:text-sm">
        <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center flex-grow">
          <h2 className="text-xl sm:text-2xl font-semibold text-red-600">Please Log In</h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">You need to be logged in to view your orders.</p>
          <Button className="mt-4 text-sm sm:text-base px-4 sm:px-6 py-2" onClick={() => navigate('/login')}>
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center flex-grow">
          <Loader2 className="mx-auto h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">Loading orders...</p>
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center flex-grow">
          <h2 className="text-xl sm:text-2xl font-semibold text-red-600">Error</h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">{error}</p>
          <Button className="mt-4 text-sm sm:text-base px-4 sm:px-6 py-2" onClick={() => navigate('/')}>
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center flex-grow">
          <Package className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl sm:text-2xl font-semibold">No Orders Found</h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">You haven't placed any orders yet.</p>
          <Button className="mt-4 text-sm sm:text-base px-4 sm:px-6 py-2" onClick={() => navigate('/')}>
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
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-grow">
        <h2 className="text-xl sm:text-3xl font-bold tracking-tight mb-4 sm:mb-6">Your Orders</h2>
        <div className="space-y-4 sm:space-y-6">
          {sortedOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                  <CardTitle className="text-base sm:text-lg font-semibold">
                    Order #{order.orderNumber || 'N/A'}
                  </CardTitle>
                  <div className="flex items-center gap-2 sm:gap-4">
                    {getStatusBadge(order.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleOrderExpansion(order.id)}
                      aria-expanded={expandedOrders[order.id] || false}
                      aria-label={expandedOrders[order.id] ? `Collapse order ${order.orderNumber} details` : `Expand order ${order.orderNumber} details`}
                      className="p-2"
                    >
                      {expandedOrders[order.id] ? (
                        <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-2">
                  <p>Placed on: {formatDate(order.createdAt)}</p>
                  <p>Total: ₹{Number(order.totalAmount).toFixed(2)}</p>
                </div>
              </CardHeader>
              {expandedOrders[order.id] && (
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div>
                      {order.deliveryDate && (
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Delivered: {formatDate(order.deliveryDate)}
                        </p>
                      )}
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm">Product</TableHead>
                          <TableHead className="text-xs sm:text-sm">Quantity</TableHead>
                          <TableHead className="text-xs sm:text-sm">Original Price</TableHead>
                          <TableHead className="text-xs sm:text-sm">Price</TableHead>
                          <TableHead className="text-xs sm:text-sm">Tax</TableHead>
                          <TableHead className="text-xs sm:text-sm text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-xs sm:text-sm">{item.name}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{item.quantity}</TableCell>
                            <TableCell className="text-xs sm:text-sm">₹{Number(item.originalPrice).toFixed(2)}</TableCell>
                            <TableCell className="text-xs sm:text-sm">₹{Number(item.priceAtPurchase).toFixed(2)}</TableCell>
                            <TableCell className="text-xs sm:text-sm">₹{Number(item.taxAmount).toFixed(2)}</TableCell>
                            <TableCell className="text-xs sm:text-sm text-right">
                              ₹{Number(item.priceAtPurchase * item.quantity).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={4} className="font-medium text-xs sm:text-sm">Subtotal (without discount)</TableCell>
                          <TableCell />
                          <TableCell className="text-right font-medium text-xs sm:text-sm">
                            ₹{Number(order.priceWithoutDiscount).toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={4} className="font-medium text-xs sm:text-sm">Subtotal (with discount)</TableCell>
                          <TableCell />
                          <TableCell className="text-right font-medium text-xs sm:text-sm">
                            ₹{Number(order.priceWithDiscount).toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={4} className="font-medium text-xs sm:text-sm">Total Tax</TableCell>
                          <TableCell />
                          <TableCell className="text-right font-medium text-xs sm:text-sm">
                            ₹{Number(order.totalTax).toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={4} className="font-medium text-xs sm:text-sm">Shipping</TableCell>
                          <TableCell />
                          <TableCell className="text-right font-medium text-xs sm:text-sm">
                            ₹{Number(order.shippingCharge).toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={4} className="font-medium text-xs sm:text-sm">Subtotal (with discount, tax, shipping)</TableCell>
                          <TableCell />
                          <TableCell className="text-right font-medium text-xs sm:text-sm">
                            ₹{Number(order.priceWithDiscountTaxShipping).toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={4} className="font-medium text-xs sm:text-sm">Final Total</TableCell>
                          <TableCell />
                          <TableCell className="text-right font-medium text-xs sm:text-sm">
                            ₹{Number(order.totalAmount).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <div>
                      <p className="font-medium text-xs sm:text-sm">Shipping Address:</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{order.customer.phone}</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};