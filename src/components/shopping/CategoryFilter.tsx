
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Category } from '@/types/product';
import { useFirebaseSubcategories, Subcategory } from '@/hooks/useFirebaseSubcategories';
import { useFirebaseProducts } from '@/hooks/useFirebaseProducts';

interface CategoryFilterProps {
  categories?: Category[];
  selectedCategories: string[];
  selectedSubcategories: string[];
  onCategoryChange: (categoryIds: string[]) => void;
  onSubcategoryChange: (subcategoryIds: string[]) => void;
  onClearFilters: () => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories = [],
  selectedCategories,
  selectedSubcategories,
  onCategoryChange,
  onSubcategoryChange,
  onClearFilters,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const { products } = useFirebaseProducts();
  const { subcategories, loading: subcategoriesLoading, error: subcategoriesError } = useFirebaseSubcategories(expandedCategories);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCategoryClick = (categoryId: string) => {
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    onCategoryChange(newSelected);
  };

  const handleSubcategoryClick = (subcategoryId: string) => {
    const newSelected = selectedSubcategories.includes(subcategoryId)
      ? selectedSubcategories.filter((id) => id !== subcategoryId)
      : [...selectedSubcategories, subcategoryId];
    onSubcategoryChange(newSelected);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Categories</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="text-xs"
        >
          Clear Filters
        </Button>
      </div>
      {subcategoriesError && (
        <p className="text-sm text-red-600">Error loading subcategories: {subcategoriesError}</p>
      )}
      <ScrollArea className="h-auto max-h-64">
        <div className="space-y-2">
          <Button
            variant={selectedCategories.includes('all') ? 'default' : 'ghost'}
            size="sm"
            className="w-full justify-between"
            onClick={() => onCategoryChange(['all'])}
          >
            <span>All Products</span>
            <Badge variant="secondary" className="text-xs">
              {products.length}
            </Badge>
          </Button>

          {categories.map((category) => {
            const subcategoriesForCategory = subcategories.filter(
              (sub) => sub.categoryId === category.categoryId
            );
            const productCount = products.filter(
              (p) => p.categoryId === category.categoryId
            ).length;

            return (
              <div key={category.categoryId} className="space-y-1">
                <Button
                  variant={selectedCategories.includes(category.categoryId) ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => {
                    handleCategoryClick(category.categoryId);
                    toggleCategory(category.categoryId);
                  }}
                >
                  <div className="flex items-center">
                    {expandedCategories.includes(category.categoryId) ? (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2" />
                    )}
                    <span>{category.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {productCount}
                  </Badge>
                </Button>

                {expandedCategories.includes(category.categoryId) && (
                  <div className="ml-4 space-y-1">
                    {subcategoriesLoading ? (
                      <div className="flex items-center justify-center py-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      </div>
                    ) : subcategoriesForCategory.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No subcategories available</p>
                    ) : (
                      subcategoriesForCategory.map((subcategory) => (
                        <Button
                          key={subcategory.id}
                          variant={selectedSubcategories.includes(subcategory.id) ? 'default' : 'ghost'}
                          size="sm"
                          className="w-full justify-between"
                          onClick={() => handleSubcategoryClick(subcategory.id)}
                        >
                          <span>{subcategory.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {products.filter((p) => p.subcategoryId === subcategory.id).length}
                          </Badge>
                        </Button>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
