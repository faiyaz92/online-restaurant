import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { useFirestorePaths } from './useFirestorePaths';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Address, Order, OrderItem } from '@/types/product';

interface FirestoreOrderItem {
  productId?: string;
  name?: string;
  price?: number;
  quantity?: number;
  priceAtPurchase?: number;
  taxAmount?: number;
  originalPrice?: number;
}

export const useFirebaseOrders = (userId: string | undefined) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const companyId = 'shopping_cart';
  const paths = useFirestorePaths(companyId);

  useEffect(() => {
    if (!userId) {
      console.log('No userId provided, skipping orders fetch');
      setLoading(false);
      return;
    }

    console.log('Fetching orders for userId:', userId);
    const ordersPath = paths.getOrdersPath();
    const q = query(
      collection(firestore, ordersPath),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
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
              originalPrice: item.originalPrice || item.price || 0,
            }) as OrderItem),
            totalAmount: data.totalAmount || 0,
            totalTax: data.totalTax || 0,
            shippingCharge: data.shippingCharge || 0,
            priceWithoutDiscount: data.priceWithoutDiscount || 0,
            priceWithDiscount: data.priceWithDiscount || 0,
            priceWithDiscountTaxShipping: data.priceWithDiscountTaxShipping || 0,
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
        console.log('Fetched orders:', ordersData);
        setOrders(ordersData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching orders:', err.message, err.code);
        setError(err.message);
        toast.error(`Failed to fetch orders: ${err.message}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, paths]);

  const getOrderById = async (orderId: string): Promise<Order | null> => {
    if (!userId) {
      console.error('No userId provided for fetching order');
      toast.error('Please login to view order details');
      return null;
    }

    try {
      console.log('Fetching order:', orderId);
      const orderPath = paths.getSingleOrderPath(orderId);
      const docRef = doc(firestore, orderPath);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.error('Order not found:', orderId);
        toast.error('Order not found');
        return null;
      }

      const data = docSnap.data();
      const orderData = {
        id: docSnap.id,
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
          originalPrice: item.originalPrice || item.price || 0,
        }) as OrderItem),
        totalAmount: data.totalAmount || 0,
        totalTax: data.totalTax || 0,
        shippingCharge: data.shippingCharge || 0,
        priceWithoutDiscount: data.priceWithoutDiscount || 0,
        priceWithDiscount: data.priceWithDiscount || 0,
        priceWithDiscountTaxShipping: data.priceWithDiscountTaxShipping || 0,
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
      console.log('Fetched order:', orderData);
      return orderData;
    } catch (err: any) {
      console.error('Error fetching order:', err.message, err.code);
      toast.error(`Failed to fetch order: ${err.message}`);
      return null;
    }
  };

  return {
    orders,
    loading,
    error,
    getOrderById,
  };
};