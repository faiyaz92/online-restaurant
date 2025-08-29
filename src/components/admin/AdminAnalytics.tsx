import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, ShoppingCart, Users, HelpCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { useFirebaseAdminOrders } from '@/hooks/useAdminOrders';
import { useFirebaseProducts } from '@/hooks/useFirebaseProducts';
import { useInquiries } from '@/hooks/useInquiries';

export const Analytics: React.FC = () => {
  const { orders, loading: ordersLoading } = useFirebaseAdminOrders();
  const { products, loading: productsLoading } = useFirebaseProducts();
  const { inquiries, loading: inquiriesLoading } = useInquiries();

  if (ordersLoading || productsLoading || inquiriesLoading) {
    return <div>Loading analytics...</div>;
  }

  // Key Metrics Calculations
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalInquiries = inquiries.length;

  // Monthly Revenue and Orders
  const monthlyData = orders.reduce((acc: Record<string, { revenue: number; orders: number }>, order) => {
    const date = new Date(order.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[monthKey]) {
      acc[monthKey] = { revenue: 0, orders: 0 };
    }
    acc[monthKey].revenue += order.totalAmount;
    acc[monthKey].orders += 1;
    return acc;
  }, {});

  const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
    const dateA = new Date(a + '-01');
    const dateB = new Date(b + '-01');
    return dateA.getTime() - dateB.getTime();
  });

  // Calculate growth (compare last two months)
  const lastTwoMonths = sortedMonths.slice(-2);
  let revenueGrowth = '0%';
  let growthType: 'positive' | 'negative' = 'positive';
  if (lastTwoMonths.length === 2) {
    const prevRevenue = monthlyData[lastTwoMonths[0]].revenue;
    const currRevenue = monthlyData[lastTwoMonths[1]].revenue;
    const growth = ((currRevenue - prevRevenue) / prevRevenue) * 100;
    revenueGrowth = `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
    growthType = growth > 0 ? 'positive' : 'negative';
  }

  // Order Status Distribution
  const statusDistribution = orders.reduce((acc: Record<string, number>, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  // Inquiry Status Distribution
  const inquiryDistribution = inquiries.reduce((acc: Record<string, number>, inquiry) => {
    const status = inquiry.status || 'Pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Top Products by Revenue
  const topProducts = products
    .map(product => ({
      name: product.name,
      revenue: orders.reduce((sum, order) => 
        sum + order.items.reduce((itemSum, item) => 
          item.productId === product.productId ? itemSum + (item.quantity * item.priceAtPurchase) : itemSum, 0
        ), 0),
    }))
    .filter(product => product.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      delivered: 'default',
      processing: 'secondary',
      shipped: 'outline',
      confirmed: 'secondary',
      pending: 'destructive',
      cancelled: 'destructive',
      returned: 'secondary',
    };
    return variants[status] || 'secondary';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          In-depth insights into your store's performance, sales trends, and customer interactions.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant={growthType === 'positive' ? 'default' : 'destructive'}>
                {growthType === 'positive' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {revenueGrowth}
              </Badge>
              <span>from previous month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{averageOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Based on {totalOrders} orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInquiries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Customer contacts</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Sales Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Sales Trends</CardTitle>
          <CardDescription>Revenue and order count by month</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMonths.map((month) => (
                <TableRow key={month}>
                  <TableCell>{month}</TableCell>
                  <TableCell>₹{monthlyData[month].revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell>{monthlyData[month].orders}</TableCell>
                </TableRow>
              ))}
              {sortedMonths.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">No data available</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>Breakdown of orders by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(statusDistribution).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <Badge variant={getStatusBadgeVariant(status)}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                  <span className="text-sm font-medium">{count} ({((count / totalOrders) * 100).toFixed(1)}%)</span>
                </div>
              ))}
              {Object.keys(statusDistribution).length === 0 && (
                <p className="text-sm text-muted-foreground text-center">No orders yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Inquiry Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Inquiry Status Distribution</CardTitle>
            <CardDescription>Breakdown of customer inquiries by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(inquiryDistribution).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <Badge variant={status.includes('Pending') ? 'destructive' : status.includes('Success') ? 'default' : 'secondary'}>
                    {status}
                  </Badge>
                  <span className="text-sm font-medium">{count} ({((count / totalInquiries) * 100).toFixed(1)}%)</span>
                </div>
              ))}
              {Object.keys(inquiryDistribution).length === 0 && (
                <p className="text-sm text-muted-foreground text-center">No inquiries yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products by Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products by Revenue</CardTitle>
          <CardDescription>Highest revenue-generating products</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>₹{product.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                </TableRow>
              ))}
              {topProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">No sales data available</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};