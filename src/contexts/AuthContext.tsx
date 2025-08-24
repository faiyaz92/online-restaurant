import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, firestore } from '@/config/firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestorePaths } from '@/hooks/useFirestorePaths';

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
  loading: boolean;
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
  const paths = useFirestorePaths('shopping_cart');

  const login = async (email: string, password: string): Promise<void> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Search for user in the tenant company users collection
    const usersCollectionRef = collection(firestore, paths.getTenantUsersPath());
    const userQuery = query(usersCollectionRef, where('email', '==', email));
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data();
      setUserInfo({
        id: user.uid,
        email: user.email || '',
        name: userData.name || '',
        role: userData.userType || 'customer',
        userType: userData.userType || 'customer',
        companyId: userData.companyId || 'abc_pvt_ltd',
        mobileNumber: userData.mobileNumber || '',
        address: userData.address || ''
      });
    } else {
      // Create user document if it doesn't exist - default to customer
      const newUserData = {
        email: user.email,
        name: user.displayName || '',
        userType: 'customer',
        role: 'customer',
        companyId: 'abc_pvt_ltd',
        mobileNumber: '',
        address: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const userDocRef = doc(firestore, paths.getTenantUsersPath(), user.uid);
      await setDoc(userDocRef, newUserData);
      
      setUserInfo({
        id: user.uid,
        email: user.email || '',
        name: newUserData.name,
        role: 'customer',
        userType: 'customer',
        companyId: 'abc_pvt_ltd',
        mobileNumber: '',
        address: ''
      });
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
    setUserInfo(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
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
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};