import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, firestore } from '@/config/firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestorePaths } from '@/hooks/useFirestorePaths';
import { toast } from 'sonner';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  userType: 'admin' | 'customer';
  companyId: string;
  mobileNumber?: string;
  address?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userInfo: UserInfo | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: { displayName?: string }) => Promise<void>;
  loading: boolean;
  userInfoLoading: boolean; // New: For tracking userInfo fetch
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [userInfoLoading, setUserInfoLoading] = useState(false); // New state
  const paths = useFirestorePaths('shopping_cart');

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('Attempting login:', email);
      setUserInfoLoading(true); // Start loading
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Search for user in the tenant company users collection
      const usersCollectionRef = collection(firestore, paths.getTenantUsersPath());
      const userQuery = query(usersCollectionRef, where('email', '==', email));
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        // Create user document if it doesn't exist - default to customer
        const newUserData = {
          email: user.email,
          name: user.displayName || '',
          userType: 'customer',
          role: 'customer',
          companyId: 'shopping_cart',
          mobileNumber: '',
          address: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const userDocRef = doc(firestore, paths.getTenantUsersPath(), user.uid);
        await setDoc(userDocRef, newUserData);
        console.log('Created new user document in Firestore:', user.uid);
      }
      // No setUserInfo here - listener will handle it
      toast.success('Login successful!');
    } catch (err: any) {
      console.error('Error during login:', err.message, err.code, err.stack);
      toast.error(`Failed to login: ${err.message}`);
      throw err;
    } finally {
      setUserInfoLoading(false); // End loading (though listener may override)
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      console.log('Attempting Google login');
      setUserInfoLoading(true); // Start loading
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user exists in Firestore
      const userDocRef = doc(firestore, paths.getTenantUsersPath(), user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create user document for new Google user
        const newUserData = {
          email: user.email,
          name: user.displayName || '',
          userType: 'customer',
          role: 'customer',
          companyId: 'shopping_cart',
          mobileNumber: '',
          address: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await setDoc(userDocRef, newUserData);
        console.log('Created new Google user document in Firestore:', user.uid);
      }
      // No setUserInfo here - listener will handle it
      toast.success('Google login successful!');
    } catch (err: any) {
      console.error('Error during Google login:', err.message, err.code, err.stack);
      toast.error(`Failed to login with Google: ${err.message}`);
      throw err;
    } finally {
      setUserInfoLoading(false); // End loading
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('Attempting logout');
      await signOut(auth);
      setUserInfo(null);
      console.log('Logout successful');
      toast.success('Logged out successfully');
    } catch (err: any) {
      console.error('Error during logout:', err.message, err.code, err.stack);
      toast.error(`Failed to logout: ${err.message}`);
      throw err;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      console.log('Attempting password reset for:', email);
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent');
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      console.error('Error during password reset:', err.message, err.code, err.stack);
      toast.error(`Failed to send reset email: ${err.message}`);
      throw err;
    }
  };

  const updateUserProfile = async (data: { displayName?: string }): Promise<void> => {
    try {
      if (!currentUser) {
        console.error('No user is currently signed in for profile update');
        throw new Error('No user is signed in');
      }
      console.log('Updating user profile:', currentUser.uid, data);
      await updateProfile(currentUser, data);
      
      // Update Firestore user document
      const userDocRef = doc(firestore, paths.getTenantUsersPath(), currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        await setDoc(
          userDocRef,
          {
            name: data.displayName || userDoc.data().name || '',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        setUserInfo((prev) => ({
          ...prev!,
          name: data.displayName || prev!.name,
        }));
        console.log('User profile updated in Firestore:', currentUser.uid);
      } else {
        console.error('User document not found in Firestore:', currentUser.uid);
        throw new Error('User document not found');
      }
      toast.success('Profile updated successfully');
    } catch (err: any) {
      console.error('Error updating user profile:', err.message, err.code, err.stack);
      toast.error(`Failed to update profile: ${err.message}`);
      throw err;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setUserInfoLoading(true); // Start loading for fetch
        try {
          const userDocRef = doc(firestore, paths.getTenantUsersPath(), user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserInfo({
              id: user.uid,
              email: user.email || '',
              name: userData.name || user.displayName || '',
              role: userData.userType || 'customer',
              userType: userData.userType || 'customer',
              companyId: userData.companyId || 'shopping_cart',
              mobileNumber: userData.mobileNumber || '',
              address: userData.address || '',
            });
            console.log('User info set on auth state change:', user.uid);
          } else {
            setUserInfo(null);
            console.log('No user document found on auth state change:', user.uid);
          }
        } catch (err: any) {
          console.error('Error fetching user info on auth state change:', err.message, err.code, err.stack);
          toast.error(`Failed to fetch user info: ${err.message}`);
        } finally {
          setUserInfoLoading(false); // End loading
        }
      } else {
        setUserInfo(null);
        setUserInfoLoading(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userInfo,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    loading,
    userInfoLoading, // Expose the new loading state
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};