import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '@/config/firebase';
import { Role, UserType } from '@/types/auth';
import { useFirestorePaths } from '@/hooks/useFirestorePaths';
import { sanitizeEmail } from '@/lib/utils';

interface SignUpData {
  name: string;
  email: string;
  mobileNumber: string;
  password?: string;
}

export const useSignUp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateUserProfile } = useAuth();

  const companyId = 'shopping_cart'; // Or get dynamically if needed
  const paths = useFirestorePaths(companyId);

  const saveUserToFirestore = async (user: any, data: Partial<SignUpData>) => {
    const docId = sanitizeEmail(user.email);
    await setDoc(doc(firestore, paths.getTenantUserPath(docId)), {
      uid: user.uid,
      name: data.name || user.displayName || 'Anonymous',
      email: data.email || user.email,
      mobileNumber: data.mobileNumber || '',
      userType: UserType.Customer,
      role: Role.CUSTOMER,
      createdAt: new Date().toISOString(),
    });
  };

  const signUpWithEmail = async ({ name, email, mobileNumber, password }: SignUpData) => {
    setLoading(true);
    setError(null);
    try {
      if (!password) {
        throw new Error('Password is required');
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateUserProfile({ displayName: name });
      await saveUserToFirestore(userCredential.user, { name, email, mobileNumber });
      toast.success('Sign-up successful! Please sign in.');
      // DO NOT save anything to localStorage here!
      return userCredential.user;
    } catch (error: any) {
      let errorMessage = 'Sign-up failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak.';
      }
      setError(errorMessage);
      toast.error(`Failed to sign up: ${errorMessage}`);
      // DO NOT save anything to localStorage here!
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting Google sign-up');
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      const userDocRef = doc(firestore, paths.getTenantUserPath(user.uid));
      const userDoc = await getDoc(userDocRef);

      let userInfo;
      if (userDoc.exists()) {
        // User exists, use Firestore info
        userInfo = userDoc.data();
      } else {
        // User does not exist, create as customer
        await saveUserToFirestore(user, {
          name: user.displayName || '',
          email: user.email || '',
          mobileNumber: '',
        });
        userInfo = {
          uid: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          mobileNumber: '',
          userType: UserType.Customer,
          role: Role.CUSTOMER,
        };
      }

      // Save userInfo to localStorage for session
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      toast.success('Google sign-in successful! Please continue.');
      return user;
    } catch (error: any) {
      console.error('Error during Google sign-up:', error.message, error.code, error.stack);
      let errorMessage = 'Google sign-up failed. Please try again.';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-up cancelled.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'Account exists with a different sign-in method.';
      }
      setError(errorMessage);
      toast.error(`Failed to sign up with Google: ${errorMessage}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    signUpWithEmail,
    signUpWithGoogle,
    loading,
    error,
  };
};