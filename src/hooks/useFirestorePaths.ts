import { useMemo } from 'react';

export const useFirestorePaths = (companyId?: string) => {
  const basePath = 'Easy2Solutions/companyDirectory';
  const tenantCompaniesPath = `${basePath}/tenantCompanies`;

  return useMemo(() => {
    if (!companyId) {
      return {
        getBasePath: () => '',
        getSuperAdminPath: () => '',
        getCommonUsersPath: () => '',
        getTenantCompanyPath: () => '',
        getTenantUsersPath: () => '',
        getTenantUserPath: (_userId: string) => '',
        getCustomerCompanyPath: () => '',
        getSingleCustomerCompanyPath: (_customerCompanyId: string) => '',
        getTaskCollectionPath: () => '',
        getSingleTaskPath: (_taskId: string) => '',
        getProductPath: () => '',
        getCategoryPath: () => '',
        getSubcategoryPath: () => '',
        getStoresPath: () => '',
        getStockPath: (_storeId: string) => '',
        getTransactionsPath: (_storeId: string) => '',
        getAccountLedgerPath: () => '',
        getAccountLedgerRef: (_ledgerId: string) => '',
        getTransactionsRef: (_ledgerId: string) => '',
        getOrdersPath: () => '',
        getSingleOrderPath: (_orderId: string) => '',
        getInvoicesPath: () => '',
        getSingleInvoicePath: (_invoiceId: string) => '',
        getCartsPath: () => '',
        getUserCartPath: (_userId: string) => '',
        getWishlistPath: () => '',
        getUserWishlistPath: (_userId: string) => '',
        getTaxiBookingsPath: () => '',
        getTaxiTypesPath: () => '',
        getTripTypesPath: () => '',
        getServiceTypesPath: () => '',
        getTripStatusesPath: () => '',
        getTaxiBookingSettingsPath: () => '',
        getVisitorCountersPath: () => '',
        getUserAddressesPath: (_userId: string) => '',
      };
    }

    return {
      getBasePath: () => basePath,
      getSuperAdminPath: () => `${basePath}/superAdmins`,
      getCommonUsersPath: () => `${basePath}/users`,
      getTenantCompanyPath: () => `${tenantCompaniesPath}/${companyId}`,
      getTenantUsersPath: () => `${tenantCompaniesPath}/${companyId}/users`,
      getTenantUserPath: (userId: string) => `${tenantCompaniesPath}/${companyId}/users/${userId}`,
      getCustomerCompanyPath: () => `${tenantCompaniesPath}/${companyId}/companies`,
      getSingleCustomerCompanyPath: (customerCompanyId: string) =>
        `${tenantCompaniesPath}/${companyId}/companies/${customerCompanyId}`,
      getTaskCollectionPath: () => `${tenantCompaniesPath}/${companyId}/tasks`,
      getSingleTaskPath: (taskId: string) => `${tenantCompaniesPath}/${companyId}/tasks/${taskId}`,
      getProductPath: () => `${tenantCompaniesPath}/${companyId}/products`,
      getCategoryPath: () => `${tenantCompaniesPath}/${companyId}/categories`,
      getSubcategoryPath: () => `${tenantCompaniesPath}/${companyId}/subcategories`,
      getStoresPath: () => `${tenantCompaniesPath}/${companyId}/stores`,
      getStockPath: (storeId: string) => `${tenantCompaniesPath}/${companyId}/stores/${storeId}/stock`,
      getTransactionsPath: (storeId: string) =>
        `${tenantCompaniesPath}/${companyId}/stores/${storeId}/transactions`,
      getAccountLedgerPath: () => `${tenantCompaniesPath}/${companyId}/accountLedgers`,
      getAccountLedgerRef: (ledgerId: string) =>
        `${tenantCompaniesPath}/${companyId}/accountLedgers/${ledgerId}`,
      getTransactionsRef: (ledgerId: string) =>
        `${tenantCompaniesPath}/${companyId}/accountLedgers/${ledgerId}/transactions`,
      getOrdersPath: () => `${tenantCompaniesPath}/${companyId}/orders`,
      getSingleOrderPath: (orderId: string) => `${tenantCompaniesPath}/${companyId}/orders/${orderId}`,
      getInvoicesPath: () => `${tenantCompaniesPath}/${companyId}/invoices`,
      getSingleInvoicePath: (invoiceId: string) => `${tenantCompaniesPath}/${companyId}/invoices/${invoiceId}`,
      getCartsPath: () => `${tenantCompaniesPath}/${companyId}/carts`,
      getUserCartPath: (userId: string) => `${tenantCompaniesPath}/${companyId}/carts/${userId}`,
      getWishlistPath: () => `${tenantCompaniesPath}/${companyId}/wishlists`,
      getUserWishlistPath: (userId: string) => `${tenantCompaniesPath}/${companyId}/wishlists/${userId}`,
      getTaxiBookingsPath: () => `${tenantCompaniesPath}/${companyId}/taxiBookings`,
      getTaxiTypesPath: () => `${tenantCompaniesPath}/${companyId}/settings/taxiBookingSettings/taxiTypes`,
      getTripTypesPath: () => `${tenantCompaniesPath}/${companyId}/settings/taxiBookingSettings/tripTypes`,
      getServiceTypesPath: () => `${tenantCompaniesPath}/${companyId}/settings/taxiBookingSettings/serviceTypes`,
      getTripStatusesPath: () => `${tenantCompaniesPath}/${companyId}/settings/taxiBookingSettings/tripStatuses`,
      getTaxiBookingSettingsPath: () => `${tenantCompaniesPath}/${companyId}/settings/taxiBookingSettings`,
      getVisitorCountersPath: () => `${tenantCompaniesPath}/${companyId}/analytics/visitorCounters/daily`,
      getUserAddressesPath: (userId: string) => `${tenantCompaniesPath}/${companyId}/users/${userId}/addresses`,
    };
  }, [companyId]);
};
