import { useAuth } from '@/contexts/AuthContext';
import { Role, UserType } from '@/types/auth';

export const useUserInfo = () => {
  const { userInfo, currentUser, userInfoLoading } = useAuth(); // Add userInfoLoading
  
  const mapRoleToEnum = (role: string | Role): Role => {
    if (role === Role.COMPANY_ADMIN || role === 'admin') return Role.COMPANY_ADMIN;
    if (role === Role.CUSTOMER || role === 'customer') return Role.CUSTOMER;
    if (typeof role === 'string' && Object.values(Role).includes(role as Role)) return role as Role;
    return Role.CUSTOMER;
  };

  const mapUserTypeToEnum = (userType: string | UserType): UserType => {
    if (userType === UserType.Employee || userType === 'Employee' || userType === 'admin') return UserType.Employee;
    if (userType === UserType.Customer || userType === 'Customer' || userType === 'customer') return UserType.Customer;
    if (typeof userType === 'string' && Object.values(UserType).includes(userType as UserType)) return userType as UserType;
    return UserType.Customer;
  };
  
  return {
    userId: userInfo?.id || '',
    companyId: userInfo?.companyId || 'shopping_cart',
    role: mapRoleToEnum(userInfo?.role || 'customer'),
    userName: userInfo?.name || 'Guest User',
    isAuthenticated: !!currentUser,
    email: userInfo?.email || 'guest@example.com',
    name: userInfo?.name || 'Guest User',
    userType: mapUserTypeToEnum(userInfo?.userType || 'customer'),
    mobileNumber: userInfo?.mobileNumber || '',
    address: userInfo?.address || '',
    loading: userInfoLoading, // Expose loading
  };
};