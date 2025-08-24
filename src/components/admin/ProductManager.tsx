import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, MoreVertical, Edit2, Trash2, Eye, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/types/product';
import { useFirebaseProducts } from '@/hooks/useFirebaseProducts';
import { useFirebaseCategories } from '@/hooks/useFirebaseCategories';
import { useFirebaseSubcategories } from '@/hooks/useFirebaseSubcategories';

export const ProductManager = () => {
  console.log('ProductManager rendered at:', new Date().toISOString());
  const companyId = 'shopping_cart';
  const { products, loading: productsLoading, error: productsError, addProduct, updateProduct, deleteProduct } = useFirebaseProducts();
  const { categories, loading: categoriesLoading } = useFirebaseCategories();
  const { subcategories, loading: subcategoriesLoading, fetchSubcategories } = useFirebaseSubcategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountedPrice: '',
    categoryId: '',
    subcategoryId: '',
    stock: '',
    images: [] as string[],
  });

  useEffect(() => {
    console.log('Products:', products, 'Products Loading:', productsLoading, 'Products Error:', productsError);
    console.log('Categories:', categories, 'Categories Loading:', categoriesLoading);
    console.log('Subcategories:', subcategories, 'Subcategories Loading:', subcategoriesLoading);
  }, [products, productsLoading, productsError, categories, categoriesLoading, subcategories, subcategoriesLoading]);

  useEffect(() => {
    if (formData.categoryId && isAddDialogOpen) {
      console.log('Fetching subcategories for category in Add Dialog:', formData.categoryId);
      fetchSubcategories(formData.categoryId);
    } else if (!formData.categoryId) {
      setFormData((prev) => ({ ...prev, subcategoryId: '' }));
    }
  }, [formData.categoryId, fetchSubcategories, isAddDialogOpen]);

  useEffect(() => {
    if (isAddDialogOpen) {
      console.log('Add Dialog opened, categories state:', { categories, categoriesLoading });
      // Reset subcategory when dialog opens to ensure consistency
      setFormData((prev) => ({ ...prev, categoryId: '', subcategoryId: '' }));
    }
  }, [isAddDialogOpen, categories, categoriesLoading]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    const matchesSubcategory = !selectedSubcategory || product.subcategoryId === selectedSubcategory;
    return matchesSearch && matchesCategory && matchesSubcategory;
  });

  const handleAddProduct = async () => {
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error('Please fill in all required fields (Name, Price, Category)');
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting to add product:', { ...formData, companyId });
      await addProduct({
        productId: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : undefined,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId === 'none' ? undefined : formData.subcategoryId,
        stock: parseInt(formData.stock) || 0,
        images: formData.images.length > 0 ? formData.images : ['/placeholder.svg'],
      });
      console.log('Product added successfully');
      setIsAddDialogOpen(false);
      resetForm();
      toast.success('Product added successfully');
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error(`Failed to add product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    console.log('Editing product:', product);
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      discountedPrice: product.discountedPrice?.toString() || '',
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId || 'none',
      stock: product.stock.toString(),
      images: product.images,
    });
    setIsEditDialogOpen(true);
    if (product.categoryId) {
      console.log('Pre-fetching subcategories for edit product, category:', product.categoryId);
      fetchSubcategories(product.categoryId);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !formData.name || !formData.price || !formData.categoryId) {
      toast.error('Please fill in all required fields (Name, Price, Category)');
          return;
    }

    try {
      setLoading(true);
      console.log('Attempting to update product:', { ...formData, companyId });
      await updateProduct(editingProduct.productId, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : undefined,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId === 'none' ? undefined : formData.subcategoryId,
        stock: parseInt(formData.stock) || 0,
        images: formData.images.length > 0 ? formData.images : ['/placeholder.svg'],
        companyId,
      });
      console.log('Product updated successfully');
      setIsEditDialogOpen(false);
      resetForm();
      toast.success('Product updated successfully');
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(`Failed to update product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      console.log('Attempting to delete product:', productId);
      await deleteProduct(productId);
      console.log('Product deleted successfully');
      toast.success('Product deleted successfully');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(`Failed to delete product: ${error.message}`);
    }
  };

  const resetForm = () => {
    console.log('Resetting form');
    setFormData({
      name: '',
      description: '',
      price: '',
      discountedPrice: '',
      categoryId: '',
      subcategoryId: '',
      stock: '',
      images: [],
    });
    setEditingProduct(null);
    setIsEditDialogOpen(false);
    setSelectedSubcategory('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            console.log('Add Product dialog open state changed:', open);
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                console.log('Add Product button clicked at:', new Date().toISOString());
                resetForm();
                setIsAddDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md z-10"
              style={{ zIndex: 10 }}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white p-6 rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Fill in the product details below</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    className="border border-gray-300 p-2 rounded"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => {
                      console.log('Category selected in Add Dialog:', value);
                      setFormData({ ...formData, categoryId: value, subcategoryId: '' });
                      fetchSubcategories(value);
                    }}
                    disabled={categoriesLoading || !categories.length}
                  >
                    <SelectTrigger className="border border-gray-300 p-2 rounded">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent style={{ zIndex: 9999, position: 'relative' }}>
                      {categoriesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading categories...
                        </SelectItem>
                      ) : categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No categories available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subcategoryId">Subcategory (Optional)</Label>
                <Select
                  value={formData.subcategoryId}
                  onValueChange={(value) => {
                    console.log('Subcategory selected in Add Dialog:', value);
                    setFormData({ ...formData, subcategoryId: value });
                  }}
                  disabled={!formData.categoryId || subcategoriesLoading || !subcategories.length}
                >
                  <SelectTrigger className="border border-gray-300 p-2 rounded">
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent style={{ zIndex: 9999, position: 'relative' }}>
                    <SelectItem value="none">No Subcategory</SelectItem>
                    {subcategoriesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading subcategories...
                      </SelectItem>
                    ) : subcategories.length > 0 ? (
                      subcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No subcategories available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description"
                  rows={3}
                  className="border border-gray-300 p-2 rounded"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="border border-gray-300 p-2 rounded"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountedPrice">Sale Price</Label>
                  <Input
                    id="discountedPrice"
                    type="number"
                    step="0.01"
                    value={formData.discountedPrice}
                    onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                    placeholder="0.00"
                    className="border border-gray-300 p-2 rounded"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    className="border border-gray-300 p-2 rounded"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.images[0] || ''}
                  onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                  placeholder="Enter image URL"
                  className="border border-gray-300 p-2 rounded"
                />
              </div>
              <DialogFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="border border-gray-300 p-2 rounded"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddProduct}
                  disabled={loading || categoriesLoading || !formData.categoryId}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Product'
                  )}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {(productsLoading || categoriesLoading || subcategoriesLoading) && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border border-gray-300 p-2 rounded"
              />
            </div>
            <Select value={selectedCategory} onValueChange={(value) => {
              console.log('Filter Category selected:', value);
              setSelectedCategory(value);
              fetchSubcategories(value === 'all' ? '' : value);
            }}>
              <SelectTrigger className="w-48 border border-gray-300 p-2 rounded">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
              <SelectTrigger className="w-48 border border-gray-300 p-2 rounded">
                <SelectValue placeholder="All Subcategories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All Subcategories</SelectItem>
                {subcategories.map((subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No products found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm || selectedCategory !== 'all' || selectedSubcategory
              ? 'Try adjusting your filters'
              : 'Get started by adding your first product'}
          </p>
          <Button
            onClick={() => {
              console.log('Add Product button (empty state) clicked at:', new Date().toISOString());
              resetForm();
              setIsAddDialogOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md z-10"
            style={{ zIndex: 10 }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <Card key={product.productId} className="group hover:shadow-elevation transition-shadow">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={product.images?.[0] || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="sm" className="border border-gray-300 p-2 rounded">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteProduct(product.productId)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {product.discountedPrice && (
                    <Badge className="absolute top-2 left-2 bg-destructive">Sale</Badge>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-sm leading-tight">{product.name}</h3>
                    <Badge variant={product.stock > 10 ? 'default' : 'destructive'}>
                      <Package className="h-3 w-3 mr-1" />
                      {product.stock}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {product.discountedPrice ? (
                        <>
                          <span className="font-bold text-sm">${product.discountedPrice}</span>
                          <span className="text-xs text-muted-foreground line-through">${product.price}</span>
                        </>
                      ) : (
                        <span className="font-bold text-sm">${product.price}</span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="text-xs">
                        {categories.find((c) => c.id === product.categoryId)?.name || 'No Category'}
                      </Badge>
                      {product.subcategoryId && (
                        <Badge variant="outline" className="text-xs">
                          {subcategories.find((s) => s.id === product.subcategoryId)?.name || 'No Subcategory'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          console.log('Edit Product dialog open state changed:', open);
          setIsEditDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-2xl bg-white p-6 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the product details below</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  className="border border-gray-300 p-2 rounded"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-categoryId">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => {
                    console.log('Category selected in Edit Dialog:', value);
                    setFormData({ ...formData, categoryId: value, subcategoryId: '' });
                    fetchSubcategories(value);
                  }}
                  disabled={categoriesLoading || !categories.length}
                >
                  <SelectTrigger className="border border-gray-300 p-2 rounded">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent style={{ zIndex: 9999, position: 'relative' }}>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading categories...
                      </SelectItem>
                    ) : categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No categories available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-subcategoryId">Subcategory (Optional)</Label>
              <Select
                value={formData.subcategoryId}
                onValueChange={(value) => {
                  console.log('Subcategory selected in Edit Dialog:', value);
                  setFormData({ ...formData, subcategoryId: value });
                }}
                disabled={!formData.categoryId || subcategoriesLoading || !subcategories.length}
              >
                <SelectTrigger className="border border-gray-300 p-2 rounded">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent style={{ zIndex: 9999, position: 'relative' }}>
                  <SelectItem value="none">No Subcategory</SelectItem>
                  {subcategoriesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading subcategories...
                    </SelectItem>
                  ) : subcategories.length > 0 ? (
                    subcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No subcategories available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
                rows={3}
                className="border border-gray-300 p-2 rounded"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="border border-gray-300 p-2 rounded"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-discountedPrice">Sale Price</Label>
                <Input
                  id="edit-discountedPrice"
                  type="number"
                  step="0.01"
                  value={formData.discountedPrice}
                  onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                  placeholder="0.00"
                  className="border border-gray-300 p-2 rounded"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                  className="border border-gray-300 p-2 rounded"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">Image URL</Label>
              <Input
                id="edit-image"
                value={formData.images[0] || ''}
                onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                placeholder="Enter image URL"
                className="border border-gray-300 p-2 rounded"
              />
            </div>
            <DialogFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border border-gray-300 p-2 rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateProduct}
                disabled={loading || categoriesLoading || !formData.categoryId}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Product'
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};