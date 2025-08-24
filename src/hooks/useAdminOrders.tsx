
import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { useFirestorePaths } from '@/hooks/useFirestorePaths';
import { toast } from 'sonner';
import { Address } from '@/types/product';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  priceAtPurchase: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  totalAmount: number;
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

export const useFirebaseAdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const companyId = 'shopping_cart';
  const paths = useFirestorePaths(companyId);

  // Fetch all orders for the company
  useEffect(() => {
    const ordersPath = paths.getOrdersPath();
    const unsubscribe = onSnapshot(
      collection(firestore, ordersPath),
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            orderNumber: data.orderNumber,
            customer: {
              name: data.shippingAddress.fullName,
              email: data.shippingAddress.email || 'N/A',
              phone: data.shippingAddress.phoneNumber || 'N/A',
            },
            items: data.items,
            totalAmount: data.totalAmount,
            status: data.status,
            paymentStatus: data.paymentStatus,
            shippingAddress: {
              street: data.shippingAddress.address,
              city: data.shippingAddress.city,
              state: data.shippingAddress.state,
              zipCode: data.shippingAddress.zipCode,
            },
            createdAt: data.createdAt,
            deliveryDate: data.status === 'delivered' ? data.updatedAt : undefined,
          } as Order;
        });
        console.log('Fetched admin orders:', ordersData);
        setOrders(ordersData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching admin orders:', err.message, err.code);
        setError(err.message);
        toast.error(`Failed to fetch orders: ${err.message}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [paths]);

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const orderPath = paths.getSingleOrderPath(orderId);
      const orderRef = doc(firestore, orderPath);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      console.log(`Updated order ${orderId} status to ${newStatus}`);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err: any) {
      console.error('Error updating order status:', err.message, err.code);
      toast.error(`Failed to update order status: ${err.message}`);
    }
  };

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
  };
};
