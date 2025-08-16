import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Category } from '@/types/product';

interface CategoryFilterProps {
  categories?: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories = [],
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Categories</h3>
      <ScrollArea className="h-auto max-h-64">
        <div className="space-y-2">
          <Button
            variant={selectedCategory === 'all' ? "default" : "ghost"}
            size="sm"
            className="w-full justify-start"
            onClick={() => onCategoryChange('all')}
          >
            All Products
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category.categoryId}
              variant={selectedCategory === category.categoryId ? "default" : "ghost"}
              size="sm"
              className="w-full justify-between"
              onClick={() => onCategoryChange(category.categoryId)}
            >
              <span>{category.name}</span>
              <Badge variant="secondary" className="text-xs">
                12
              </Badge>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};