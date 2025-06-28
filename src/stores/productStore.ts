import { create } from 'zustand';
import { Product, MarketPrice } from '../types';

interface ProductState {
  products: Product[];
  marketPrices: MarketPrice[];
  isLoading: boolean;
  searchQuery: string;
  filters: {
    category: string;
    location: string;
    priceRange: [number, number];
    condition: string;
  };
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchMarketPrices: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<ProductState['filters']>) => void;
  getFilteredProducts: () => Product[];
}

const mockProducts: Product[] = [
  {
    id: '1',
    sellerId: 'seller-1',
    name: 'Premium Rice',
    category: 'Grains',
    variety: 'Jasmine',
    description: 'High-quality jasmine rice, freshly harvested from our organic farm. Perfect for daily meals with excellent aroma and taste.',
    price: 45,
    unit: 'kg',
    stock: 500,
    images: [
      'https://images.pexels.com/photos/164504/pexels-photo-164504.jpeg',
      'https://images.pexels.com/photos/33239/wheat-field-wheat-yellow-grain.jpg'
    ],
    location: {
      lat: 15.4817,
      lng: 120.5979,
      address: 'Cabanatuan, Nueva Ecija'
    },
    harvestDate: new Date('2024-01-15'),
    condition: 'fresh',
    isActive: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '2',
    sellerId: 'seller-1',
    name: 'Sweet Corn',
    category: 'Vegetables',
    variety: 'Golden Sweet',
    description: 'Fresh sweet corn perfect for boiling, grilling, or making corn soup. Harvested at peak sweetness.',
    price: 35,
    unit: 'kg',
    stock: 200,
    images: [
      'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg'
    ],
    location: {
      lat: 15.4817,
      lng: 120.5979,
      address: 'Cabanatuan, Nueva Ecija'
    },
    harvestDate: new Date('2024-01-20'),
    condition: 'fresh',
    isActive: true,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  }
];

const mockMarketPrices: MarketPrice[] = [
  {
    id: '1',
    productName: 'Rice',
    category: 'Grains',
    region: 'Central Luzon',
    averagePrice: 42,
    unit: 'kg',
    trend: 'up',
    lastUpdated: new Date()
  },
  {
    id: '2',
    productName: 'Corn',
    category: 'Vegetables',
    region: 'Central Luzon',
    averagePrice: 38,
    unit: 'kg',
    trend: 'stable',
    lastUpdated: new Date()
  }
];

export const useProductStore = create<ProductState>((set, get) => ({
  products: mockProducts,
  marketPrices: mockMarketPrices,
  isLoading: false,
  searchQuery: '',
  filters: {
    category: '',
    location: '',
    priceRange: [0, 1000],
    condition: ''
  },

  addProduct: async (productData) => {
    set({ isLoading: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      set(state => ({
        products: [...state.products, newProduct],
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateProduct: async (id, updates) => {
    set({ isLoading: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        products: state.products.map(product => 
          product.id === id 
            ? { ...product, ...updates, updatedAt: new Date() }
            : product
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        products: state.products.filter(product => product.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchProducts: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isLoading: false });
  },

  fetchMarketPrices: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isLoading: false });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  getFilteredProducts: () => {
    const { products, searchQuery, filters } = get();
    
    return products.filter(product => {
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.variety.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !filters.category || product.category === filters.category;
      const matchesLocation = !filters.location || 
        product.location.address.toLowerCase().includes(filters.location.toLowerCase());
      const matchesPrice = product.price >= filters.priceRange[0] && 
        product.price <= filters.priceRange[1];
      const matchesCondition = !filters.condition || product.condition === filters.condition;
      
      return matchesSearch && matchesCategory && matchesLocation && 
             matchesPrice && matchesCondition && product.isActive;
    });
  }
}));