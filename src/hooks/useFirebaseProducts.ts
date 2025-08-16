import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { useFirestorePaths } from './useFirestorePaths';
import { Product } from '@/types/product';

export const useFirebaseProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const paths = useFirestorePaths('abc_pvt_ltd');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestore, paths.getProductPath()),
      (snapshot) => {
        const productsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            productId: doc.id,
            name: data.name || '',
            description: data.description || '',
            price: Number(data.price) || 0,
            discountedPrice: data.discountedPrice ? Number(data.discountedPrice) : undefined,
            images: data.images || [],
            categoryId: data.categoryId || '',
            subcategoryId: data.subcategoryId,
            stock: Number(data.stock) || 0,
            variants: data.variants || [],
            createdAt: data.createdAt || new Date(),
            companyId: data.companyId || 'abc_pvt_ltd'
          } as Product;
        });
        setProducts(productsData);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [paths]);

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      await addDoc(collection(firestore, paths.getProductPath()), {
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      await updateDoc(doc(firestore, paths.getProductPath(), id), {
        ...productData,
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(firestore, paths.getProductPath(), id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct
  };
};