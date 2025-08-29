import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebaseAdminOrders } from '@/hooks/useAdminOrders';
import { Order } from '@/types/product';
import { 
  CheckCircle,
  Clock,
  Package,
  RefreshCw,
  Truck,
  XCircle,
  Undo,
} from 'lucide-react';

export const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { currentUser } = useAuth();
  const { orders, loading, error, updateOrderStatus } = useFirebaseAdminOrders();
  const navigate = useNavigate();
  const isAdmin = true;

  const order = orders.find(o => o.id === orderId);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'packed', label: 'Packed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'return_initiated', label: 'Return Initiated' },
    { value: 'pickup_return', label: 'Pickup Return' },
    { value: 'returned', label: 'Returned' },
  ];

  const getStatusBadge = (status: Order['status']) => {
    const variants = {
      pending: { variant: 'destructive' as const, icon: Clock },
      confirmed: { variant: 'secondary' as const, icon: CheckCircle },
      processing: { variant: 'default' as const, icon: RefreshCw },
      packed: { variant: 'default' as const, icon: Package },
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

  const getPaymentStatusBadge = (status: Order['paymentStatus']) => {
    const variants = {
      pending: 'destructive' as const,
      paid: 'default' as const,
      failed: 'destructive' as const,
      refunded: 'secondary' as const,
    };
    
    return (
      <Badge variant={variants[status]} className="text-xs">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleStatusUpdate = (orderId: string, newStatus: Order['status']) => {
    if (!isAdmin) {
      toast.error('You do not have permission to update order status');
      return;
    }
    updateOrderStatus(orderId, newStatus);
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

  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center flex-grow">
          <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
          <p className="mt-2 text-xs text-muted-foreground">You need to be an admin to access this page.</p>
          <Button className="mt-4 text-xs px-4 py-2" onClick={() => navigate('/')}>
            Return to Store
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center flex-grow">
          <Package className="mx-auto h-10 w-10 animate-spin" />
          <p className="mt-2 text-xs text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center flex-grow">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="mt-2 text-xs text-muted-foreground">{error || 'Order not found'}</p>
          <Button className="mt-4 text-xs px-4 py-2" onClick={() => navigate('/admin/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 flex-grow space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Order Details - {order.orderNumber || 'N/A'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Complete order information and management options
            </p>
          </div>
          <Button 
            variant="outline" 
            className="text-xs sm:text-sm" 
            onClick={() => navigate('/admin/orders')}
          >
            Back to Orders
          </Button>
        </div>

        <div className="grid gap-4 sm:gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs sm:text-sm">
                <div>
                  <span className="font-medium">Name:</span> {order.customer.name || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {order.customer.email || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {order.customer.phone || 'N/A'}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs sm:text-sm">
                <div>{order.shippingAddress.street || 'N/A'}</div>
                <div>
                  {order.shippingAddress.city || 'N/A'}, {order.shippingAddress.state || 'N/A'} {order.shippingAddress.zipCode || 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>

          {(order.cancellationReason || order.returnReason) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                  {order.cancellationReason ? 'Cancellation Details' : 'Return Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs sm:text-sm">
                {order.cancellationReason && (
                  <>
                    <div>
                      <span className="font-medium">Cancellation Reason:</span> {order.cancellationReason}
                    </div>
                    <div>
                      <span className="font-medium">Cancellation Message:</span> {order.cancellationMessage || 'N/A'}
                    </div>
                  </>
                )}
                {order.returnReason && (
                  <>
                    <div>
                      <span className="font-medium">Return Reason:</span> {order.returnReason.charAt(0).toUpperCase() + order.returnReason.slice(1).replace('_', ' ')}
                    </div>
                    <div>
                      <span className="font-medium">Return Message:</span> {order.returnMessage || 'N/A'}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop View: Table */}
              <div className="hidden sm:block">
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
                        <TableCell className="text-xs sm:text-sm">{item.name || 'N/A'}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{item.quantity}</TableCell>
                        <TableCell className="text-xs sm:text-sm">₹{item.originalPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-xs sm:text-sm">₹{item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-xs sm:text-sm">₹{(item.taxAmount || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-xs sm:text-sm text-right">
                          ₹{(item.quantity * item.price).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="font-medium text-xs sm:text-sm">Subtotal (without discount)</TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        ₹{(order.priceWithoutDiscount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-xs sm:text-sm">
                        ₹{(order.priceWithoutDiscount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} className="font-medium text-xs sm:text-sm">Subtotal (with discount)</TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        ₹{(order.priceWithDiscount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-xs sm:text-sm">
                        ₹{(order.priceWithDiscount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} className="font-medium text-xs sm:text-sm">Total Tax</TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        ₹{(order.totalTax || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-xs sm:text-sm">
                        ₹{(order.totalTax || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} className="font-medium text-xs sm:text-sm">Shipping</TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        ₹{(order.shippingCharge || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-xs sm:text-sm">
                        ₹{(order.shippingCharge || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} className="font-medium text-xs sm:text-sm">Subtotal (with discount, tax, shipping)</TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        ₹{(order.priceWithDiscountTaxShipping).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-xs sm:text-sm">
                        ₹{(order.priceWithDiscountTaxShipping).toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} className="font-medium text-xs sm:text-sm">Total</TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        ₹{(order.totalAmount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-xs sm:text-sm">
                        ₹{(order.totalAmount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              {/* Mobile View: Card-based layout */}
              <div className="sm:hidden space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="border rounded-md p-2 text-xs">
                    <p><span className="font-medium">Product:</span> {item.name || 'N/A'}</p>
                    <p><span className="font-medium">Quantity:</span> {item.quantity}</p>
                    <p><span className="font-medium">Original Price:</span> ₹{item.originalPrice.toFixed(2)}</p>
                    <p><span className="font-medium">Price:</span> ₹{item.price.toFixed(2)}</p>
                    <p><span className="font-medium">Tax:</span> ₹{(item.taxAmount || 0).toFixed(2)}</p>
                    <p><span className="font-medium">Total:</span> ₹{(item.quantity * item.price).toFixed(2)}</p>
                  </div>
                ))}
                <div className="border-t pt-2 text-xs">
                  <p><span className="font-medium">Subtotal (without discount):</span> ₹{(order.priceWithoutDiscount).toFixed(2)}</p>
                  <p><span className="font-medium">Subtotal (with discount):</span> ₹{(order.priceWithDiscount).toFixed(2)}</p>
                  <p><span className="font-medium">Total Tax:</span> ₹{(order.totalTax || 0).toFixed(2)}</p>
                  <p><span className="font-medium">Shipping:</span> ₹{(order.shippingCharge || 0).toFixed(2)}</p>
                  <p><span className="font-medium">Subtotal (with discount, tax, shipping):</span> ₹{(order.priceWithDiscountTaxShipping).toFixed(2)}</p>
                  <p><span className="font-medium">Total:</span> ₹{(order.totalAmount).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs sm:text-sm">Status:</span>
                {getStatusBadge(order.status)}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs sm:text-sm">Payment:</span>
                {getPaymentStatusBadge(order.paymentStatus)}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Order placed: {formatDate(order.createdAt)}
              </div>
              {order.deliveryDate && (
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Delivered: {formatDate(order.deliveryDate)}
                </div>
              )}
            </div>
            
            <div className="space-x-2">
              <Select 
                value={order.status} 
                onValueChange={(value) => handleStatusUpdate(order.id, value as Order['status'])}
                disabled={!isAdmin}
              >
                <SelectTrigger className="w-full sm:w-48 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-xs sm:text-sm">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};