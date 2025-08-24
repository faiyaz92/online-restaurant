import { ReactNode } from "react";

export interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
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
}

export interface Cart {
  cartId: string;
  userId?: string;
  items: CartItem[];
  updatedAt: Date;
  companyId: string;
}

export interface Order {
  orderId: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  paymentId?: string;
  createdAt: Date;
  companyId: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  variant?: ProductVariant;
}

export enum OrderStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  PROCESSING = 'Processing',
  PACKED = 'Packed',
  SHIPPED = 'Shipped',
  OUT_FOR_DELIVERY = 'Out for Delivery',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
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
  email: ReactNode;
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
