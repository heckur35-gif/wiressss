import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllOrdersForAdmin, updateOrderStatus, type Order } from '@/lib/order-storage';
import { getAllOrders, exportOrdersToCSV, updateOrderStatus as updateOrderStatusSupabase, isSupabaseConfigured } from '@/lib/db-services';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Package, Download } from 'lucide-react';

export const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const dbOrders = await getAllOrders();
      if (dbOrders && dbOrders.length > 0) {
        const convertedOrders: Order[] = dbOrders.map((dbOrder: any) => ({
          id: dbOrder.id,
          orderNumber: dbOrder.order_number,
          userId: dbOrder.user_id,
          customerInfo: {
            name: dbOrder.customer_name,
            email: dbOrder.customer_email,
            phone: dbOrder.customer_phone,
            address: dbOrder.customer_address,
            pincode: dbOrder.customer_pincode
          },
          items: dbOrder.items || [],
          subtotal: dbOrder.subtotal,
          shippingCost: dbOrder.shipping_cost || 0,
          totalAmount: dbOrder.total_amount,
          status: dbOrder.status,
          paymentStatus: dbOrder.payment_status,
          paymentMethod: dbOrder.payment_method,
          qrCodeData: dbOrder.qr_code_data,
          createdAt: dbOrder.created_at,
          estimatedDelivery: dbOrder.estimated_delivery
        }));
        setOrders(convertedOrders);
      } else {
        const allOrders = await getAllOrdersForAdmin();
        setOrders(allOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportOrders = async () => {
    try {
      await exportOrdersToCSV();
      toast.success('Orders exported successfully');
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast.error('Failed to export orders');
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      const order = orders.find(o => o.id === orderId);

      // Update in Supabase if configured
      if (isSupabaseConfigured) {
        await updateOrderStatusSupabase(orderId, newStatus, order?.paymentStatus);
      }

      // Also update in localStorage
      await updateOrderStatus(orderId, newStatus, undefined, order?.userId);
      await loadOrders();
      toast.success('Order status updated');
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const handlePaymentStatusUpdate = async (orderId: string, newPaymentStatus: Order['paymentStatus']) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      try {
        // Update in Supabase if configured - convert 'completed' to 'paid' for Supabase
        if (isSupabaseConfigured) {
          const supabasePaymentStatus = newPaymentStatus === 'completed' ? 'paid' : newPaymentStatus;
          await updateOrderStatusSupabase(orderId, order.status, supabasePaymentStatus);
        }

        // Also update in localStorage
        await updateOrderStatus(orderId, order.status, newPaymentStatus, order.userId);
        await loadOrders();
        toast.success('Payment status updated');
      } catch (error: any) {
        console.error('Error updating payment status:', error);
        toast.error(error.message || 'Failed to update payment status');
      }
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'shipped':
      case 'processing': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders
      .filter(o => o.paymentStatus === 'completed')
      .reduce((sum, o) => sum + o.totalAmount, 0)
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Orders</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Processing</CardDescription>
            <CardTitle className="text-3xl">{stats.processing}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Shipped</CardDescription>
            <CardTitle className="text-3xl">{stats.shipped}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-3xl">₹{stats.revenue.toFixed(0)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Manage and track customer orders</CardDescription>
            </div>
            <Button onClick={handleExportOrders} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">No orders yet</p>
              <p className="text-sm text-muted-foreground">Orders will appear here when customers make purchases</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{order.customerInfo.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="space-y-0.5">
                        <div className="text-foreground">{order.customerInfo.phone}</div>
                        <div className="text-xs text-muted-foreground">{order.customerInfo.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs max-w-[220px] truncate">
                      {order.customerInfo.address}, {order.customerInfo.pincode}
                    </TableCell>
                    <TableCell>{order.items.length} items</TableCell>
                    <TableCell className="font-medium">₹{order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select
                        value={order.paymentStatus}
                        onValueChange={(value) => handlePaymentStatusUpdate(order.id, value as Order['paymentStatus'])}
                      >
                        <SelectTrigger className="w-32">
                          <Badge variant={getPaymentStatusColor(order.paymentStatus)} className="w-full justify-center">
                            {order.paymentStatus}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusUpdate(order.id, value as Order['status'])}
                      >
                        <SelectTrigger className="w-32">
                          <Badge variant={getStatusColor(order.status)} className="w-full justify-center">
                            {order.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
