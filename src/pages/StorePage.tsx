import React, { useState } from 'react';
import { Header } from '@/components/shopping/Header';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { CategoryFilter } from '@/components/shopping/CategoryFilter';
import { SearchBar } from '@/components/shopping/SearchBar';
import { Cart } from '@/components/shopping/Cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Product, Category } from '@/types/product';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { useUserInfo } from '@/hooks/useUserInfo';
import { Role } from '@/types/auth';

interface StorePageProps {
  onAdminClick: () => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

export const StorePage: React.FC<StorePageProps> = ({ 
  onAdminClick, 
  onLoginClick, 
  onLogoutClick 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'popular'>('popular');
  
  const userInfo = useUserInfo();

  // Mock data - replace with real data from Firebase
  const mockCategories: Category[] = [
    { categoryId: '1', name: 'Electronics', description: 'Latest gadgets', companyId: 'abc_pvt_ltd' },
    { categoryId: '2', name: 'Clothing', description: 'Fashion items', companyId: 'abc_pvt_ltd' },
    { categoryId: '3', name: 'Home & Garden', description: 'Home essentials', companyId: 'abc_pvt_ltd' },
    { categoryId: '4', name: 'Sports', description: 'Sports equipment', companyId: 'abc_pvt_ltd' },
    { categoryId: '5', name: 'Books', description: 'Books and magazines', companyId: 'abc_pvt_ltd' },
  ];

  const mockProducts: Product[] = [
    {
      productId: '1',
      name: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 99.99,
      discountedPrice: 79.99,
      images: ['/placeholder.svg'],
      categoryId: '1',
      stock: 15,
      createdAt: new Date(),
      companyId: 'abc_pvt_ltd'
    },
    {
      productId: '2',
      name: 'Smart Fitness Watch',
      description: 'Track your fitness goals with this advanced smartwatch',
      price: 249.99,
      images: ['/placeholder.svg'],
      categoryId: '1',
      stock: 8,
      createdAt: new Date(),
      companyId: 'abc_pvt_ltd'
    },
    {
      productId: '3',
      name: 'Cotton T-Shirt',
      description: 'Comfortable 100% cotton t-shirt in multiple colors',
      price: 24.99,
      discountedPrice: 19.99,
      images: ['/placeholder.svg'],
      categoryId: '2',
      stock: 50,
      createdAt: new Date(),
      companyId: 'abc_pvt_ltd'
    },
    {
      productId: '4',
      name: 'Running Shoes',
      description: 'Professional running shoes for all terrains',
      price: 129.99,
      images: ['/placeholder.svg'],
      categoryId: '4',
      stock: 25,
      createdAt: new Date(),
      companyId: 'abc_pvt_ltd'
    },
    {
      productId: '5',
      name: 'Programming Book',
      description: 'Learn modern programming techniques',
      price: 45.99,
      discountedPrice: 35.99,
      images: ['/placeholder.svg'],
      categoryId: '5',
      stock: 0,
      createdAt: new Date(),
      companyId: 'abc_pvt_ltd'
    },
    {
      productId: '6',
      name: 'Coffee Maker',
      description: 'Automatic coffee maker with timer',
      price: 89.99,
      images: ['/placeholder.svg'],
      categoryId: '3',
      stock: 12,
      createdAt: new Date(),
      companyId: 'abc_pvt_ltd'
    }
  ];

  const filteredProducts = mockProducts
    .filter(product => {
      const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.discountedPrice || a.price) - (b.discountedPrice || b.price);
        case 'price-high':
          return (b.discountedPrice || b.price) - (a.discountedPrice || a.price);
        default:
          return 0;
      }
    });

  const handleProductClick = (product: Product) => {
    // Navigate to product detail page or open modal
    console.log('Product clicked:', product);
  };

  const handleCheckout = () => {
    // Navigate to checkout page
    console.log('Proceed to checkout');
    setShowCart(false);
  };

  const canAccessAdmin = userInfo.role === Role.COMPANY_ADMIN || userInfo.role === Role.SUPER_ADMIN;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onCartClick={() => setShowCart(true)}
        onLogin={onLoginClick}
        onLogout={onLogoutClick}
        onAdminClick={canAccessAdmin ? onAdminClick : undefined}
      />
      
      <main className="container py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Hidden on mobile, shown in sheet */}
          <div className="hidden lg:block w-64 space-y-6">
            <SearchBar onSearch={setSearchQuery} />
            <CategoryFilter
              categories={mockCategories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          </div>

          {/* Main content */}
          <div className="flex-1 space-y-6">
            {/* Mobile filters and search */}
            <div className="lg:hidden space-y-4">
              <SearchBar onSearch={setSearchQuery} />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowFilters(true)}
                  className="flex-1"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </div>
            </div>

            {/* Results header */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">
                  {selectedCategory 
                    ? mockCategories.find(c => c.categoryId === selectedCategory)?.name 
                    : 'All Products'
                  }
                </h1>
                <p className="text-muted-foreground">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                </p>
              </div>

              <div className="hidden lg:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <div className="flex gap-1">
                  {[
                    { value: 'popular', label: 'Popular' },
                    { value: 'price-low', label: 'Price: Low to High' },
                    { value: 'price-high', label: 'Price: High to Low' }
                  ].map(option => (
                    <Button
                      key={option.value}
                      variant={sortBy === option.value ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSortBy(option.value as any)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active filters */}
            {(selectedCategory || searchQuery) && (
              <div className="flex flex-wrap gap-2">
                {selectedCategory && (
                  <Badge variant="secondary" className="gap-1">
                    {mockCategories.find(c => c.categoryId === selectedCategory)?.name}
                    <button 
                      onClick={() => setSelectedCategory(null)}
                      className="ml-1 hover:bg-destructive/20 rounded-full"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: "{searchQuery}"
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:bg-destructive/20 rounded-full"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Product grid */}
            <ProductGrid 
              products={filteredProducts} 
              onProductClick={handleProductClick}
            />
          </div>
        </div>
      </main>

      {/* Mobile Filters Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Filter products by category and other options
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <CategoryFilter
              categories={mockCategories}
              selectedCategory={selectedCategory}
              onCategorySelect={(categoryId) => {
                setSelectedCategory(categoryId);
                setShowFilters(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Cart Sheet */}
      <Sheet open={showCart} onOpenChange={setShowCart}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Shopping Cart</SheetTitle>
            <SheetDescription>
              Review your items before checkout
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <Cart products={mockProducts} onCheckout={handleCheckout} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};