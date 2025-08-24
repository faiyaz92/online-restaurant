import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useFirebaseSettings } from '@/hooks/useFirebaseSettings';
import type { Settings } from '@/types/product';

export const SettingsPage: React.FC = () => {
  const { settings, loading, error, updateSettings } = useFirebaseSettings();
  const [formData, setFormData] = useState<Settings>({
    shippingCharge: 0,
    termsAndConditions: '',
    storeStatus: 'active',
    taxRate: 0,
    updatedAt: new Date().toISOString(),
    companyId: 'shopping_cart',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'shippingCharge' || name === 'taxRate' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleStoreStatusChange = (value: 'active' | 'inactive') => {
    setFormData((prev) => ({ ...prev, storeStatus: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.shippingCharge < 0) {
      toast.error('Shipping charge cannot be negative');
      return;
    }
    if (formData.taxRate < 0 || formData.taxRate > 100) {
      toast.error('Tax rate must be between 0 and 100%');
      return;
    }
    if (!formData.termsAndConditions.trim()) {
      toast.error('Terms and conditions cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateSettings(formData);
      toast.success('Settings updated successfully');
    } catch (err: any) {
      toast.error(`Failed to update settings: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p>Loading settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Configure your store's settings, including shipping charges and terms.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Settings</CardTitle>
          <CardDescription>
            Manage shipping charges, terms and conditions, and other configurations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="shippingCharge">Shipping Charge (₹)</Label>
              <Input
                id="shippingCharge"
                name="shippingCharge"
                type="number"
                value={formData.shippingCharge}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="Enter shipping charge"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                name="taxRate"
                type="number"
                value={formData.taxRate}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.01"
                placeholder="Enter default tax rate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
              <Textarea
                id="termsAndConditions"
                name="termsAndConditions"
                value={formData.termsAndConditions}
                onChange={handleInputChange}
                rows={6}
                placeholder="Enter store terms and conditions"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeStatus">Store Status</Label>
              <Select
                value={formData.storeStatus}
                onValueChange={handleStoreStatusChange}
              >
                <SelectTrigger id="storeStatus">
                  <SelectValue placeholder="Select store status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};