import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  subtotal: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addToCart: (product: Product, quantity?: number) => Promise<boolean>;
  forceAddToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartItem: (productId: string) => CartItem | undefined;
}

const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  return { totalItems, totalAmount };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalAmount: 0,

      addToCart: async (product: Product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find(item => item.productId === product.id);

        if (existingItem) {
          // Return false to indicate item already exists (for confirmation modal)
          return false;
        }

        // Check if requested quantity exceeds stock
        if (quantity > product.stock) {
          throw new Error(`Only ${product.stock} ${product.unit} available`);
        }

        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          productId: product.id,
          product,
          quantity,
          subtotal: product.price * quantity
        };

        const newItems = [...items, newItem];
        const { totalItems, totalAmount } = calculateTotals(newItems);

        set({
          items: newItems,
          totalItems,
          totalAmount
        });

        return true;
      },

      forceAddToCart: async (product: Product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find(item => item.productId === product.id);

        if (existingItem) {
          // Check if new total quantity would exceed stock
          const newQuantity = existingItem.quantity + quantity;
          if (newQuantity > product.stock) {
            throw new Error(`Cannot add more. Only ${product.stock} ${product.unit} available`);
          }

          // Increment quantity if item already exists
          const newItems = items.map(item =>
            item.productId === product.id
              ? { 
                  ...item, 
                  quantity: newQuantity,
                  subtotal: newQuantity * item.product.price
                }
              : item
          );
          
          const { totalItems, totalAmount } = calculateTotals(newItems);

          set({
            items: newItems,
            totalItems,
            totalAmount
          });
        } else {
          // Check if requested quantity exceeds stock
          if (quantity > product.stock) {
            throw new Error(`Only ${product.stock} ${product.unit} available`);
          }

          // Add new item
          const newItem: CartItem = {
            id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            productId: product.id,
            product,
            quantity,
            subtotal: product.price * quantity
          };

          const newItems = [...items, newItem];
          const { totalItems, totalAmount } = calculateTotals(newItems);

          set({
            items: newItems,
            totalItems,
            totalAmount
          });
        }
      },

      removeFromCart: (itemId: string) => {
        const { items } = get();
        const newItems = items.filter(item => item.id !== itemId);
        const { totalItems, totalAmount } = calculateTotals(newItems);

        set({
          items: newItems,
          totalItems,
          totalAmount
        });
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity < 1) return;

        const { items } = get();
        const item = items.find(item => item.id === itemId);
        
        if (!item) return;

        // Check if new quantity exceeds stock
        if (quantity > item.product.stock) {
          throw new Error(`Only ${item.product.stock} ${item.product.unit} available`);
        }

        const newItems = items.map(item =>
          item.id === itemId
            ? { ...item, quantity, subtotal: item.product.price * quantity }
            : item
        );
        
        const { totalItems, totalAmount } = calculateTotals(newItems);

        set({
          items: newItems,
          totalItems,
          totalAmount
        });
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalAmount: 0
        });
      },

      getCartItem: (productId: string) => {
        const { items } = get();
        return items.find(item => item.productId === productId);
      }
    }),
    {
      name: 'agrisense-cart', // unique name for localStorage key
      partialize: (state) => ({ 
        items: state.items,
        totalItems: state.totalItems,
        totalAmount: state.totalAmount
      })
    }
  )
);