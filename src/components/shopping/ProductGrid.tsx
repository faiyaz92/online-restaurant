import React from 'react';
import { Product, Category } from '@/types/product';
import { ProductCard } from './ProductCard';
import { useFirebaseProducts } from '@/hooks/useFirebaseProducts';

interface ProductGridProps {
  searchTerm: string;
  selectedCategories: string[];
  selectedSubcategories: string[];
  categories: Category[];
}

// ProductGrid.tsx
export const ProductGrid: React.FC<ProductGridProps> = ({
  searchTerm,
  selectedCategories,
  selectedSubcategories,
  categories,
}) => {
  const { products, loading } = useFirebaseProducts();

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory =
      selectedCategories.includes('all') ||
      selectedCategories.includes(product.categoryId);
    
    const matchesSubcategory =
      selectedSubcategories.length === 0 ||
      selectedSubcategories.includes(product.subcategoryId || '');
    
    return matchesSearch && matchesCategory && matchesSubcategory;
  });

  const productsByCategory = filteredProducts.reduce((acc, product) => {
    const categoryId = product.categoryId;
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const sortedCategoryIds = categories
    .filter((cat) => productsByCategory[cat.categoryId]?.length > 0)
    .map((cat) => cat.categoryId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <div className="text-4xl">📦</div>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-3 py-3">
      {sortedCategoryIds.map((categoryId) => {
        const category = categories.find((cat) => cat.categoryId === categoryId);
        return (
          <div key={categoryId} className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{category?.name || 'Uncategorized'}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {productsByCategory[categoryId].map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  onProductClick={() => {}}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};