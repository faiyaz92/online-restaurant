import { useState, useEffect } from 'react';
import { auth, firestore } from '@/config/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { UserInfo, Role, UserType } from '@/types/auth';

export const useUserInfo = (): UserInfo => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    userId: '',
    companyId: '',
    role: Role.COMPANY_ADMIN,
    userName: '',
    isAuthenticated: false,
    email: '',
    name: '',
    userType: UserType.Customer,
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // Check localStorage first
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          const userData = JSON.parse(storedUserInfo);
          setUserInfo({
            userId: userData.userId || '',
            companyId: userData.companyId || 'abc_pvt_ltd',
            role: userData.role || Role.COMPANY_ADMIN,
            userName: userData.userName || '',
            isAuthenticated: !!(userData.userId),
            email: userData.email || '',
            name: userData.name || '',
            userType: userData.userType || UserType.Customer,
            latitude: userData.latitude || null,
            longitude: userData.longitude || null,
            dailyWage: userData.dailyWage || null,
            storeId: userData.storeId || null,
            accountLedgerId: userData.accountLedgerId || null,
            mobileNumber: userData.mobileNumber || null,
            businessName: userData.businessName || null,
            address: userData.address || null,
          });
          return;
        }

        // If no localStorage data, check Firebase Auth
        const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
          if (user) {
            // Check superAdmin path
            const superAdminDocRef = doc(firestore, `Easy2Solutions/superAdmin/${user.uid}`);
            const superAdminSnapshot = await getDoc(superAdminDocRef);

            if (superAdminSnapshot.exists()) {
              const userInfoData: UserInfo = {
                userId: user.uid,
                companyId: '',
                role: Role.SUPER_ADMIN,
                userName: user.displayName || '',
                isAuthenticated: true,
                email: user.email || '',
                name: '',
                userType: UserType.Boss,
              };
              localStorage.setItem('userInfo', JSON.stringify(userInfoData));
              setUserInfo(userInfoData);
              return;
            }

            // Check tenant users - default to abc_pvt_ltd for now
            const userDocRef = doc(firestore, `Easy2Solutions/companyDirectory/tenantCompanies/abc_pvt_ltd/users/${user.uid}`);
            const userSnapshot = await getDoc(userDocRef);

            if (userSnapshot.exists()) {
              const userData = userSnapshot.data();
              const userInfoData: UserInfo = {
                userId: userData.userId || user.uid,
                companyId: userData.companyId || 'abc_pvt_ltd',
                role: userData.role || Role.COMPANY_ADMIN,
                userName: userData.userName || user.displayName || '',
                isAuthenticated: true,
                email: userData.email || user.email || '',
                name: userData.name || '',
                userType: userData.userType || UserType.Customer,
                latitude: userData.latitude || null,
                longitude: userData.longitude || null,
                dailyWage: userData.dailyWage || 500.0,
                storeId: userData.storeId || null,
                accountLedgerId: userData.accountLedgerId || null,
                mobileNumber: userData.mobileNumber || null,
                businessName: userData.businessName || null,
                address: userData.address || null,
              };
              localStorage.setItem('userInfo', JSON.stringify(userInfoData));
              setUserInfo(userInfoData);
            } else {
              // Create default customer user for new Firebase users
              const defaultUserData: UserInfo = {
                userId: user.uid,
                companyId: 'abc_pvt_ltd',
                role: Role.COMPANY_ADMIN,
                userName: user.displayName || user.email?.split('@')[0] || '',
                isAuthenticated: true,
                email: user.email || '',
                name: user.displayName || '',
                userType: UserType.Customer,
              };
              localStorage.setItem('userInfo', JSON.stringify(defaultUserData));
              setUserInfo(defaultUserData);
            }
          } else {
            // No user logged in
            localStorage.removeItem('userInfo');
            setUserInfo({
              userId: '',
              companyId: 'abc_pvt_ltd',
              role: Role.COMPANY_ADMIN,
              userName: '',
              isAuthenticated: false,
              email: '',
              name: '',
              userType: UserType.Customer,
            });
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching user info:', error);
        localStorage.removeItem('userInfo');
        setUserInfo({
          userId: '',
          companyId: 'abc_pvt_ltd',
          role: Role.COMPANY_ADMIN,
          userName: '',
          isAuthenticated: false,
          email: '',
          name: '',
          userType: UserType.Customer,
        });
      }
    };

    fetchUserInfo();
  }, []);

  return userInfo;
};