import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types/product';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: (products: Product[]) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.productId === product.productId);
          
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.productId === product.productId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            };
          }
          
          return {
            items: [...state.items, { productId: product.productId, quantity }]
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter(item => item.productId !== productId)
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set((state) => ({
          items: state.items.map(item =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          )
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
          const product = products.find(p => p.productId === item.productId);
          if (product) {
            const price = product.discountedPrice || product.price;
            return total + (price * item.quantity);
          }
          return total;
        }, 0);
      },
    }),
    {
      name: 'shopping-cart',
    }
  )
);