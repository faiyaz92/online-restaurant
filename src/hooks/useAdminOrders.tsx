import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { useFirestorePaths } from '@/hooks/useFirestorePaths';
import { toast } from 'sonner';
import { Order, OrderItem } from '@/types/product';

interface FirestoreOrderItem {
  productId?: string;
  name?: string;
  price?: number;
  quantity?: number;
  priceAtPurchase?: number;
  taxAmount?: number;
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
    if (!ordersPath) {
      console.error('Error: Invalid Firestore path for orders');
      setError('Invalid Firestore path for orders');
      toast.error('Failed to fetch orders: Invalid path');
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(firestore, ordersPath),
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            orderNumber: data.orderNumber || null,
            userId: data.userId || '',
            customer: {
              name: data.shippingAddress?.fullName || null,
              email: data.shippingAddress?.email || null,
              phone: data.shippingAddress?.phoneNumber || null,
            },
            items: (data.items || []).map((item: FirestoreOrderItem) => ({
              productId: item.productId || '',
              name: item.name || 'Unknown',
              price: item.price || 0,
              quantity: item.quantity || 0,
              priceAtPurchase: item.priceAtPurchase || item.price || 0,
              taxAmount: item.taxAmount || 0,
            }) as OrderItem),
            totalAmount: data.totalAmount || 0,
            totalTax: data.totalTax || 0,
            status: data.status || 'pending',
            paymentStatus: data.paymentStatus || 'pending',
            shippingAddress: {
              street: data.shippingAddress?.address || '',
              city: data.shippingAddress?.city || '',
              state: data.shippingAddress?.state || '',
              zipCode: data.shippingAddress?.zipCode || '',
            },
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            companyId: data.companyId || 'shopping_cart',
            deliveryDate: data.status === 'delivered' ? data.updatedAt || undefined : undefined,
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
      if (!orderPath) {
        throw new Error('Invalid Firestore path for order');
      }
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