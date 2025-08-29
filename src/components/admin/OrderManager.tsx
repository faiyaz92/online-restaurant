import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Eye, 
  MoreHorizontal,
  Truck,
  Clock,
  CheckCircle,
  Package,
  RefreshCw,
  XCircle,
  Undo,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebaseAdminOrders } from '@/hooks/useAdminOrders';
import { Order } from '@/types/product';

export const OrderManager: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { orders, loading, error, updateOrderStatus } = useFirebaseAdminOrders();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const isAdmin = true;

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
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

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedOrder(null); // Clear selected order to prevent stale state
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
          <p className="mt-2 text-xs text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center flex-grow">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="mt-2 text-xs text-muted-foreground">{error}</p>
          <Button className="mt-4 text-xs px-4 py-2" onClick={() => navigate('/')}>
            Return to Store
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-grow space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Orders</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage and track customer orders
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-xs sm:text-sm"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 text-xs sm:text-sm">
                  <SelectValue placeholder="Filter by status" />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Orders ({filteredOrders.length})</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Recent orders from your customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Desktop View: Table */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Order</TableHead>
                    <TableHead className="text-xs sm:text-sm">Customer</TableHead>
                    <TableHead className="text-xs sm:text-sm">Items</TableHead>
                    <TableHead className="text-xs sm:text-sm">Total</TableHead>
                    <TableHead className="text-xs sm:text-sm">Tax</TableHead>
                    <TableHead className="text-xs sm:text-sm">Shipping</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-xs sm:text-sm">Payment</TableHead>
                    <TableHead className="text-xs sm:text-sm">Date</TableHead>
                    <TableHead className="text-xs sm:text-sm text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        {order.orderNumber || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-xs sm:text-sm">{order.customer.name || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">{order.customer.email || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {order.items.slice(0, 2).map((item, index) => (
                            <div key={index} className="text-xs sm:text-sm">
                              {item.quantity}x {item.name}
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{order.items.length - 2} more
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        ₹{order.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        ₹{(order.totalTax || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        ₹{(order.shippingCharge || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                              disabled={order.status !== 'pending' || !isAdmin}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirm Order
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(order.id, 'shipped')}
                              disabled={!['confirmed', 'processing', 'packed'].includes(order.status) || !isAdmin}
                            >
                              <Truck className="h-4 w-4 mr-2" />
                              Mark as Shipped
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(order.id, 'delivered')}
                              disabled={order.status !== 'shipped' || !isAdmin}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Delivered
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(order.id, 'pickup_return')}
                              disabled={order.status !== 'return_initiated' || !isAdmin}
                            >
                              <Truck className="h-4 w-4 mr-2" />
                              Arrange Pickup
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(order.id, 'returned')}
                              disabled={order.status !== 'pickup_return' || !isAdmin}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Returned
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Mobile View: Card-based layout */}
            <div className="sm:hidden space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-3">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Order #{order.orderNumber || 'N/A'}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p><span className="font-medium">Customer:</span> {order.customer.name || 'N/A'}</p>
                      <p><span className="font-medium">Email:</span> {order.customer.email || 'N/A'}</p>
                      <p><span className="font-medium">Items:</span></p>
                      {order.items.slice(0, 2).map((item, index) => (
                        <p key={index} className="pl-2">{item.quantity}x {item.name}</p>
                      ))}
                      {order.items.length > 2 && (
                        <p className="pl-2 text-muted-foreground">+{order.items.length - 2} more</p>
                      )}
                      <p><span className="font-medium">Total:</span> ₹{order.totalAmount.toFixed(2)}</p>
                      <p><span className="font-medium">Tax:</span> ₹{(order.totalTax || 0).toFixed(2)}</p>
                      <p><span className="font-medium">Shipping:</span> ₹{(order.shippingCharge || 0).toFixed(2)}</p>
                      <p><span className="font-medium">Payment:</span> {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}</p>
                      <p><span className="font-medium">Date:</span> {formatDate(order.createdAt)}</p>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                              disabled={order.status !== 'pending' || !isAdmin}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirm Order
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(order.id, 'shipped')}
                              disabled={!['confirmed', 'processing', 'packed'].includes(order.status) || !isAdmin}
                            >
                              <Truck className="h-4 w-4 mr-2" />
                              Mark as Shipped
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(order.id, 'delivered')}
                              disabled={order.status !== 'shipped' || !isAdmin}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Delivered
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(order.id, 'pickup_return')}
                              disabled={order.status !== 'return_initiated' || !isAdmin}
                            >
                              <Truck className="h-4 w-4 mr-2" />
                              Arrange Pickup
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(order.id, 'returned')}
                              disabled={order.status !== 'pickup_return' || !isAdmin}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Returned
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Dialog open={isDetailDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-3xl sm:max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Order Details - {selectedOrder?.orderNumber || 'N/A'}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Complete order information and management options
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="grid gap-4 sm:gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs sm:text-sm">
                      <div>
                        <span className="font-medium">Name:</span> {selectedOrder.customer.name || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {selectedOrder.customer.email || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {selectedOrder.customer.phone || 'N/A'}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs sm:text-sm">
                      <div>{selectedOrder.shippingAddress.street || 'N/A'}</div>
                      <div>
                        {selectedOrder.shippingAddress.city || 'N/A'}, {selectedOrder.shippingAddress.state || 'N/A'} {selectedOrder.shippingAddress.zipCode || 'N/A'}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {(selectedOrder.cancellationReason || selectedOrder.returnReason) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">
                        {selectedOrder.cancellationReason ? 'Cancellation Details' : 'Return Details'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs sm:text-sm">
                      {selectedOrder.cancellationReason && (
                        <>
                          <div>
                            <span className="font-medium">Cancellation Reason:</span> {selectedOrder.cancellationReason}
                          </div>
                          <div>
                            <span className="font-medium">Cancellation Message:</span> {selectedOrder.cancellationMessage || 'N/A'}
                          </div>
                        </>
                      )}
                      {selectedOrder.returnReason && (
                        <>
                          <div>
                            <span className="font-medium">Return Reason:</span> {selectedOrder.returnReason.charAt(0).toUpperCase() + selectedOrder.returnReason.slice(1).replace('_', ' ')}
                          </div>
                          <div>
                            <span className="font-medium">Return Message:</span> {selectedOrder.returnMessage || 'N/A'}
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
                          {selectedOrder.items.map((item, index) => (
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
                              ₹{(selectedOrder.priceWithoutDiscount).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-xs sm:text-sm">
                              ₹{(selectedOrder.priceWithoutDiscount).toFixed(2)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={4} className="font-medium text-xs sm:text-sm">Subtotal (with discount)</TableCell>
                            <TableCell className="font-medium text-xs sm:text-sm">
                              ₹{(selectedOrder.priceWithDiscount).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-xs sm:text-sm">
                              ₹{(selectedOrder.priceWithDiscount).toFixed(2)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={4} className="font-medium text-xs sm:text-sm">Total Tax</TableCell>
                            <TableCell className="font-medium text-xs sm:text-sm">
                              ₹{(selectedOrder.totalTax || 0).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-xs sm:text-sm">
                              ₹{(selectedOrder.totalTax || 0).toFixed(2)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={4} className="font-medium text-xs sm:text-sm">Shipping</TableCell>
                            <TableCell className="font-medium text-xs sm:text-sm">
                              ₹{(selectedOrder.shippingCharge || 0).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-xs sm:text-sm">
                              ₹{(selectedOrder.shippingCharge || 0).toFixed(2)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={4} className="font-medium text-xs sm:text-sm">Subtotal (with discount, tax, shipping)</TableCell>
                            <TableCell className="font-medium text-xs sm:text-sm">
                              ₹{(selectedOrder.priceWithDiscountTaxShipping).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-xs sm:text-sm">
                              ₹{(selectedOrder.priceWithDiscountTaxShipping).toFixed(2)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={4} className="font-medium text-xs sm:text-sm">Total</TableCell>
                            <TableCell className="font-medium text-xs sm:text-sm">
                              ₹{(selectedOrder.totalAmount).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-xs sm:text-sm">
                              ₹{(selectedOrder.totalAmount).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    {/* Mobile View: Card-based layout */}
                    <div className="sm:hidden space-y-2">
                      {selectedOrder.items.map((item, index) => (
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
                        <p><span className="font-medium">Subtotal (without discount):</span> ₹{(selectedOrder.priceWithoutDiscount).toFixed(2)}</p>
                        <p><span className="font-medium">Subtotal (with discount):</span> ₹{(selectedOrder.priceWithDiscount).toFixed(2)}</p>
                        <p><span className="font-medium">Total Tax:</span> ₹{(selectedOrder.totalTax || 0).toFixed(2)}</p>
                        <p><span className="font-medium">Shipping:</span> ₹{(selectedOrder.shippingCharge || 0).toFixed(2)}</p>
                        <p><span className="font-medium">Subtotal (with discount, tax, shipping):</span> ₹{(selectedOrder.priceWithDiscountTaxShipping).toFixed(2)}</p>
                        <p><span className="font-medium">Total:</span> ₹{(selectedOrder.totalAmount).toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs sm:text-sm">Status:</span>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs sm:text-sm">Payment:</span>
                      {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Order placed: {formatDate(selectedOrder.createdAt)}
                    </div>
                    {selectedOrder.deliveryDate && (
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Delivered: {formatDate(selectedOrder.deliveryDate)}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-x-2">
                    <Select 
                      value={selectedOrder.status} 
                      onValueChange={(value) => handleStatusUpdate(selectedOrder.id, value as Order['status'])}
                      disabled={!isAdmin}
                    >
                      <SelectTrigger className="w-full sm:w-48 text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.slice(1).map(option => (
                          <SelectItem key={option.value} value={option.value} className="text-xs sm:text-sm">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
              <Package className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Orders will appear here once customers start placing them'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};