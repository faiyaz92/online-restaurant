import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { useFirestorePaths } from './useFirestorePaths';
import { toast } from 'sonner';

export interface ContactFormData {
  name: string;
  mobile: string;
  email: string;
  messageType: 'Become Seller' | 'Other' | 'Complaint';
  message: string;
  createdAt: string;
  companyId: string;
}

export const useContactUs = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyId = 'shopping_cart';
  const paths = useFirestorePaths(companyId);

  const submitContactForm = async (formData: Omit<ContactFormData, 'createdAt' | 'companyId'>) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Submitting contact form:', formData);
      await addDoc(collection(firestore, `${paths.getTenantCompanyPath()}/contacts`), {
        ...formData,
        createdAt: new Date().toISOString(),
        companyId,
      });
      console.log('Contact form submitted successfully');
      toast.success('Your message has been sent successfully!');
    } catch (err: any) {
      console.error('Error submitting contact form:', err);
      setError(err.message);
      toast.error('Failed to send your message. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitContactForm, loading, error };
};