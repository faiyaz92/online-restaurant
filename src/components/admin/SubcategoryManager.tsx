import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useFirebaseCategories } from '@/hooks/useFirebaseCategories';
import { useFirebaseSubcategories, Subcategory } from '@/hooks/useFirebaseSubcategories';
import { useFirestorePaths } from '@/hooks/useFirestorePaths';

export const SubcategoryManager = () => {
  const { categories } = useFirebaseCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const { subcategories, addSubcategory, updateSubcategory, deleteSubcategory, loading } = useFirebaseSubcategories(selectedCategoryId);
  const paths = useFirestorePaths('shopping_cart');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    status: 'active'
  });
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddOrUpdate = async () => {
    if (!formData.name || !selectedCategoryId) {
      toast.error('Please fill all required fields');
      return;
    }
    setIsLoading(true);
    try {
      if (editingSubcategory) {
        await updateSubcategory(editingSubcategory.id, {
          ...formData,
          categoryId: selectedCategoryId,
          status: formData.status as 'active' | 'inactive'
        });
        toast.success('Subcategory updated');
      } else {
        await addSubcategory({
          ...formData,
          categoryId: selectedCategoryId,
          status: formData.status as 'active' | 'inactive'
        });
        toast.success('Subcategory added');
      }
      setFormData({ name: '', description: '', image: '', status: 'active' });
      setEditingSubcategory(null);
    } catch {
      toast.error('Failed to save subcategory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (sub: Subcategory) => {
    setEditingSubcategory(sub);
    setFormData({
      name: sub.name,
      description: sub.description || '',
      image: sub.image || '',
      status: sub.status
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await deleteSubcategory(id);
        toast.success('Subcategory deleted');
      } catch {
        toast.error('Failed to delete subcategory');
      }
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Subcategory Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="name">Subcategory Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
                placeholder="Enter subcategory name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-2"
                placeholder="Enter subcategory description"
              />
            </div>
            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="mt-2"
                placeholder="Enter image URL"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddOrUpdate}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : editingSubcategory ? 'Update Subcategory' : 'Add Subcategory'}
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Existing Subcategories</h3>
            <div className="mt-2 grid gap-4">
              {subcategories.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between rounded-md border p-4">
                  <div className="flex-1">
                    <p className="font-semibold">{sub.name}</p>
                    <p className="text-sm text-gray-500">{sub.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(sub)}
                      variant="outline"
                      size="icon"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(sub.id)}
                      variant="outline"
                      size="icon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};