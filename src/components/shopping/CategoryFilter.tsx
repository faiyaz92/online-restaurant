import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    let newSelectedCategories: string[];
    let newSelectedSubcategories: string[] = [...selectedSubcategories];

    if (selectedCategories.includes(categoryId)) {
      // Deselect category and its subcategories
      newSelectedCategories = selectedCategories.filter((id) => id !== categoryId && id !== 'all');
      const subcategoriesToRemove = subcategoryMap[categoryId]?.subcategories.map((sub) => sub.id) || [];
      newSelectedSubcategories = newSelectedSubcategories.filter((id) => !subcategoriesToRemove.includes(id));
    } else {
      // Select category (do not automatically select subcategories to include products without subcategories)
      newSelectedCategories = [...selectedCategories.filter((id) => id !== 'all'), categoryId];
      // No change to subcategories; keep as is to allow showing all products in category
    }

    onCategoryChange(newSelectedCategories.length === 0 ? ['all'] : newSelectedCategories);
    onSubcategoryChange(newSelectedSubcategories);

    // Clean up selected subcategories to only those belonging to selected categories
    const selectedCats = newSelectedCategories[0] === 'all' ? categories.map(c => c.categoryId) : newSelectedCategories;
    const validSubIds = selectedCats.flatMap(catId => subcategoryMap[catId]?.subcategories.map(sub => sub.id) || []);
    const cleanedSubs = newSelectedSubcategories.filter(id => validSubIds.includes(id));
    if (cleanedSubs.length !== newSelectedSubcategories.length) {
      onSubcategoryChange(cleanedSubs);
    }
  };

  const handleSubcategoryClick = (subcategoryId: string) => {
    const newSelected = selectedSubcategories.includes(subcategoryId)
      ? selectedSubcategories.filter((id) => id !== subcategoryId)
      : [...selectedSubcategories, subcategoryId];
    onSubcategoryChange(newSelected);

    // Find the category for this subcategory
    const foundCategory = categories.find(cat =>
      subcategoryMap[cat.categoryId]?.subcategories.some(sub => sub.id === subcategoryId)
    );
    const categoryId = foundCategory?.categoryId;

    if (categoryId) {
      // If adding the subcategory and category not selected, select the category
      if (!selectedSubcategories.includes(subcategoryId) && !selectedCategories.includes(categoryId)) {
        const newSelectedCategories = [...selectedCategories.filter(id => id !== 'all'), categoryId];
        onCategoryChange(newSelectedCategories);
      }

      // If no subcategories are selected for this category after change, deselect the category
      const subcategoriesForCategory = subcategoryMap[categoryId]?.subcategories.map(sub => sub.id) || [];
      const hasSelectedSubcategories = subcategoriesForCategory.some(id => newSelected.includes(id));

      if (!hasSelectedSubcategories && selectedCategories.includes(categoryId)) {
        const newSelectedCategories = selectedCategories.filter(id => id !== categoryId && id !== 'all');
        onCategoryChange(newSelectedCategories.length === 0 ? ['all'] : newSelectedCategories);
      }

      // Clean up selected subcategories to only those belonging to selected categories
      const selectedCats = selectedCategories.includes(categoryId) 
        ? selectedCategories 
        : [...selectedCategories.filter(id => id !== 'all'), categoryId]; // Temporary for clean
      const validSubIds = selectedCats.flatMap(catId => subcategoryMap[catId]?.subcategories.map(sub => sub.id) || []);
      const cleanedSubs = newSelected.filter(id => validSubIds.includes(id));
      if (cleanedSubs.length !== newSelected.length) {
        onSubcategoryChange(cleanedSubs);
      }
    }
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
        <h3 className="text-lg font-semibold text-foreground">Filters</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearFilters}
          className="text-xs h-7 px-2 border-muted text-foreground hover:bg-muted"
        >
          Clear All
        </Button>
      </div>

      {/* Scrollable Filter List */}
      <ScrollArea className="flex-1">
        <div className="space-y-3 px-3 py-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="all-products"
              checked={selectedCategories.includes('all')}
              onCheckedChange={() => onCategoryChange(['all'])}
            />
            <label
              htmlFor="all-products"
              className="text-sm font-medium text-foreground flex items-center justify-between w-full"
            >
              <span>All Products</span>
              <span className="text-xs text-muted-foreground">({products.length})</span>
            </label>
          </div>

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
              <div key={category.categoryId} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`category-${category.categoryId}`}
                    checked={selectedCategories.includes(category.categoryId)}
                    onCheckedChange={() => handleCategoryClick(category.categoryId)}
                  />
                  <label
                    htmlFor={`category-${category.categoryId}`}
                    className="text-sm font-medium text-foreground flex items-center justify-between w-full cursor-pointer"
                    onClick={() => handleToggleCategory(category.categoryId)}
                  >
                    <span>{category.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">({productCount})</span>
                      {filteredSubcategories.length > 0 && (
                        isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </label>
                </div>

                {isExpanded && (
                  <div className="ml-6 space-y-2">
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
                        <div key={subcategory.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`subcategory-${subcategory.id}`}
                            checked={selectedSubcategories.includes(subcategory.id)}
                            onCheckedChange={() => handleSubcategoryClick(subcategory.id)}
                          />
                          <label
                            htmlFor={`subcategory-${subcategory.id}`}
                            className="text-xs text-foreground flex items-center justify-between w-full"
                          >
                            <span>{subcategory.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({products.filter((p) => p.subcategoryId === subcategory.id).length})
                            </span>
                          </label>
                        </div>
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