export enum Role {
  SUPER_ADMIN = 'super_admin',
  COMPANY_ADMIN = 'company_admin', 
  STORE_ADMIN = 'store_admin',
  STORE_MANAGER = 'store_manager',
  STORE_ACCOUNTANT = 'store_accountant',
  COMPANY_ACCOUNTANT = 'company_accountant',
  SALESMAN = 'salesman',
  DELIVERY = 'delivery',
  MANAGER = 'manager',
  CUSTOMER = "CUSTOMER"
}

export enum UserType {
  Employee = 'Employee',
  Supplier = 'Supplier', 
  Customer = 'Customer',
  Boss = 'Boss',
  ThirdPartyVendor = 'ThirdPartyVendor',
  Contractor = 'Contractor'
}

export interface UserInfo {
  userId: string;
  companyId?: string;
  name: string;
  email: string;
  userName: string;
  role: Role;
  userType?: UserType;
  latitude?: number;
  longitude?: number;
  dailyWage?: number;
  storeId?: string;
  accountLedgerId?: string;
  mobileNumber?: string;
  businessName?: string;
  address?: string;
  full_name?: string;
  shop_id?: string;
  store_id?: string;
  id?: string;
  username?: string;
  isAuthenticated: boolean;
}