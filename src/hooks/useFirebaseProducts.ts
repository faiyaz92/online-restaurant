import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { useFirestorePaths } from './useFirestorePaths';
import { Product } from '@/types/product';

export const useFirebaseProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const companyId = 'shopping_cart';
  const paths = useFirestorePaths(companyId);

  useEffect(() => {
    console.log('Initializing Firebase Products hook with companyId:', companyId);
    const unsubscribe = onSnapshot(
      collection(firestore, paths.getProductPath()),
      (snapshot) => {
        const productsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            productId: doc.id,
            name: data.name || '',
            description: data.description || '',
            price: data.price || 0,
            discountedPrice: data.discountedPrice ?? null,
            taxRate: data.taxRate || 0,
            categoryId: data.categoryId || '',
            subcategoryId: data.subcategoryId ?? null, // Normalize undefined/empty to null
            stock: data.stock || 0,
            images: data.images || ['/placeholder.svg'],
            companyId: data.companyId || companyId,
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          };
        }) as Product[];
        console.log('Fetched products:', productsData);
        setProducts(productsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching products:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [paths]);

  const addProduct = async (productData: Omit<Product, 'productId' | 'createdAt' | 'companyId'>) => {
    try {
      console.log('Adding product to Firestore:', productData);
      const cleanedData = {
        ...productData,
        subcategoryId: productData.subcategoryId ?? null, // Normalize to null
        discountedPrice: productData.discountedPrice ?? null,
        createdAt: new Date().toISOString(),
        companyId,
      };
      await addDoc(collection(firestore, paths.getProductPath()), cleanedData);
      console.log('Product added successfully');
    } catch (err: any) {
      console.error('Error adding product:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateProduct = async (productId: string, productData: Partial<Product>) => {
    try {
      console.log('Updating product:', productId, productData);
      const cleanedData = {
        ...productData,
        subcategoryId: productData.subcategoryId ?? null, // Normalize to null
        discountedPrice: productData.discountedPrice ?? null,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(doc(firestore, paths.getProductPath(), productId), cleanedData);
      console.log('Product updated successfully');
    } catch (err: any) {
      console.error('Error updating product:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      console.log('Deleting product:', productId);
      await deleteDoc(doc(firestore, paths.getProductPath(), productId));
      console.log('Product deleted successfully');
    } catch (err: any) {
      console.error('Error deleting product:', err);
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
    deleteProduct,
  };
};