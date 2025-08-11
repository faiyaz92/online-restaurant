import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Category } from '@/types/product';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
}) => {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Categories</h3>
      <ScrollArea className="h-auto max-h-64">
        <div className="space-y-2">
          <Button
            variant={selectedCategory === null ? "default" : "ghost"}
            size="sm"
            className="w-full justify-start"
            onClick={() => onCategorySelect(null)}
          >
            All Products
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category.categoryId}
              variant={selectedCategory === category.categoryId ? "default" : "ghost"}
              size="sm"
              className="w-full justify-between"
              onClick={() => onCategorySelect(category.categoryId)}
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