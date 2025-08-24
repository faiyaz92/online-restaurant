import { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { useFirestorePaths } from '@/hooks/useFirestorePaths';
import { toast } from 'sonner';
import { Settings } from '@/types/product';

export const useFirebaseSettings = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const companyId = 'shopping_cart';
  const paths = useFirestorePaths(companyId);

  useEffect(() => {
    const settingsPath = paths.getSettingsPath();
    if (!settingsPath) {
      console.error('Error: Invalid Firestore path for settings');
      setError('Invalid Firestore path for settings');
      toast.error('Failed to fetch settings: Invalid path');
      setLoading(false);
      return;
    }

    const settingsRef = doc(firestore, settingsPath);
    const unsubscribe = onSnapshot(
      settingsRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const settingsData: Settings = {
            shippingCharge: data.shippingCharge || 0,
            termsAndConditions: data.termsAndConditions || '',
            storeStatus: data.storeStatus || 'active',
            taxRate: data.taxRate || 0,
            updatedAt: data.updatedAt || new Date().toISOString(),
            companyId: data.companyId || companyId,
          };
          console.log('Fetched settings:', settingsData);
          setSettings(settingsData);
        } else {
          console.log('No settings document found, using default settings');
          setSettings({
            shippingCharge: 0,
            termsAndConditions: '',
            storeStatus: 'active',
            taxRate: 0,
            updatedAt: new Date().toISOString(),
            companyId,
          });
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching settings:', err.message, err.code);
        setError(err.message);
        toast.error(`Failed to fetch settings: ${err.message}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [paths]);

  const updateSettings = async (settingsData: Settings) => {
    try {
      const settingsPath = paths.getSettingsPath();
      if (!settingsPath) {
        throw new Error('Invalid Firestore path for settings');
      }
      const settingsRef = doc(firestore, settingsPath);
      await setDoc(settingsRef, {
        ...settingsData,
        updatedAt: new Date().toISOString(),
        companyId,
      }, { merge: true });
      console.log('Settings updated successfully:', settingsData);
      toast.success('Settings updated successfully');
    } catch (err: any) {
      console.error('Error updating settings:', err.message, err.code);
      toast.error(`Failed to update settings: ${err.message}`);
      throw err;
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
  };
};