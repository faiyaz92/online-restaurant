import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { useFirestorePaths } from './useFirestorePaths';

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  status: 'active' | 'inactive';
  productCount?: number;
  createdAt: string;
  updatedAt: string;
  companyId: string;
}

export const useFirebaseCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const companyId = 'shopping_cart';
  const paths = useFirestorePaths(companyId);

  useEffect(() => {
    console.log('Initializing Firebase Categories hook with companyId:', companyId);
    const unsubscribe = onSnapshot(
      collection(firestore, paths.getCategoryPath()),
      (snapshot) => {
        const categoriesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            description: data.description,
            image: data.image,
            status: data.status || 'active',
            productCount: data.productCount || 0,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            companyId: data.companyId || companyId,
          };
        }) as Category[];
        console.log('Fetched categories:', categoriesData);
        setCategories(categoriesData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching categories:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [paths]);

  const addCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>) => {
    try {
      console.log('Adding category to Firestore:', categoryData);
      await addDoc(collection(firestore, paths.getCategoryPath()), {
        ...categoryData,
        productCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        companyId,
      });
      console.log('Category added successfully');
    } catch (err: any) {
      console.error('Error adding category:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    try {
      console.log('Updating category:', id, categoryData);
      await updateDoc(doc(firestore, paths.getCategoryPath(), id), {
        ...categoryData,
        updatedAt: new Date().toISOString(),
      });
      console.log('Category updated successfully');
    } catch (err: any) {
      console.error('Error updating category:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      console.log('Deleting category:', id);
      await deleteDoc(doc(firestore, paths.getCategoryPath(), id));
      console.log('Category deleted successfully');
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError(err.message);
      throw err;
    }
  };

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
  };
};
