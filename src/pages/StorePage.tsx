
import React, { useState } from 'react';
import { Header } from '@/components/shopping/Header';
import { CategoryFilter } from '@/components/shopping/CategoryFilter';
import { SearchBar } from '@/components/shopping/SearchBar';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { Cart } from '@/components/shopping/Cart';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebaseCategories } from '@/hooks/useFirebaseCategories';
import { Category } from '@/types/product';
import LoginForm from '@/components/auth/LoginForm';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Package } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundry';

export const StorePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { currentUser, logout } = useAuth();
  const { categories: firebaseCategories } = useFirebaseCategories();
  const navigate = useNavigate();

  // Convert Firebase categories to Product categories
  const categories: Category[] = firebaseCategories.map((cat) => ({
    categoryId: cat.id,
    name: cat.name,
    description: cat.description,
    image: cat.image,
    companyId: 'shopping_cart',
  }));

  const handleCategoryChange = (categoryIds: string[]) => {
    setSelectedCategories(categoryIds);
    // Reset subcategories when categories change
    setSelectedSubcategories([]);
  };

  const handleSubcategoryChange = (subcategoryIds: string[]) => {
    setSelectedSubcategories(subcategoryIds);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
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
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <LoginForm />
        <button
          onClick={() => setShowLogin(false)}
          className="fixed top-4 left-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-md hover:bg-primary/90 transition-colors duration-200"
        >
          Back to Store
        </button>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header
          onCartClick={() => setShowCart(true)}
          onLogin={() => setShowLogin(true)}
          onLogout={logout}
          onAdminClick={() => navigate('/admin')}
          onOrdersClick={handleViewOrders}
        />
        <CheckoutForm onOrderComplete={handleOrderComplete} />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <Header
          onCartClick={() => setShowCart(true)}
          onLogin={() => setShowLogin(true)}
          onLogout={logout}
          onAdminClick={() => navigate('/admin')}
          onOrdersClick={handleViewOrders}
        />

        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden container mx-auto px-4 py-4">
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200"
          >
            <ShoppingBag className="h-5 w-5" />
            <span>{showMobileSidebar ? 'Close' : 'Filters'}</span>
          </button>
        </div>

        <main className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside
              className={`lg:w-80 space-y-6 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] transition-all duration-300 ${
                showMobileSidebar ? 'block' : 'hidden lg:block'
              }`}
            >
              <div className="bg-background rounded-lg shadow-sm p-4">
                <SearchBar value={searchTerm} onChange={setSearchTerm} />
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

            {/* Main Content */}
            <div className="flex-1">
              <ProductGrid
                searchTerm={searchTerm}
                selectedCategories={selectedCategories}
                selectedSubcategories={selectedSubcategories}
              />
            </div>
          </div>
        </main>

        {/* Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
            <div className="bg-background rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95">
              <div className="flex justify-between items-center p-6 border-b border-muted">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <ShoppingBag className="h-6 w-6" />
                  Shopping Cart
                </h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted transition-colors duration-200"
                  aria-label="Close cart"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <Cart onCheckout={handleCheckout} />
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};
