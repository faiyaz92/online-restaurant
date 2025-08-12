import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Dashboard } from '@/components/admin/Dashboard';
import { ProductManager } from '@/components/admin/ProductManager';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { OrderManager } from '@/components/admin/OrderManager';

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
        <Route path="/customers" element={<div>Customers Management</div>} />
        <Route path="/analytics" element={<div>Analytics</div>} />
        <Route path="/promotions" element={<div>Promotions Management</div>} />
        <Route path="/settings" element={<div>Settings</div>} />
      </Routes>
    </AdminLayout>
  );
};