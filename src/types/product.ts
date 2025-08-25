import { ReactNode } from "react";

export interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  taxRate: number;
  images: string[];
  categoryId: string;
  subcategoryId?: string;
  stock: number;
  variants?: ProductVariant[];
  createdAt: Date;
  companyId: string;
}

export interface ProductVariant {
  size?: string;
  color?: string;
  price?: number;
  taxRate?: number;
  stock?: number;
}

export interface Category {
  categoryId: string;
  name: string;
  description?: string;
  image?: string;
  companyId: string;
}

export interface Subcategory {
  subcategoryId: string;
  name: string;
  parentCategoryId: string;
  description?: string;
  companyId: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  variant?: ProductVariant;
  priceAtPurchase: number;
  taxAmount: number;
}

export interface Cart {
  cartId: string;
  userId?: string;
  items: CartItem[];
  updatedAt: Date;
  companyId: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  priceAtPurchase: number;
  taxAmount: number;
  originalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string | null;
  userId: string;
  customer: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  items: OrderItem[];
  totalAmount: number;
  totalTax: number;
  shippingCharge: number;
  priceWithoutDiscount: number;
  priceWithDiscount: number;
  priceWithDiscountTaxShipping: number;
  status: 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'return_initiated' | 'pickup_return' | 'returned';
  paymentStatus: 'pending' | 'completed' | 'failed';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: string;
  updatedAt: string;
  companyId: string;
  deliveryDate?: string;
  cancellationReason?: string;
  cancellationMessage?: string;
  returnReason?: 'defective_product' | 'wrong_item' | 'not_as_described' | 'changed_mind' | 'other';
  returnMessage?: string;
}

export interface OrderData {
  userId: string;
  companyId: string;
  items: OrderItem[];
  totalAmount: number;
  totalTax: number;
  shippingCharge: number;
  priceWithoutDiscount: number;
  priceWithDiscount: number;
  priceWithDiscountTaxShipping: number;
  status: string;
  paymentStatus: string;
  shippingAddress: Address;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  cancellationReason?: string;
  cancellationMessage?: string;
  returnReason?: 'damaged' | 'not_liked' | 'other';
  returnMessage?: string;
}

export interface Settings {
  shippingCharge: number;
  termsAndConditions: string;
  storeStatus: 'active' | 'inactive';
  taxRate: number;
  updatedAt: string;
  companyId: string;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
}

export interface Address extends ShippingAddress {
  email: string | null;
  addressId: string;
  userId: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  companyId: string;
}

export interface Wishlist {
  wishlistId: string;
  userId: string;
  productIds: string[];
  updatedAt: Date;
  companyId: string;
}

export interface Role {
  ADMIN: 'admin';
  USER: 'user';
}