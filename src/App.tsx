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
import { AboutUs } from "./pages/AboutUsPage";
import { ProductsPage } from "./pages/ProductsPage";
import { ContactUs } from "./pages/ContactUsPage";
import LoginForm from "./components/auth/LoginForm";
import NotFound from "./pages/NotFound";
import { CheckoutForm } from './pages/CheckoutForm';
import { SignUp } from './pages/SignUpPage';

const queryClient = new QueryClient();

const App = () => {
  const handleOrderComplete = () => {
    console.log('Order completed successfully');
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
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/admin/*" element={<AdminPage onBackToStore={() => window.location.href = '/'} onLogout={() => {}} />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              <Route path="/orders" element={<OrderListPage />} />
              <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
              <Route path="/checkout" element={<CheckoutForm onOrderComplete={handleOrderComplete} />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App; 
