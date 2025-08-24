import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StorePage } from "./pages/StorePage";
import { CartPage } from "./pages/Cart";
import { AdminPage } from "./pages/AdminPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import { OrderListPage } from "./pages/UserOrderList";
import { OrderDetailsPage } from "./pages/UserOrderDetailsPage";
import { AuthProvider } from "./contexts/AuthContext";
import LoginForm from "./components/auth/LoginForm";
import NotFound from "./pages/NotFound";
import { CheckoutForm } from './pages/CheckoutForm';

const queryClient = new QueryClient();

const App = () => {
  // Define onOrderComplete
  const handleOrderComplete = () => {
    console.log('Order completed successfully');
    // Add any post-order logic here (e.g., reset state, trigger analytics)
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<StorePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/admin/*" element={<AdminPage onBackToStore={() => window.location.href = '/'} onLogout={() => {}} />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              <Route path="/orders" element={<OrderListPage />} />
              <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/checkout" element={<CheckoutForm onOrderComplete={handleOrderComplete} />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;