import React, { useState } from 'react';
import { Header } from '@/components/shopping/Header';
import { CategoryFilter } from '@/components/shopping/CategoryFilter';
import { SearchBar } from '@/components/shopping/SearchBar';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { Footer } from '@/components/shopping/Footer';
import { CheckoutForm } from '@/pages/CheckoutForm';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebaseCategories } from '@/hooks/useFirebaseCategories';
import { Category } from '@/types/product';
import LoginForm from '@/components/auth/LoginForm';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Menu } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundry';

export const StorePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { currentUser, logout } = useAuth();
  const { categories: firebaseCategories } = useFirebaseCategories();
  const navigate = useNavigate();

  const categories: Category[] = firebaseCategories.map((cat) => ({
    categoryId: cat.id,
    name: cat.name,
    description: cat.description,
    image: cat.image,
    companyId: 'shopping_cart',
  }));

  const handleCategoryChange = (categoryIds: string[]) => {
    setSelectedCategories(categoryIds);
    setSelectedSubcategories([]);
  };

  const handleSubcategoryChange = (subcategoryIds: string[]) => {
    setSelectedSubcategories(subcategoryIds);
  };

  const handleClearFilters = () => {
    setSelectedCategories(['all']);
    setSelectedSubcategories([]);
  };

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
    navigate('/order-confirmation');
  };

  const handleViewOrders = () => {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }
    navigate('/orders');
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
        <LoginForm />
        <button
          onClick={() => setShowLogin(false)}
          className="fixed top-4 left-4 px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-md hover:bg-primary/90 transition-colors duration-200"
        >
          Back to Store
        </button>
        <Footer />
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
        <Header
          onLogin={() => setShowLogin(true)}
          onLogout={logout}
          onAdminClick={() => navigate('/admin')}
          onOrdersClick={handleViewOrders}
        />
        <CheckoutForm onOrderComplete={handleOrderComplete} />
        <Footer />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
        {/* Header */}
        <Header
          onLogin={() => setShowLogin(true)}
          onLogout={logout}
          onAdminClick={() => navigate('/admin')}
          onOrdersClick={handleViewOrders}
        />

        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden container mx-auto px-4 py-3">
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200 text-sm"
          >
            <Menu className="h-4 w-4" />
            <span>{showMobileSidebar ? 'Close Filters' : 'Filters'}</span>
          </button>
        </div>

        <main className="container mx-auto px-4 py-6 flex-1 flex">
          <div className="flex flex-col lg:flex-row gap-6 w-full">
            {/* Sidebar */}
            <aside
              className={`fixed inset-y-0 left-0 z-40 w-64 bg-background transform ${
                showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
              } lg:transform-none lg:static lg:w-64 transition-transform duration-300 ease-in-out h-full lg:max-h-[calc(100vh-8rem)]`}
            >
              <div className="h-full bg-background rounded-md shadow-sm p-3">
                <CategoryFilter
                  categories={categories}
                  selectedCategories={selectedCategories}
                  selectedSubcategories={selectedSubcategories}
                  onCategoryChange={handleCategoryChange}
                  onSubcategoryChange={handleSubcategoryChange}
                  onClearFilters={handleClearFilters}
                />
              </div>
            </aside>

            {/* Mobile Sidebar Backdrop */}
            {showMobileSidebar && (
              <div
                className="lg:hidden fixed inset-0 bg-black/50 z-30"
                onClick={() => setShowMobileSidebar(false)}
              />
            )}

            {/* Main Content */}
            <div className="flex-1 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="mb-6">
                <SearchBar value={searchTerm} onChange={setSearchTerm} />
              </div>
              <ProductGrid
                searchTerm={searchTerm}
                selectedCategories={selectedCategories}
                selectedSubcategories={selectedSubcategories}
                categories={categories}
              />
            </div>
          </div>
        </main>

        {/* Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
            <div className="bg-background rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95">
              <div className="flex justify-between items-center p-4 border-b border-muted">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Shopping Cart
                </h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted transition-colors duration-200"
                  aria-label="Close cart"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* Cart content goes here */}
            </div>
          </div>
        )}

        {/* Footer */}
        <Footer />
      </div>
    </ErrorBoundary>
  );
};