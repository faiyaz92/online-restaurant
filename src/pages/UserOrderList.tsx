import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Package, Clock, CheckCircle, Truck, Package as PackageIcon, ChevronDown, ChevronUp, XCircle, Undo } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebaseOrders } from '@/hooks/useFirebaseOrders';
import { Order } from '@/types/product';
import { toast } from 'sonner';
import { Header } from '@/components/shopping/Header';
import { Footer } from '@/components/shopping/Footer';

export const OrderListPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { orders, loading, error, updateOrderStatus } = useFirebaseOrders(currentUser?.uid);
  const navigate = useNavigate();
  const [expandedOrders, setExpandedOrders] = useState<{ [key: string]: boolean }>({});
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelMessage, setCancelMessage] = useState('');
  const [returnReason, setReturnReason] = useState<Order['returnReason']>('');
  const [returnMessage, setReturnMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cancelReasons = [
    'Changed mind',
    'Found better price elsewhere',
    'Order placed by mistake',
    'Other',
  ];

  const returnReasons: Order['returnReason'][] = [
    'defective_product',
    'wrong_item',
    'not_as_described',
    'changed_mind',
    'other',
  ];

  const handleLogin = () => {
    navigate('/login');
  };

  const handleOrdersClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    navigate('/orders');
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
      cancelled: { variant: 'destructive' as const, icon: XCircle },
      return_initiated: { variant: 'secondary' as const, icon: Undo },
      pickup_return: { variant: 'secondary' as const, icon: Truck },
      returned: { variant: 'default' as const, icon: CheckCircle },
    };
    const config = variants[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 text-xs">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  const isReturnEligible = (order: Order) => {
    if (order.status !== 'delivered' || !order.deliveryDate) return false;
    const deliveryDate = new Date(order.deliveryDate);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - deliveryDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff <= 3;
  };

  const handleCancelOrder = (order: Order) => {
    setSelectedOrder(order);
    setCancelReason('');
    setCancelMessage('');
    setIsCancelDialogOpen(true);
  };

  const handleReturnOrder = (order: Order) => {
    setSelectedOrder(order);
    setReturnReason('');
    setReturnMessage('');
    setIsReturnDialogOpen(true);
  };

  const submitCancellation = async () => {
    if (!selectedOrder || !cancelReason) {
      toast.error('Please select a cancellation reason');
      return;
    }
    setIsSubmitting(true);
    try {
      console.log('Submitting cancellation for order:', selectedOrder.id, { cancelReason, cancelMessage });
      await updateOrderStatus(selectedOrder.id, 'cancelled', {
        cancellationReason: cancelReason,
        cancellationMessage: cancelMessage,
      });
      toast.success('Order cancelled successfully');
      setIsCancelDialogOpen(false);
      setSelectedOrder(null);
    } catch (err: any) {
      console.error('Cancellation error:', err.message, err.code, err.stack);
      toast.error(`Failed to cancel order: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitReturn = async () => {
    if (!selectedOrder || !returnReason) {
      toast.error('Please select a return reason');
      return;
    }
    setIsSubmitting(true);
    try {
      console.log('Submitting return for order:', selectedOrder.id, { returnReason, returnMessage });
      await updateOrderStatus(selectedOrder.id, 'return_initiated', {
        returnReason: returnReason,
        returnMessage: returnMessage,
      });
      toast.success('Return request submitted successfully');
      setIsReturnDialogOpen(false);
      setSelectedOrder(null);
    } catch (err: any) {
      console.error('Return error:', err.message, err.code, err.stack);
      toast.error(`Failed to submit return request: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      <Header
        onLogin={handleLogin}
        onLogout={logout}
        onAdminClick={() => navigate('/admin')}
        onOrdersClick={handleOrdersClick}
      />
      <div className="w-full max-w-4xl mx-auto px-4 py-6 flex-grow">
        {currentUser ? (
          <>
            {loading ? (
              <div className="text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                <p className="mt-2 text-xs text-muted-foreground">Loading orders...</p>
              </div>
            ) : error ? (
              <div className="text-center">
                <h2 className="text-xl font-semibold text-red-600">Error</h2>
                <p className="mt-2 text-xs text-muted-foreground">{error}</p>
                <Button className="mt-4 text-xs px-4 py-2" onClick={() => navigate('/')}>
                  Return to Store
                </Button>
              </div>
            ) : sortedOrders.length === 0 ? (
              <div className="text-center">
                <Package className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">No Orders Found</h2>
                <p className="mt-2 text-xs text-muted-foreground">You haven't placed any orders yet.</p>
                <Button className="mt-4 text-xs px-4 py-2" onClick={() => navigate('/')}>
                  Shop Now
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold tracking-tight mb-4">Your Orders</h2>
                <div className="space-y-4">
                  {sortedOrders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader className="p-3">
                        <div className="flex flex-row justify-between items-center flex-nowrap gap-2">
                          <CardTitle className="text-base font-semibold truncate">
                            Order #{order.orderNumber || 'N/A'}
                          </CardTitle>
                          <div className="flex items-center gap-2 shrink-0">
                            {getStatusBadge(order.status)}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleOrderExpansion(order.id)}
                              aria-expanded={expandedOrders[order.id] || false}
                              aria-label={expandedOrders[order.id] ? `Collapse order ${order.orderNumber} details` : `Expand order ${order.orderNumber} details`}
                              className="p-1.5"
                            >
                              {expandedOrders[order.id] ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <p>Placed on: {formatDate(order.createdAt)}</p>
                          <p>Total: ₹{Number(order.totalAmount).toFixed(2)}</p>
                        </div>
                      </CardHeader>
                      {expandedOrders[order.id] && (
                        <CardContent className="p-3">
                          <div className="space-y-4">
                            <div>
                              {order.deliveryDate && (
                                <p className="text-xs text-muted-foreground">
                                  Delivered: {formatDate(order.deliveryDate)}
                                </p>
                              )}
                              {(order.cancellationReason || order.returnReason) && (
                                <div className="mt-2">
                                  <p className="font-medium text-xs">
                                    {order.cancellationReason ? 'Cancellation Details' : 'Return Details'}:
                                  </p>
                                  {order.cancellationReason && (
                                    <>
                                      <p className="text-xs text-muted-foreground">
                                        Reason: {order.cancellationReason.charAt(0).toUpperCase() + order.cancellationReason.slice(1).replace('_', ' ')}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Message: {order.cancellationMessage || 'N/A'}
                                      </p>
                                    </>
                                  )}
                                  {order.returnReason && (
                                    <>
                                      <p className="text-xs text-muted-foreground">
                                        Reason: {order.returnReason.charAt(0).toUpperCase() + order.returnReason.slice(1).replace('_', ' ')}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Message: {order.returnMessage || 'N/A'}
                                      </p>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="text-xs">Product</TableHead>
                                    <TableHead className="text-xs">Quantity</TableHead>
                                    <TableHead className="text-xs">Original Price</TableHead>
                                    <TableHead className="text-xs">Price</TableHead>
                                    <TableHead className="text-xs">Tax</TableHead>
                                    <TableHead className="text-xs text-right">Total</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {order.items.map((item, index) => (
                                    <TableRow key={index}>
                                      <TableCell className="text-xs">{item.name || 'N/A'}</TableCell>
                                      <TableCell className="text-xs">{item.quantity}</TableCell>
                                      <TableCell className="text-xs">₹{Number(item.originalPrice).toFixed(2)}</TableCell>
                                      <TableCell className="text-xs">₹{Number(item.price).toFixed(2)}</TableCell>
                                      <TableCell className="text-xs">₹{Number(item.taxAmount || 0).toFixed(2)}</TableCell>
                                      <TableCell className="text-xs text-right">
                                        ₹{Number(item.quantity * item.price).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  <TableRow>
                                    <TableCell colSpan={4} className="font-medium text-xs">Subtotal (without discount)</TableCell>
                                    <TableCell />
                                    <TableCell className="text-right font-medium text-xs">
                                      ₹{Number(order.priceWithoutDiscount).toFixed(2)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell colSpan={4} className="font-medium text-xs">Subtotal (with discount)</TableCell>
                                    <TableCell />
                                    <TableCell className="text-right font-medium text-xs">
                                      ₹{Number(order.priceWithDiscount).toFixed(2)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell colSpan={4} className="font-medium text-xs">Total Tax</TableCell>
                                    <TableCell />
                                    <TableCell className="text-right font-medium text-xs">
                                      ₹{Number(order.totalTax || 0).toFixed(2)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell colSpan={4} className="font-medium text-xs">Shipping</TableCell>
                                    <TableCell />
                                    <TableCell className="text-right font-medium text-xs">
                                      ₹{Number(order.shippingCharge || 0).toFixed(2)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell colSpan={4} className="font-medium text-xs">Subtotal (with discount, tax, shipping)</TableCell>
                                    <TableCell />
                                    <TableCell className="text-right font-medium text-xs">
                                      ₹{Number(order.priceWithDiscountTaxShipping).toFixed(2)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell colSpan={4} className="font-medium text-xs">Final Total</TableCell>
                                    <TableCell />
                                    <TableCell className="text-right font-medium text-xs">
                                      ₹{Number(order.totalAmount).toFixed(2)}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                            <div>
                              <p className="font-medium text-xs">Shipping Address:</p>
                              <p className="text-xs text-muted-foreground">
                                {order.shippingAddress.street || 'N/A'}, {order.shippingAddress.city || 'N/A'}, {order.shippingAddress.state || 'N/A'} {order.shippingAddress.zipCode || 'N/A'}
                              </p>
                              <p className="text-xs text-muted-foreground">{order.customer.phone || 'N/A'}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {(order.status === 'pending' || order.status === 'confirmed') && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCancelOrder(order)}
                                  className="text-xs px-3 py-1"
                                  aria-label={`Cancel order ${order.orderNumber}`}
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting && selectedOrder?.id === order.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    'Cancel Order'
                                  )}
                                </Button>
                              )}
                              {isReturnEligible(order) && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleReturnOrder(order)}
                                  className="text-xs px-3 py-1"
                                  aria-label={`Request return for order ${order.orderNumber}`}
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting && selectedOrder?.id === order.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    'Request Return'
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>

                {/* Cancellation Dialog */}
                <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Order #{selectedOrder?.orderNumber || 'N/A'}</DialogTitle>
                      <DialogDescription>Please provide a reason for cancellation.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Select value={cancelReason} onValueChange={setCancelReason} disabled={isSubmitting}>
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {cancelReasons.map((reason) => (
                            <SelectItem key={reason} value={reason} className="text-xs">
                              {reason.charAt(0).toUpperCase() + reason.slice(1).replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Additional comments (optional)"
                        value={cancelMessage}
                        onChange={(e) => setCancelMessage(e.target.value)}
                        className="text-xs"
                        disabled={isSubmitting}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsCancelDialogOpen(false)}
                        className="text-xs"
                        disabled={isSubmitting}
                      >
                        Close
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={submitCancellation}
                        className="text-xs"
                        disabled={isSubmitting || !cancelReason}
                      >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Cancellation'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Return Dialog */}
                <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Return Order #{selectedOrder?.orderNumber || 'N/A'}</DialogTitle>
                      <DialogDescription>Please provide a reason for the return.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Select value={returnReason} onValueChange={setReturnReason} disabled={isSubmitting}>
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {returnReasons.map((reason) => (
                            <SelectItem key={reason} value={reason} className="text-xs">
                              {reason.charAt(0).toUpperCase() + reason.slice(1).replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Additional comments (optional)"
                        value={returnMessage}
                        onChange={(e) => setReturnMessage(e.target.value)}
                        className="text-xs"
                        disabled={isSubmitting}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsReturnDialogOpen(false)}
                        className="text-xs"
                        disabled={isSubmitting}
                      >
                        Close
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={submitReturn}
                        className="text-xs"
                        disabled={isSubmitting || !returnReason}
                      >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Return Request'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">Please Log In</h2>
            <p className="mt-2 text-xs text-muted-foreground">You need to be logged in to view your orders.</p>
            <Button className="mt-4 text-xs px-4 py-2" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
