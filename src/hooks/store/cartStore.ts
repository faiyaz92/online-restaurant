import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/product';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  taxAmount: number; // Added taxAmount
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: (products: Product[]) => number;
  getTotalTax: (products: Product[]) => number;
  total: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product, quantity = 1) => {
        console.log('Adding to cart:', {
          productId: product.productId,
          name: product.name,
          price: product.discountedPrice || product.price,
          taxRate: product.taxRate,
        });
        set((state) => {
          const existingItem = state.items.find((item) => item.productId === product.productId);
          const price = Number(product.discountedPrice || product.price) || 0;
          const taxRate = product.taxRate || 0;
          const taxAmount = price * quantity * (taxRate / 100);

          if (price === 0) {
            console.warn(`Warning: Product ${product.productId} has invalid price:`, {
              discountedPrice: product.discountedPrice,
              price: product.price,
            });
          }

          if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            const newTaxAmount = price * newQuantity * (taxRate / 100);
            return {
              items: state.items.map((item) =>
                item.productId === product.productId
                  ? { ...item, quantity: newQuantity, taxAmount: newTaxAmount }
                  : item
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                productId: product.productId,
                id: product.productId,
                name: product.name,
                price,
                image: product.images?.[0] || '/placeholder.svg',
                quantity,
                taxAmount,
              },
            ],
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) => {
            if (item.productId === productId) {
              const product = state.items.find((i) => i.productId === productId);
              const price = product?.price || 0;
              const taxRate = product ? (state.items.find((i) => i.productId === productId)?.taxAmount || 0) / (price * item.quantity / 100) : 0;
              return { ...item, quantity, taxAmount: price * quantity * (taxRate / 100) };
            }
            return item;
          }),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: (products: Product[]) => {
        const { items } = get();
        return items.reduce((total, item) => {
          const product = products.find((p) => p.productId === item.productId);
          const price = Number(product?.discountedPrice || product?.price || item.price) || 0;
          console.log('Calculating total for item:', { productId: item.productId, price, quantity: item.quantity });
          return total + price * item.quantity;
        }, 0);
      },

      getTotalTax: (products: Product[]) => {
        const { items } = get();
        return items.reduce((total, item) => {
          const product = products.find((p) => p.productId === item.productId);
          const price = Number(product?.discountedPrice || product?.price || item.price) || 0;
          const taxRate = product?.taxRate || 0;
          const taxAmount = price * item.quantity * (taxRate / 100);
          return total + taxAmount;
        }, 0);
      },

      get total() {
        const total = get().items.reduce((sum, item) => {
          const price = Number(item.price) || 0;
          return sum + price * item.quantity;
        }, 0);
        console.log('Cart total:', total, 'Items:', get().items);
        return total;
      },
    }),
    {
      name: 'shopping-cart',
    }
  )
);