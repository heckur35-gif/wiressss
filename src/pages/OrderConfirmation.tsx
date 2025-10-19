import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Package, Truck, Home, Loader2 } from 'lucide-react';
import { getOrderById, type Order } from '@/lib/order-storage';
import { getUserOrders, updateOrderStatus, isSupabaseConfigured } from '@/lib/db-services';
import { format } from 'date-fns';
import { useUserAuth } from '@/context/UserAuthContext';
import { toast } from 'sonner';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      if (orderId) {
        // Try to load from Supabase first if configured
        if (isSupabaseConfigured && user) {
          try {
            const dbOrders = await getUserOrders(user.id);
            const dbOrder = dbOrders.find(o => o.id === orderId);
            if (dbOrder) {
              const convertedOrder: Order = {
                id: dbOrder.id,
                orderNumber: dbOrder.orderNumber,
                userId: dbOrder.userId,
                customerInfo: dbOrder.customerInfo,
                items: dbOrder.items,
                subtotal: dbOrder.subtotal,
                shippingCost: dbOrder.shippingCost,
                totalAmount: dbOrder.totalAmount,
                status: dbOrder.status,
                paymentStatus: dbOrder.paymentStatus,
                paymentMethod: dbOrder.paymentMethod,
                qrCodeData: dbOrder.qrCodeData,
                createdAt: dbOrder.createdAt,
                estimatedDelivery: dbOrder.estimatedDelivery
              };
              setOrder(convertedOrder);
              return;
            }
          } catch (error) {
            console.error('Error loading order from Supabase:', error);
          }
        }

        // Fallback to localStorage
        const foundOrder = await getOrderById(orderId, user?.id);
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          navigate('/');
        }
      }
    };
    loadOrder();
  }, [orderId, navigate, user]);

  const handlePaymentDone = async () => {
    if (!order) return;

    setIsUpdating(true);
    try {
      if (isSupabaseConfigured) {
        await updateOrderStatus(order.id, order.status, 'paid');
        setOrder({
          ...order,
          paymentStatus: 'paid'
        });
        toast.success('Payment marked as completed!', {
          description: 'Your order has been updated.'
        });
      } else {
        toast.error('Supabase is not configured');
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'Failed to update payment status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. We'll send updates to {order.customerInfo.email}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Order #{order.orderNumber}</CardTitle>
                <CardDescription>
                  Placed on {format(new Date(order.createdAt), 'PPP p')}
                </CardDescription>
              </div>
              <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                {order.paymentStatus === 'pending' ? 'Payment Pending' : 'Paid'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Delivery Address
                </h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">{order.customerInfo.name}</p>
                  <p>{order.customerInfo.address}</p>
                  <p>PIN: {order.customerInfo.pincode}</p>
                  <p>{order.customerInfo.phone}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Estimated Delivery
                </h3>
                <div className="text-sm">
                  <p className="text-lg font-bold text-primary">
                    {order.estimatedDelivery
                      ? format(new Date(order.estimatedDelivery), 'PPP')
                      : '3-5 business days'}
                  </p>
                  <p className="text-muted-foreground mt-1">
                    We'll notify you when your order ships
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-accent/20">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-1">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.brand} • {item.color} • {item.quantity} {item.unitType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{(item.unitPrice * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost.toFixed(2)}`}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {order.paymentStatus === 'pending' && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-900 dark:text-yellow-200 mb-3">
                  Payment is still pending. Please mark as done once you've completed the payment.
                </p>
                <Button
                  onClick={handlePaymentDone}
                  disabled={isUpdating}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Marking as Paid...
                    </>
                  ) : (
                    'Mark Payment as Done'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate('/orders')}>
            View All Orders
          </Button>
          <Button onClick={() => navigate('/products')} className="gap-2">
            <Home className="h-4 w-4" />
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
