import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { useFirestorePaths } from './useFirestorePaths';

export interface Subcategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  status: 'active' | 'inactive';
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  companyId: string;
}

export const useFirebaseSubcategories = (categoryId?: string) => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const companyId = 'shopping_cart';
  const paths = useFirestorePaths(companyId);

  const fetchSubcategories = (catId: string) => {
    setLoading(true);
    const q = query(
      collection(firestore, paths.getSubcategoryPath()),
      where('categoryId', '==', catId)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const subcategoriesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            description: data.description,
            image: data.image,
            status: data.status || 'active',
            categoryId: data.categoryId,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            companyId: data.companyId || companyId,
          };
        }) as Subcategory[];
        console.log('Fetched subcategories:', subcategoriesData);
        setSubcategories(subcategoriesData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching subcategories:', err);
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  };

  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      setLoading(false);
      return;
    }
    return fetchSubcategories(categoryId);
  }, [categoryId, paths]);

  const addSubcategory = async (subcategoryData: Omit<Subcategory, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>) => {
    try {
      console.log('Adding subcategory to Firestore:', subcategoryData);
      await addDoc(collection(firestore, paths.getSubcategoryPath()), {
        ...subcategoryData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        companyId,
      });
      console.log('Subcategory added successfully');
    } catch (err: any) {
      console.error('Error adding subcategory:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateSubcategory = async (id: string, subcategoryData: Partial<Subcategory>) => {
    try {
      console.log('Updating subcategory:', id, subcategoryData);
      await updateDoc(doc(firestore, paths.getSubcategoryPath(), id), {
        ...subcategoryData,
        updatedAt: new Date().toISOString(),
      });
      console.log('Subcategory updated successfully');
    } catch (err: any) {
      console.error('Error updating subcategory:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteSubcategory = async (id: string) => {
    try {
      console.log('Deleting subcategory:', id);
      await deleteDoc(doc(firestore, paths.getSubcategoryPath(), id));
      console.log('Subcategory deleted successfully');
    } catch (err: any) {
      console.error('Error deleting subcategory:', err);
      setError(err.message);
      throw err;
    }
  };

  return {
    subcategories,
    loading,
    error,
    fetchSubcategories,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
  };
};
