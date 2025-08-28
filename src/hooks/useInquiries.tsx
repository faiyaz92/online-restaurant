import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { useFirestorePaths } from './useFirestorePaths';
import { toast } from 'sonner';

export interface ContactFormData {
  id: string;
  name: string;
  mobile: string;
  email: string;
  messageType: 'Become Seller' | 'Other' | 'Complaint';
  message: string;
  createdAt: string;
  companyId: string;
  status?: 'Pending' | 'Solved with Success' | 'Solved with Fail' | 'Discussion';
}

export const useInquiries = () => {
  const [inquiries, setInquiries] = useState<ContactFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const companyId = 'shopping_cart';
  const paths = useFirestorePaths(companyId);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestore, `${paths.getTenantCompanyPath()}/contacts`),
      (snapshot) => {
        const inquiryList: ContactFormData[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ContactFormData[];
        setInquiries(inquiryList);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching inquiries:', err);
        setError(err.message);
        setLoading(false);
        toast.error('Failed to fetch inquiries. Please try again.');
      }
    );

    return () => unsubscribe();
  }, [paths]);

  const updateInquiryStatus = async (
    inquiryId: string,
    status: 'Pending' | 'Solved with Success' | 'Solved with Fail' | 'Discussion'
  ) => {
    try {
      const inquiryRef = doc(firestore, `${paths.getTenantCompanyPath()}/contacts`, inquiryId);
      await updateDoc(inquiryRef, { status });
    } catch (err: any) {
      console.error('Error updating inquiry status:', err);
      throw err;
    }
  };

  return { inquiries, loading, error, updateInquiryStatus };
};