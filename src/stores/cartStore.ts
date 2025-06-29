import { create } from 'zustand';
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

export const useCartStore = create<CartState>((set, get) => ({
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

    const newItem: CartItem = {
      id: `cart-${Date.now()}`,
      productId: product.id,
      product,
      quantity,
      subtotal: product.price * quantity
    };

    const newItems = [...items, newItem];
    const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = newItems.reduce((sum, item) => sum + item.subtotal, 0);

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
      // Increment quantity if item already exists
      const newItems = items.map(item =>
        item.productId === product.id
          ? { 
              ...item, 
              quantity: item.quantity + quantity,
              subtotal: (item.quantity + quantity) * item.product.price
            }
          : item
      );
      
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce((sum, item) => sum + item.subtotal, 0);

      set({
        items: newItems,
        totalItems,
        totalAmount
      });
    } else {
      // Add new item
      const newItem: CartItem = {
        id: `cart-${Date.now()}`,
        productId: product.id,
        product,
        quantity,
        subtotal: product.price * quantity
      };

      const newItems = [...items, newItem];
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce((sum, item) => sum + item.subtotal, 0);

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
    const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = newItems.reduce((sum, item) => sum + item.subtotal, 0);

    set({
      items: newItems,
      totalItems,
      totalAmount
    });
  },

  updateQuantity: (itemId: string, quantity: number) => {
    const { items } = get();
    const newItems = items.map(item =>
      item.id === itemId
        ? { ...item, quantity, subtotal: item.product.price * quantity }
        : item
    );
    const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = newItems.reduce((sum, item) => sum + item.subtotal, 0);

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
}));