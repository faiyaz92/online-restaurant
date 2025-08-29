import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Dashboard } from '@/components/admin/Dashboard';
import { ProductManager } from '@/components/admin/ProductManager';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { OrderManager } from '@/components/admin/OrderManager';
import { OrderDetails } from '@/components/admin/OrderDetails';
import { SettingsPage } from '@/components/admin/SettingsManager';
import { InquiriesPage } from '@/components/admin/InquiresPage';
import AdminUserList from '@/components/admin/AdminUserList';
// import UserListPage from '@/components/admin/UserListPage';
// import { UserManager } from '@/components/admin/UsersManagment';

interface AdminPageProps {
  onBackToStore: () => void;
  onLogout: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToStore, onLogout }) => {
  return (
    <AdminLayout onBackToStore={onBackToStore} onLogout={onLogout}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<ProductManager />} />
        <Route path="/categories" element={<CategoryManager />} />
        <Route path="/orders" element={<OrderManager />} />
        <Route path="/order-details/:orderId" element={<OrderDetails />} />
        <Route path="/users" element={<AdminUserList />} />
        <Route path="/analytics" element={<div>Analytics</div>} />
        <Route path="/promotions" element={<div>Promotions Management</div>} />
        <Route path="/inquiries" element={<InquiriesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AdminLayout>
  );
};