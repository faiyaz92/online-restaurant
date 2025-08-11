import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Eye
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$45,231.89',
      change: '+20.1%',
      changeType: 'positive' as const,
      icon: DollarSign,
      description: 'from last month'
    },
    {
      title: 'Total Orders',
      value: '2,350',
      change: '+15.2%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
      description: 'orders this month'
    },
    {
      title: 'Active Products',
      value: '567',
      change: '+5.4%',
      changeType: 'positive' as const,
      icon: Package,
      description: 'products in stock'
    },
    {
      title: 'Total Customers',
      value: '1,420',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Users,
      description: 'registered users'
    }
  ];

  const recentOrders = [
    { id: '#12534', customer: 'John Doe', amount: '$89.90', status: 'Delivered', time: '2 hours ago' },
    { id: '#12535', customer: 'Jane Smith', amount: '$156.50', status: 'Processing', time: '4 hours ago' },
    { id: '#12536', customer: 'Bob Johnson', amount: '$67.30', status: 'Shipped', time: '6 hours ago' },
    { id: '#12537', customer: 'Alice Brown', amount: '$234.80', status: 'Confirmed', time: '8 hours ago' },
    { id: '#12538', customer: 'Charlie Wilson', amount: '$45.20', status: 'Pending', time: '10 hours ago' },
  ];

  const topProducts = [
    { name: 'Wireless Headphones', sales: 234, revenue: '$23,400', image: '/placeholder.svg' },
    { name: 'Smart Watch', sales: 189, revenue: '$18,900', image: '/placeholder.svg' },
    { name: 'Laptop Stand', sales: 156, revenue: '$7,800', image: '/placeholder.svg' },
    { name: 'Phone Case', sales: 145, revenue: '$2,900', image: '/placeholder.svg' },
    { name: 'Bluetooth Speaker', sales: 123, revenue: '$12,300', image: '/placeholder.svg' },
  ];

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
              <Button variant="outline" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View all orders
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
            <Button className="h-20 flex-col gap-2">
              <Package className="h-6 w-6" />
              Add Product
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <ShoppingCart className="h-6 w-6" />
              View Orders
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              Manage Customers
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};