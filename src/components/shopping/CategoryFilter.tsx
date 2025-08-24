import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Category } from '@/types/product';
import { useFirebaseSubcategories } from '@/hooks/useFirebaseSubcategories';
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
  const { products } = useFirebaseProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Fetch subcategories for up to 10 categories
  const { subcategories: sub1, loading: load1, error: err1 } = useFirebaseSubcategories(categories[0]?.categoryId);
  const { subcategories: sub2, loading: load2, error: err2 } = useFirebaseSubcategories(categories[1]?.categoryId);
  const { subcategories: sub3, loading: load3, error: err3 } = useFirebaseSubcategories(categories[2]?.categoryId);
  const { subcategories: sub4, loading: load4, error: err4 } = useFirebaseSubcategories(categories[3]?.categoryId);
  const { subcategories: sub5, loading: load5, error: err5 } = useFirebaseSubcategories(categories[4]?.categoryId);
  const { subcategories: sub6, loading: load6, error: err6 } = useFirebaseSubcategories(categories[5]?.categoryId);
  const { subcategories: sub7, loading: load7, error: err7 } = useFirebaseSubcategories(categories[6]?.categoryId);
  const { subcategories: sub8, loading: load8, error: err8 } = useFirebaseSubcategories(categories[7]?.categoryId);
  const { subcategories: sub9, loading: load9, error: err9 } = useFirebaseSubcategories(categories[8]?.categoryId);
  const { subcategories: sub10, loading: load10, error: err10 } = useFirebaseSubcategories(categories[9]?.categoryId);

  const subcategoryMap = {
    [categories[0]?.categoryId || '']: { subcategories: sub1, loading: load1, error: err1 },
    [categories[1]?.categoryId || '']: { subcategories: sub2, loading: load2, error: err2 },
    [categories[2]?.categoryId || '']: { subcategories: sub3, loading: load3, error: err3 },
    [categories[3]?.categoryId || '']: { subcategories: sub4, loading: load4, error: err4 },
    [categories[4]?.categoryId || '']: { subcategories: sub5, loading: load5, error: err5 },
    [categories[5]?.categoryId || '']: { subcategories: sub6, loading: load6, error: err6 },
    [categories[6]?.categoryId || '']: { subcategories: sub7, loading: load7, error: err7 },
    [categories[7]?.categoryId || '']: { subcategories: sub8, loading: load8, error: err8 },
    [categories[8]?.categoryId || '']: { subcategories: sub9, loading: load9, error: err9 },
    [categories[9]?.categoryId || '']: { subcategories: sub10, loading: load10, error: err10 },
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryClick = (categoryId: string) => {
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories.filter((id) => id !== 'all'), categoryId];
    onCategoryChange(newSelected.length === 0 ? ['all'] : newSelected);
  };

  const handleSubcategoryClick = (subcategoryId: string) => {
    const newSelected = selectedSubcategories.includes(subcategoryId)
      ? selectedSubcategories.filter((id) => id !== subcategoryId)
      : [...selectedSubcategories, subcategoryId];
    onSubcategoryChange(newSelected);
  };

  const handleToggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setExpandedCategories([]);
    onClearFilters();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="category-search"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 text-sm h-9 rounded-md border-muted"
          />
        </div>
      </div>

      {/* Header and Clear Filters */}
      <div className="flex justify-between items-center px-3 py-2 border-b border-muted">
        <h3 className="text-lg font-semibold text-foreground">Categories</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearFilters}
          className="text-xs h-7 px-2 border-muted text-foreground hover:bg-muted"
        >
          Clear
        </Button>
      </div>

      {/* Scrollable Category List */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 px-3 py-3">
          <Button
            variant={selectedCategories.includes('all') ? 'default' : 'ghost'}
            size="sm"
            className="w-full justify-between text-sm h-8 rounded-md"
            onClick={() => onCategoryChange(['all'])}
          >
            <span>All Products</span>
            <Badge variant="secondary" className="text-xs">
              {products.length}
            </Badge>
          </Button>

          {filteredCategories.map((category) => {
            const productCount = products.filter(
              (p) => p.categoryId === category.categoryId
            ).length;
            const subcategoryData = subcategoryMap[category.categoryId] || {
              subcategories: [],
              loading: false,
              error: null,
            };
            const filteredSubcategories = subcategoryData.subcategories.filter((sub) =>
              sub.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            const isExpanded = expandedCategories.includes(category.categoryId);

            return (
              <div key={category.categoryId} className="space-y-1">
                <Button
                  variant={selectedCategories.includes(category.categoryId) ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-between text-sm h-8 rounded-md"
                  onClick={() => {
                    handleCategoryClick(category.categoryId);
                    handleToggleCategory(category.categoryId);
                  }}
                >
                  <span>{category.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {productCount}
                    </Badge>
                    {filteredSubcategories.length > 0 && (
                      isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </Button>

                {isExpanded && (
                  <div className="ml-3 space-y-1">
                    {subcategoryData.error && (
                      <p className="text-xs text-red-600">{subcategoryData.error}</p>
                    )}
                    {subcategoryData.loading ? (
                      <div className="flex items-center justify-center py-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                      </div>
                    ) : filteredSubcategories.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No subcategories</p>
                    ) : (
                      filteredSubcategories.map((subcategory) => (
                        <Button
                          key={subcategory.id}
                          variant={selectedSubcategories.includes(subcategory.id) ? 'default' : 'ghost'}
                          size="sm"
                          className="w-full justify-between text-xs h-7 rounded-md"
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