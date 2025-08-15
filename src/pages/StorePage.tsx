import React, { useState } from 'react';
import { Header } from '@/components/shopping/Header';
import { CategoryFilter } from '@/components/shopping/CategoryFilter';
import { SearchBar } from '@/components/shopping/SearchBar';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { Cart } from '@/components/shopping/Cart';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebaseProducts } from '@/hooks/useFirebaseProducts';
import LoginForm from '@/components/auth/LoginForm';
import { Product } from '@/types/product';

export const StorePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { currentUser } = useAuth();
  const { products } = useFirebaseProducts();

  const handleCheckout = () => {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }
    setShowCart(false);
    setShowCheckout(true);
  };

  const handleOrderComplete = () => {
    setShowCheckout(false);
    setShowCart(false);
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-background">
        <LoginForm />
        <button 
          onClick={() => setShowLogin(false)}
          className="fixed top-4 left-4 p-2 bg-primary text-primary-foreground rounded"
        >
          Back to Store
        </button>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-background">
        <Header onCartClick={() => setShowCart(true)} />
        <CheckoutForm onOrderComplete={handleOrderComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => setShowCart(true)} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 space-y-6">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Main content */}
          <div className="flex-1">
            <ProductGrid
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
            />
          </div>
        </div>
      </main>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
              <button 
                onClick={() => setShowCart(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <Cart onCheckout={handleCheckout} />
          </div>
        </div>
      )}
    </div>
  );
};