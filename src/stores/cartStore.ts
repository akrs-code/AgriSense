import { create } from 'zustand';
import { Product } from '../types/product.types';
import { CartItem, BackendCartResponse } from '../types/cart.types';


const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;



const apiClient = {
  fetchCart: async (): Promise<BackendCartResponse> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch cart.' }));
      throw new Error(errorData.message || 'Failed to fetch cart.');
    }

    return response.json();
  },

  addToCart: async (productId: string, quantity: number): Promise<BackendCartResponse> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId, quantity }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add item to cart.');
    }

    return response.json(); // Backend returns the updated cart
  },

  updateCartItemQuantity: async (itemId: string, quantity: number): Promise<BackendCartResponse> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/cart/update/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update cart item quantity.');
    }

    return response.json(); // Backend returns the updated cart
  },

  removeCartItem: async (itemId: string): Promise<BackendCartResponse> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/cart/remove/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to remove item from cart.' }));
      throw new Error(errorData.message || 'Failed to remove item from cart.');
    }

    return response.json(); // Backend returns the updated cart
  },

  clearCart: async (): Promise<BackendCartResponse> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/cart/clear`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to clear cart.' }));
      throw new Error(errorData.message || 'Failed to clear cart.');
    }

    return response.json(); // Backend returns an empty cart or confirmation
  },
};





interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (product: Product, quantity?: number) => Promise<boolean>;
  forceAddToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartItem: (productId: string) => CartItem | undefined;
  setError: (message: string | null) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const backendCart = await apiClient.fetchCart();
      set({
        items: backendCart.items,
        totalItems: backendCart.totalItems,
        totalAmount: backendCart.totalAmount,
        isLoading: false,
      });
      console.log('Cart fetched successfully:', backendCart);
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      console.error('Error fetching cart:', error.message);
      // Re-throw to allow components to handle
      throw error;
    }
  },

  addToCart: async (product: Product, quantity = 1) => {
    set({ isLoading: true, error: null });
    const { items } = get();
    const existingItem = items.find(item => item.productId === product.id);

    if (existingItem) {
      set({ isLoading: false });
      return false; // Indicate that the item already exists
    }

    // Frontend stock check before sending to backend
    if (quantity > product.quantity) {
      const errorMessage = `Only ${product.quantity} ${product.unit} available`;
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }

    try {
      // Backend handles adding a new item or incrementing if `forceAddToCart` is used
      const updatedCart = await apiClient.addToCart(product.id, quantity);
      set({
        items: updatedCart.items,
        totalItems: updatedCart.totalItems,
        totalAmount: updatedCart.totalAmount,
        isLoading: false,
      });
      console.log('Item added to cart successfully:', updatedCart);
      return true;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      console.error('Error adding to cart:', error.message);
      throw error;
    }
  },

  forceAddToCart: async (product: Product, quantity = 1) => {
    set({ isLoading: true, error: null });
    const { items } = get();
    const existingItem = items.find(item => item.productId === product.id);

    // Frontend check for stock if incrementing
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.quantity) {
        const errorMessage = `Cannot add more. Only ${product.quantity} ${product.unit} available`;
        set({ isLoading: false, error: errorMessage });
        throw new Error(errorMessage);
      }
    } else {
      // Frontend check for stock if adding new
      if (quantity > product.quantity) {
        const errorMessage = `Only ${product.quantity} ${product.unit} available`;
        set({ isLoading: false, error: errorMessage });
        throw new Error(errorMessage);
      }
    }

    try {
      // Backend handles the logic of adding or incrementing quantity
      const updatedCart = await apiClient.addToCart(product.id, quantity); // Use the same add endpoint, backend logic determines if it's new or update
      set({
        items: updatedCart.items,
        totalItems: updatedCart.totalItems,
        totalAmount: updatedCart.totalAmount,
        isLoading: false,
      });
      console.log('Item forced into cart successfully:', updatedCart);
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      console.error('Error forcing item to cart:', error.message);
      throw error;
    }
  },

  removeFromCart: async (itemId: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCart = await apiClient.removeCartItem(itemId);
      set({
        items: updatedCart.items,
        totalItems: updatedCart.totalItems,
        totalAmount: updatedCart.totalAmount,
        isLoading: false,
      });
      console.log(`Item ${itemId} removed from cart successfully.`, updatedCart);
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      console.error('Error removing item from cart:', error.message);
      throw error;
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      // Optionally remove item if quantity drops to 0 or less
      get().removeFromCart(itemId);
      return;
    }

    set({ isLoading: true, error: null });
    const { items } = get();
    const itemToUpdate = items.find(item => item.id === itemId);

    if (!itemToUpdate) {
      set({ isLoading: false, error: 'Cart item not found.' });
      return;
    }

    // Frontend stock check before sending to backend
    if (quantity > itemToUpdate.quantity) {
      const errorMessage = `Only ${itemToUpdate.quantity} ${itemToUpdate.product.unit} available`;
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }

    try {
      const updatedCart = await apiClient.updateCartItemQuantity(itemId, quantity);
      set({
        items: updatedCart.items,
        totalItems: updatedCart.totalItems,
        totalAmount: updatedCart.totalAmount,
        isLoading: false,
      });
      console.log(`Quantity for item ${itemId} updated successfully.`, updatedCart);
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      console.error('Error updating item quantity:', error.message);
      throw error;
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const clearedCart = await apiClient.clearCart();
      set({
        items: clearedCart.items, // Should be an empty array from backend
        totalItems: clearedCart.totalItems, // Should be 0
        totalAmount: clearedCart.totalAmount, // Should be 0
        isLoading: false,
      });
      console.log('Cart cleared successfully.');
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      console.error('Error clearing cart:', error.message);
      throw error;
    }
  },

  getCartItem: (productId: string) => {
    const { items } = get();
    return items.find(item => item.productId === productId);
  },

  setError: (message: string | null) => {
    set({ error: message });
  }
}));