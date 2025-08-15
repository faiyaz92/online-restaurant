import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
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
}

export const useFirebaseCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const paths = useFirestorePaths('abc_pvt_ltd');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestore, paths.getCategoryPath()),
      (snapshot) => {
        const categoriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        setCategories(categoriesData);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [paths]);

  const addCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addDoc(collection(firestore, paths.getCategoryPath()), {
        ...categoryData,
        productCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    try {
      await updateDoc(doc(firestore, paths.getCategoryPath(), id), {
        ...categoryData,
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(firestore, paths.getCategoryPath(), id));
    } catch (err: any) {
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
    deleteCategory
  };
};