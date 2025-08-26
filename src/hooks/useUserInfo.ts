import { useAuth } from '@/contexts/AuthContext';
import { Role, UserType } from '@/types/auth';

export const useUserInfo = () => {
  const { userInfo, currentUser, userInfoLoading } = useAuth(); // Add userInfoLoading
  
  const mapRoleToEnum = (role: string): Role => {
    if (role === 'admin') return Role.COMPANY_ADMIN;
    return Role.COMPANY_ADMIN; // default
  };
  
  const mapUserTypeToEnum = (userType: string): UserType => {
    if (userType === 'Employee') return UserType.Employee;
    return UserType.Customer; // default for customers
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