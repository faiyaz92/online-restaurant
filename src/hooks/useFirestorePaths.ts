import { useMemo } from 'react';

export const useFirestorePaths = (companyId?: string) => {
  // Define root path and tenant companies path
  const basePath = 'Easy2Solutions/companyDirectory';
  const tenantCompaniesPath = `${basePath}/tenantCompanies`;

  return useMemo(() => {
    // If companyId is undefined, return empty paths
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
      };
    }

    // Return all Firestore paths when companyId is provided
    return {
      // Base path for the company directory
      getBasePath: () => basePath,

      // Super admins collection
      getSuperAdminPath: () => `${basePath}/superAdmins`,

      // Common users collection
      getCommonUsersPath: () => `${basePath}/users`,

      // Tenant company document
      getTenantCompanyPath: () => `${tenantCompaniesPath}/${companyId}`,

      // Tenant users collection
      getTenantUsersPath: () => `${tenantCompaniesPath}/${companyId}/users`,

      // Specific tenant user document
      getTenantUserPath: (userId: string) => `${tenantCompaniesPath}/${companyId}/users/${userId}`,

      // Customer companies collection
      getCustomerCompanyPath: () => `${tenantCompaniesPath}/${companyId}/companies`,

      // Specific customer company document
      getSingleCustomerCompanyPath: (customerCompanyId: string) =>
        `${tenantCompaniesPath}/${companyId}/companies/${customerCompanyId}`,

      // Tasks collection
      getTaskCollectionPath: () => `${tenantCompaniesPath}/${companyId}/tasks`,

      // Specific task document
      getSingleTaskPath: (taskId: string) => `${tenantCompaniesPath}/${companyId}/tasks/${taskId}`,

      // Products collection
      getProductPath: () => `${tenantCompaniesPath}/${companyId}/products`,

      // Categories collection
      getCategoryPath: () => `${tenantCompaniesPath}/${companyId}/categories`,

      // Subcategories collection
      getSubcategoryPath: () => `${tenantCompaniesPath}/${companyId}/subcategories`,

      // Stores collection
      getStoresPath: () => `${tenantCompaniesPath}/${companyId}/stores`,

      // Stock collection for a specific store
      getStockPath: (storeId: string) => `${tenantCompaniesPath}/${companyId}/stores/${storeId}/stock`,

      // Transactions collection for a specific store
      getTransactionsPath: (storeId: string) =>
        `${tenantCompaniesPath}/${companyId}/stores/${storeId}/transactions`,

      // Account ledgers collection
      getAccountLedgerPath: () => `${tenantCompaniesPath}/${companyId}/accountLedgers`,

      // Specific account ledger document
      getAccountLedgerRef: (ledgerId: string) =>
        `${tenantCompaniesPath}/${companyId}/accountLedgers/${ledgerId}`,

      // Transactions collection for a specific ledger
      getTransactionsRef: (ledgerId: string) =>
        `${tenantCompaniesPath}/${companyId}/accountLedgers/${ledgerId}/transactions`,

      // Orders collection
      getOrdersPath: () => `${tenantCompaniesPath}/${companyId}/orders`,

      // Specific order document
      getSingleOrderPath: (orderId: string) => `${tenantCompaniesPath}/${companyId}/orders/${orderId}`,

      // Invoices collection
      getInvoicesPath: () => `${tenantCompaniesPath}/${companyId}/invoices`,

      // Specific invoice document
      getSingleInvoicePath: (invoiceId: string) => `${tenantCompaniesPath}/${companyId}/invoices/${invoiceId}`,

      // Carts collection
      getCartsPath: () => `${tenantCompaniesPath}/${companyId}/carts`,

      // Specific user cart document
      getUserCartPath: (userId: string) => `${tenantCompaniesPath}/${companyId}/carts/${userId}`,

      // Wishlists collection
      getWishlistPath: () => `${tenantCompaniesPath}/${companyId}/wishlists`,

      // Specific user wishlist document
      getUserWishlistPath: (userId: string) => `${tenantCompaniesPath}/${companyId}/wishlists/${userId}`,

      // Taxi bookings collection
      getTaxiBookingsPath: () => `${tenantCompaniesPath}/${companyId}/taxiBookings`,

      // Taxi types collection
      getTaxiTypesPath: () => `${tenantCompaniesPath}/${companyId}/settings/taxiBookingSettings/taxiTypes`,

      // Trip types collection
      getTripTypesPath: () => `${tenantCompaniesPath}/${companyId}/settings/taxiBookingSettings/tripTypes`,

      // Service types collection
      getServiceTypesPath: () => `${tenantCompaniesPath}/${companyId}/settings/taxiBookingSettings/serviceTypes`,

      // Trip statuses collection
      getTripStatusesPath: () => `${tenantCompaniesPath}/${companyId}/settings/taxiBookingSettings/tripStatuses`,

      // Taxi booking settings document
      getTaxiBookingSettingsPath: () => `${tenantCompaniesPath}/${companyId}/settings/taxiBookingSettings`,

      // Visitor counters collection
      getVisitorCountersPath: () => `${tenantCompaniesPath}/${companyId}/analytics/visitorCounters/daily`,
    };
  }, [companyId]);
};