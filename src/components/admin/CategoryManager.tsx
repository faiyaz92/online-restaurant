import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2,
  FolderOpen,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useFirebaseCategories, Category } from '@/hooks/useFirebaseCategories';
import { useFirebaseSubcategories, Subcategory } from '@/hooks/useFirebaseSubcategories';

export const CategoryManager = () => {
  console.log('CategoryManager rendered');
  const companyId = 'shopping_cart'; // Ensure this matches your Firebase setup
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useFirebaseCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    status: 'active' as 'active' | 'inactive'
  });

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = async () => {
    if (!formData.name) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Attempting to add category:', formData);
      await addCategory({
        name: formData.name,
        description: formData.description,
        image: formData.image || '/placeholder.svg',
        status: formData.status
      });
      console.log('Category added successfully');
      setIsAddDialogOpen(false);
      resetForm();
      toast.success('Category added successfully');
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error(`Failed to add category: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    console.log('Editing category:', category);
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      status: category.status
    });
    setIsAddDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !formData.name) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Attempting to update category:', formData);
      await updateCategory(editingCategory.id, {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        status: formData.status
      });
      console.log('Category updated successfully');
      setIsAddDialogOpen(false);
      setEditingCategory(null);
      resetForm();
      toast.success('Category updated successfully');
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast.error(`Failed to update category: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category && category.productCount && category.productCount > 0) {
      toast.error('Cannot delete category with existing products');
      return;
    }

    try {
      console.log('Attempting to delete category:', categoryId);
      await deleteCategory(categoryId);
      console.log('Category deleted successfully');
      toast.success('Category deleted successfully');
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(`Failed to delete category: ${error.message}`);
    }
  };

  const resetForm = () => {
    console.log('Resetting form');
    setFormData({
      name: '',
      description: '',
      image: '',
      status: 'active'
    });
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">
            Organize your products into categories
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          console.log('Dialog open state changed:', open);
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              console.log('Add Category button clicked');
              resetForm();
              setIsAddDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-white p-6 rounded-lg shadow-lg z-[1000]">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory 
                  ? 'Update the category details below'
                  : 'Fill in the category details below'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter category name"
                  className="border border-gray-300 p-2 rounded"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter category description"
                  rows={3}
                  className="border border-gray-300 p-2 rounded"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Category Image</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="Enter image URL"
                  className="border border-gray-300 p-2 rounded"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status}
                  onValueChange={(value) => setFormData({...formData, status: value as 'active' | 'inactive'})}
                >
                  <SelectTrigger id="status" className="border border-gray-300 p-2 rounded">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {editingCategory && (
              <div className="mt-6">
                <h3 className="font-semibold mb-4">Subcategories</h3>
                <SubcategoriesSection categoryId={editingCategory.id} />
              </div>
            )}

            <DialogFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="border border-gray-300 p-2 rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                disabled={isLoading}
                className="bg-blue-500 text-white p-2 rounded"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingCategory ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingCategory ? 'Update Category' : 'Add Category'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading categories...</span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No categories found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first category'}
          </p>
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border border-gray-300 p-2 rounded"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="group hover:shadow-elevation transition-shadow">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={category.image || '/placeholder.svg'}
                      alt={category.name}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="sm" className="border border-gray-300 p-2 rounded">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-destructive"
                            disabled={(category.productCount || 0) > 0}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{category.name}</h3>
                      <Badge variant="secondary">
                        {category.productCount || 0} products
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {category.description || 'No description provided'}
                    </p>
                    
                    <div className="flex items-center justify-between pt-2">
                      <Badge variant={category.status === 'active' ? 'default' : 'destructive'}>
                        {category.status}
                      </Badge>
                      
                      <Button variant="ghost" size="sm">
                        <FolderOpen className="h-4 w-4 mr-2" />
                        View Products
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const SubcategoriesSection = ({ categoryId }: { categoryId: string }) => {
  const { subcategories, loading, addSubcategory, updateSubcategory, deleteSubcategory } = useFirebaseSubcategories(categoryId);
  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
  const [isSubLoading, setIsSubLoading] = useState(false);
  const [subFormData, setSubFormData] = useState({
    name: '',
    description: '',
    image: '',
    status: 'active' as 'active' | 'inactive'
  });

  const resetSubForm = () => {
    console.log('Resetting subcategory form');
    setSubFormData({
      name: '',
      description: '',
      image: '',
      status: 'active'
    });
    setEditingSub(null);
  };

  const handleAddSub = async () => {
    if (!subFormData.name) {
      toast.error('Please enter a subcategory name');
      return;
    }

    try {
      setIsSubLoading(true);
      console.log('Attempting to add subcategory:', subFormData);
      await addSubcategory({
        name: subFormData.name,
        description: subFormData.description,
        image: subFormData.image || '/placeholder.svg',
        status: subFormData.status,
        categoryId
      });
      console.log('Subcategory added successfully');
      setIsSubDialogOpen(false);
      resetSubForm();
      toast.success('Subcategory added successfully');
    } catch (error: any) {
      console.error('Error adding subcategory:', error);
      toast.error(`Failed to add subcategory: ${error.message}`);
    } finally {
      setIsSubLoading(false);
    }
  };

  const handleUpdateSub = async () => {
    if (!editingSub || !subFormData.name) {
      toast.error('Please enter a subcategory name');
      return;
    }

    try {
      setIsSubLoading(true);
      console.log('Attempting to update subcategory:', subFormData);
      await updateSubcategory(editingSub.id, {
        name: subFormData.name,
        description: subFormData.description,
        image: subFormData.image,
        status: subFormData.status
      });
      console.log('Subcategory updated successfully');
      setIsSubDialogOpen(false);
      resetSubForm();
      toast.success('Subcategory updated successfully');
    } catch (error: any) {
      console.error('Error updating subcategory:', error);
      toast.error(`Failed to update subcategory: ${error.message}`);
    } finally {
      setIsSubLoading(false);
    }
  };

  const handleDeleteSub = async (id: string) => {
    try {
      console.log('Attempting to delete subcategory:', id);
      await deleteSubcategory(id);
      console.log('Subcategory deleted successfully');
      toast.success('Subcategory deleted successfully');
    } catch (error: any) {
      console.error('Error deleting subcategory:', error);
      toast.error(`Failed to delete subcategory: ${error.message}`);
    }
  };

  const handleEditSub = (sub: Subcategory) => {
    console.log('Editing subcategory:', sub);
    setEditingSub(sub);
    setSubFormData({
      name: sub.name,
      description: sub.description || '',
      image: sub.image || '',
      status: sub.status
    });
    setIsSubDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isSubDialogOpen} onOpenChange={(open) => {
          console.log('Subcategory dialog open state changed:', open);
          setIsSubDialogOpen(open);
          if (!open) resetSubForm();
        }}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              onClick={() => {
                console.log('Add Subcategory button clicked');
                resetSubForm();
              }}
              className="border border-gray-300 p-2 rounded"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Subcategory
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-white p-6 rounded-lg shadow-lg z-[1000]">
            <DialogHeader>
              <DialogTitle>{editingSub ? 'Edit Subcategory' : 'Add New Subcategory'}</DialogTitle>
              <DialogDescription>
                {editingSub ? 'Update the subcategory details below' : 'Fill in the subcategory details below'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sub-name">Subcategory Name *</Label>
                <Input
                  id="sub-name"
                  value={subFormData.name}
                  onChange={(e) => setSubFormData({...subFormData, name: e.target.value})}
                  placeholder="Enter subcategory name"
                  className="border border-gray-300 p-2 rounded"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sub-description">Description</Label>
                <Textarea
                  id="sub-description"
                  value={subFormData.description}
                  onChange={(e) => setSubFormData({...subFormData, description: e.target.value})}
                  placeholder="Enter subcategory description"
                  rows={3}
                  className="border border-gray-300 p-2 rounded"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sub-image">Subcategory Image</Label>
                <Input
                  id="sub-image"
                  value={subFormData.image}
                  onChange={(e) => setSubFormData({...subFormData, image: e.target.value})}
                  placeholder="Enter image URL"
                  className="border border-gray-300 p-2 rounded"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sub-status">Status</Label>
                <Select 
                  value={subFormData.status}
                  onValueChange={(value) => setSubFormData({...subFormData, status: value as 'active' | 'inactive'})}
                >
                  <SelectTrigger id="sub-status" className="border border-gray-300 p-2 rounded">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsSubDialogOpen(false)}
                className="border border-gray-300 p-2 rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={editingSub ? handleUpdateSub : handleAddSub}
                disabled={isSubLoading}
                className="bg-blue-500 text-white p-2 rounded"
              >
                {isSubLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingSub ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingSub ? 'Update Subcategory' : 'Add Subcategory'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {subcategories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No subcategories yet. Add one above.</p>
      ) : (
        <div className="grid gap-3">
          {subcategories.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <h4 className="font-medium">{sub.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-1">{sub.description || 'No description'}</p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant={sub.status === 'active' ? 'default' : 'destructive'}>
                  {sub.status}
                </Badge>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditSub(sub)}
                    className="p-2"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSub(sub.id)}
                    className="p-2"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
