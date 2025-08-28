import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '@/config/firebase';
import { Role, UserType } from '@/types/auth';
import { useFirestorePaths } from '@/hooks/useFirestorePaths';

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
    try {
      console.log('Saving user to Firestore:', user.uid, data);
      // Save user under the company users collection
      await setDoc(doc(firestore, paths.getTenantUserPath(user.uid)), {
        uid: user.uid,
        name: data.name || user.displayName || 'Anonymous',
        email: data.email || user.email,
        mobileNumber: data.mobileNumber || '',
        userType: UserType.Customer,
        role: Role.CUSTOMER,
        createdAt: new Date().toISOString(),
      });
      console.log('Successfully saved user to Firestore:', user.uid);
    } catch (err: any) {
      console.error('Error saving user to Firestore:', err.message, err.code, err.stack);
      toast.error(`Failed to save user data: ${err.message}`);
      throw new Error(`Failed to save user data: ${err.message}`);
    }
  };

  const signUpWithEmail = async ({ name, email, mobileNumber, password }: SignUpData) => {
    setLoading(true);
    setError(null);
    try {
      if (!password) {
        console.error('Password is required for email sign-up');
        throw new Error('Password is required');
      }
      console.log('Attempting email sign-up:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateUserProfile({ displayName: name });
      await saveUserToFirestore(userCredential.user, { name, email, mobileNumber });
      console.log('Email sign-up successful:', userCredential.user.uid);
      toast.success('Sign-up successful! Please sign in.');
      return userCredential.user;
    } catch (error: any) {
      console.error('Error during email sign-up:', error.message, error.code, error.stack);
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
      await saveUserToFirestore(userCredential.user, {
        name: userCredential.user.displayName || '',
        email: userCredential.user.email || '',
        mobileNumber: '',
      });
      console.log('Google sign-up successful:', userCredential.user.uid);
      toast.success('Google sign-up successful! Please sign in.');
      return userCredential.user;
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