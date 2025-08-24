import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, DocumentReference, setDoc } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { useFirestorePaths } from './useFirestorePaths';
import { Address } from '@/types/product';

export const useFirebaseAddresses = (userId: string | undefined) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const companyId = 'shopping_cart';
  const paths = useFirestorePaths(companyId);

  useEffect(() => {
    if (!userId) {
      console.log('No userId provided, skipping address fetch');
      setLoading(false);
      return;
    }

    console.log('Initializing Firebase Addresses hook with userId:', userId);
    const addressPath = paths.getUserAddressesPath(userId);
    console.log('Address path:', addressPath);
    const unsubscribe = onSnapshot(
      collection(firestore, addressPath),
      (snapshot) => {
        const addressesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            addressId: doc.id,
            userId,
            fullName: data.fullName || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            zipCode: data.zipCode || '',
            country: data.country || '',
            phoneNumber: data.phoneNumber || '',
            isDefault: data.isDefault || false,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            companyId: data.companyId || companyId,
          };
        }) as Address[];
        console.log('Fetched addresses:', addressesData);
        setAddresses(addressesData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching addresses:', err.message, err.code);
        setError(err.message);
        setLoading(false);
      }
    );

    // Create user document if it doesn't exist
    const userDocPath = paths.getTenantUserPath(userId);
    setDoc(doc(firestore, userDocPath), { userId }, { merge: true })
      .then(() => console.log('User document initialized for:', userId))
      .catch((err) => console.error('Error initializing user document:', err.message));

    return () => unsubscribe();
  }, [userId, paths]);

  const addAddress = async (addressData: Omit<Address, 'addressId' | 'userId' | 'createdAt' | 'updatedAt' | 'companyId'>): Promise<DocumentReference> => {
    if (!userId) {
      const error = new Error('User must be logged in to add an address');
      console.error(error.message);
      throw error;
    }
    try {
      console.log('Adding address to Firestore:', addressData);
      const addressPath = paths.getUserAddressesPath(userId);
      console.log('Target address path:', addressPath);
      const docRef = await addDoc(collection(firestore, addressPath), {
        ...addressData,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        companyId,
      });
      console.log('Address added successfully with ID:', docRef.id);
      return docRef;
    } catch (err: any) {
      console.error('Error adding address:', err.message, err.code);
      setError(err.message);
      throw err;
    }
  };

  const updateAddress = async (addressId: string, addressData: Partial<Address>) => {
    if (!userId) {
      const error = new Error('User must be logged in to update an address');
      console.error(error.message);
      throw error;
    }
    try {
      console.log('Updating address:', addressId, addressData);
      const addressPath = paths.getUserAddressesPath(userId);
      await updateDoc(doc(firestore, addressPath, addressId), {
        ...addressData,
        updatedAt: new Date().toISOString(),
      });
      console.log('Address updated successfully');
    } catch (err: any) {
      console.error('Error updating address:', err.message, err.code);
      setError(err.message);
      throw err;
    }
  };

  const deleteAddress = async (addressId: string) => {
    if (!userId) {
      const error = new Error('User must be logged in to delete an address');
      console.error(error.message);
      throw error;
    }
    try {
      console.log('Deleting address:', addressId);
      const addressPath = paths.getUserAddressesPath(userId);
      await deleteDoc(doc(firestore, addressPath, addressId));
      console.log('Address deleted successfully');
    } catch (err: any) {
      console.error('Error deleting address:', err.message, err.code);
      setError(err.message);
      throw err;
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    if (!userId) {
      const error = new Error('User must be logged in to set default address');
      console.error(error.message);
      throw error;
    }
    try {
      console.log('Setting default address:', addressId);
      const addressPath = paths.getUserAddressesPath(userId);
      const batch = addresses.map((addr) =>
        updateDoc(doc(firestore, addressPath, addr.addressId), {
          isDefault: addr.addressId === addressId,
          updatedAt: new Date().toISOString(),
        })
      );
      await Promise.all(batch);
      console.log('Default address set successfully');
    } catch (err: any) {
      console.error('Error setting default address:', err.message, err.code);
      setError(err.message);
      throw err;
    }
  };

  return {
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
};
