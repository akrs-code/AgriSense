import { create } from 'zustand';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  sellerId: string;
  image: string;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addToCart: (product, quantity = 1) => {
    const { items } = get();
    const existingItem = items.find(item => item.productId === product.id);

    if (existingItem) {
      set({
        items: items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      });
    } else {
      const newItem: CartItem = {
        id: Date.now().toString(),
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        unit: product.unit,
        sellerId: product.sellerId,
        image: product.images[0]
      };
      set({ items: [...items, newItem] });
    }
  },

  removeFromCart: (productId) => {
    set(state => ({
      items: state.items.filter(item => item.productId !== productId)
    }));
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }

    set(state => ({
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

  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}));