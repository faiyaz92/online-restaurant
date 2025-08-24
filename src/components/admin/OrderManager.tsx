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
  DialogTrigger,
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
import { Header } from '@/components/shopping/Header';
import { Role } from '@/types/auth';

interface Order {
  id: string;
  orderNumber: string | null;
  customer: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
    taxAmount: number;
  }[];
  totalAmount: number;
  totalTax: number;
  status: 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: string;
  deliveryDate?: string;
}

export const OrderManager: React.FC = () => {
  const { currentUser, logout, userInfo } = useAuth();
  const { orders, loading, error, updateOrderStatus } = useFirebaseAdminOrders();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const isAdmin = true;

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

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'packed', label: 'Packed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
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
      cancelled: { variant: 'destructive' as const, icon: Clock }
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

  const getPaymentStatusBadge = (status: Order['paymentStatus']) => {
    const variants = {
      pending: 'destructive' as const,
      paid: 'default' as const,
      failed: 'destructive' as const,
      refunded: 'secondary' as const
    };
    
    return (
      <Badge variant={variants[status]}>
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
    console.log('Viewing order:', order);
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header
          onLogin={handleLogin}
          onLogout={logout}
          onAdminClick={handleAdminClick}
          onOrdersClick={handleOrdersClick}
        />
        <div className="max-w-3xl mx-auto p-6 text-center">
          <h2 className="text-2xl font-semibold text-red-600">Access Denied</h2>
          <p className="mt-2 text-muted-foreground">You need to be an admin to access this page.</p>
          <Button className="mt-4" onClick={() => navigate('/')}>
            Return to Store
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header
          onLogin={handleLogin}
          onLogout={logout}
          onAdminClick={handleAdminClick}
          onOrdersClick={handleOrdersClick}
        />
        <div className="max-w-3xl mx-auto p-6 text-center">
          <Package className="mx-auto h-12 w-12 animate-spin" />
          <p className="mt-2 text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header
        onLogin={handleLogin}
        onLogout={logout}
        onAdminClick={handleAdminClick}
        onOrdersClick={handleOrdersClick}
      />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
            <p className="text-muted-foreground">
              Manage and track customer orders
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders ({filteredOrders.length})</CardTitle>
            <CardDescription>
              Recent orders from your customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderNumber || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer.name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.customer.email || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div key={index} className="text-sm">
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-sm text-muted-foreground">
                            +{order.items.length - 2} more
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{order.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{(order.totalTax || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </TableCell>
                    <TableCell className="text-sm">
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Order Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Order Details - {selectedOrder?.orderNumber || 'N/A'}
              </DialogTitle>
              <DialogDescription>
                Complete order information and management options
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="grid gap-6">
                {/* Order Summary */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
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
                      <CardTitle className="text-lg">Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>{selectedOrder.shippingAddress.street || 'N/A'}</div>
                      <div>
                        {selectedOrder.shippingAddress.city || 'N/A'}, {selectedOrder.shippingAddress.state || 'N/A'} {selectedOrder.shippingAddress.zipCode || 'N/A'}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Tax</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.name || 'N/A'}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>₹{item.price.toFixed(2)}</TableCell>
                            <TableCell>₹{(item.taxAmount || 0).toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              ₹{(item.quantity * item.price).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="font-medium">Subtotal</TableCell>
                          <TableCell className="font-medium">
                            ₹{(selectedOrder.items.reduce((sum, item) => sum + (item.taxAmount || 0), 0)).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{(selectedOrder.items.reduce((sum, item) => sum + item.quantity * item.price, 0)).toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={4} className="font-medium">Total Tax</TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{(selectedOrder.totalTax || 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={4} className="font-medium">Total</TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{selectedOrder.totalAmount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Order Status */}
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Payment:</span>
                      {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Order placed: {formatDate(selectedOrder.createdAt)}
                    </div>
                    {selectedOrder.deliveryDate && (
                      <div className="text-sm text-muted-foreground">
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
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.slice(1).map(option => (
                          <SelectItem key={option.value} value={option.value}>
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
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground text-center">
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