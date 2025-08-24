import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Eye
} from 'lucide-react';
import { useFirebaseAdminOrders } from '@/hooks/useAdminOrders';
import { useFirebaseProducts } from '@/hooks/useFirebaseProducts';

export const Dashboard: React.FC = () => {
  const { orders, loading: ordersLoading } = useFirebaseAdminOrders();
  const { products, loading: productsLoading } = useFirebaseProducts();

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const activeProducts = products.length;
  const totalCustomers = 1420; // Static data as per requirement

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: '+20.1%',
      changeType: 'positive' as const,
      icon: DollarSign,
      description: 'from last month'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      change: '+15.2%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
      description: 'orders this month'
    },
    {
      title: 'Active Products',
      value: activeProducts.toLocaleString(),
      change: '+5.4%',
      changeType: 'positive' as const,
      icon: Package,
      description: 'products in stock'
    },
    {
      title: 'Total Customers',
      value: totalCustomers.toLocaleString(),
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Users,
      description: 'registered users'
    }
  ];

  // Get recent orders (last 5)
  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(order => ({
      id: order.orderNumber,
      customer: order.customer.name,
      amount: `$${order.totalAmount.toFixed(2)}`,
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
      time: new Date(order.createdAt).toLocaleString()
    }));

  // Calculate top products
  const topProducts = products
    .map(product => ({
      name: product.name,
      sales: orders.reduce((sum, order) => 
        sum + order.items.reduce((itemSum, item) => 
          item.productId === product.productId ? itemSum + item.quantity : itemSum, 0
        ), 0),
      revenue: orders.reduce((sum, order) => 
        sum + order.items.reduce((itemSum, item) => 
          item.productId === product.productId ? itemSum + (item.quantity * item.priceAtPurchase) : itemSum, 0
        ), 0),
      image: product.images[0] || '/placeholder.svg'
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)
    .map(product => ({
      ...product,
      revenue: `$${product.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }));

  const getStatusBadge = (status: string) => {
    const variants = {
      'Delivered': 'default',
      'Processing': 'secondary',
      'Shipped': 'outline',
      'Confirmed': 'secondary',
      'Pending': 'destructive'
    };
    return variants[status as keyof typeof variants] || 'secondary';
  };

  if (ordersLoading || productsLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs">
                <Badge variant={stat.changeType === 'positive' ? 'default' : 'destructive'}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.change}
                </Badge>
                <span className="text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Orders */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest orders from your customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {order.id} - {order.customer}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.time}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusBadge(order.status) as any}>
                      {order.status}
                    </Badge>
                    <div className="font-medium">{order.amount}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <NavLink to="/admin/orders">
                  <Eye className="h-4 w-4 mr-2" />
                  View all orders
                </NavLink>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>
              Best performing products this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 rounded-md object-cover"
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {product.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {product.sales} sales
                    </p>
                  </div>
                  <div className="font-medium text-sm">
                    {product.revenue}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your store efficiently with these shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button asChild className="h-20 flex-col gap-2">
              <NavLink to="/admin/products">
                <Package className="h-6 w-6" />
                Add Product
              </NavLink>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <NavLink to="/admin/orders">
                <ShoppingCart className="h-6 w-6" />
                View Orders
              </NavLink>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <NavLink to="/admin/customers">
                <Users className="h-6 w-6" />
                Manage Customers
              </NavLink>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <NavLink to="/admin/analytics">
                <BarChart3 className="h-6 w-6" />
                View Analytics
              </NavLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};