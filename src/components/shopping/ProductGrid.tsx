import React from 'react';
import { ProductCard } from './ProductCard';
import { useFirebaseProducts } from '@/hooks/useFirebaseProducts';

interface ProductGridProps {
  searchTerm: string;
  selectedCategories: string[];
  selectedSubcategories: string[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  searchTerm,
  selectedCategories,
  selectedSubcategories,
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
        <h3 className="text-lg font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredProducts.map((product) => (
        <ProductCard
          key={product.productId}
          product={product}
          onProductClick={() => {}}
        />
      ))}
    </div>
  );
};
