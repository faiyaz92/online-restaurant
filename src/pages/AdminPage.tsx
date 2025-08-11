import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Dashboard } from '@/components/admin/Dashboard';

interface AdminPageProps {
  onBackToStore: () => void;
  onLogout: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToStore, onLogout }) => {
  return (
    <AdminLayout onBackToStore={onBackToStore} onLogout={onLogout}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<div>Products Management</div>} />
        <Route path="/categories" element={<div>Categories Management</div>} />
        <Route path="/orders" element={<div>Orders Management</div>} />
        <Route path="/customers" element={<div>Customers Management</div>} />
        <Route path="/analytics" element={<div>Analytics</div>} />
        <Route path="/promotions" element={<div>Promotions Management</div>} />
        <Route path="/settings" element={<div>Settings</div>} />
      </Routes>
    </AdminLayout>
  );
};