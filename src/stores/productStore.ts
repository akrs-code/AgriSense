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
    radiusKm: number | null;           // <--- NEW
    userLocation: { lat: number; lng: number } | null;  // <--- NEW
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
  },
  {
  id: '3',
  sellerId: 'seller-4',
  name: 'Organic Tomatoes',
  category: 'Vegetables',
  variety: 'Roma',
  description: 'Bright red organic tomatoes, freshly picked and pesticide-free. Perfect for salads, sauces, and soups.',
  price: 60,
  unit: 'kg',
  stock: 150,
  images: [
    'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg'
  ],
  location: {
    lat: 14.6760,
    lng: 121.0437,
    address: 'Quezon City, Metro Manila'
  },
  harvestDate: new Date('2024-01-25'),
  condition: 'fresh',
  isActive: true,
  createdAt: new Date('2024-01-20'),
  updatedAt: new Date('2024-01-20')
},
{
  id: '4',
  sellerId: 'seller-5',
  name: 'Free-Range Chicken Eggs',
  category: 'Livestock',
  variety: 'Brown Eggs',
  description: 'Farm-fresh brown eggs from healthy free-range chickens. High in protein and omega-3.',
  price: 8,
  unit: 'piece',
  stock: 500,
  images: [
    'https://images.pexels.com/photos/458796/pexels-photo-458796.jpeg'
  ],
  location: {
    lat: 14.5358,
    lng: 121.0453,
    address: 'Pasig City, Metro Manila'
  },
  harvestDate: new Date('2024-01-22'),
  condition: 'fresh',
  isActive: true,
  createdAt: new Date('2024-01-22'),
  updatedAt: new Date('2024-01-22')
  },
  {
    id: '5',
    sellerId: 'seller-6',
    name: 'Pakbet Veggie Set',
    category: 'Vegetables',
    variety: 'Assorted',
    description: 'A complete set of vegetables for Pakbet: eggplant, bitter melon, squash, okra, and string beans.',
    price: 120,
    unit: 'set',
    stock: 80,
    images: [
      'https://images.pexels.com/photos/128420/pexels-photo-128420.jpeg'
    ],
    location: {
      lat: 14.5244,
      lng: 121.0794,
      address: 'Taguig City, Metro Manila'
    },
    harvestDate: new Date('2024-01-19'),
    condition: 'fresh',
    isActive: true,
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19')
    },
    {
    id: '6',
    sellerId: 'seller-4',
    name: 'Hydroponic Lettuce',
    category: 'Vegetables',
    variety: 'Romaine',
    description: 'Crisp and clean hydroponically grown lettuce. Perfect for healthy salads.',
    price: 50,
    unit: 'bunch',
    stock: 100,
    images: [
      'https://images.pexels.com/photos/196643/pexels-photo-196643.jpeg'
    ],
    location: {
      lat: 14.6760,
      lng: 121.0437,
      address: 'Quezon City, Metro Manila'
    },
    harvestDate: new Date('2024-01-28'),
    condition: 'fresh',
    isActive: true,
    createdAt: new Date('2024-01-26'),
    updatedAt: new Date('2024-01-26')
  },
  {
    id: '7',
    sellerId: 'seller-4',
    name: 'Basil Leaves',
    category: 'Herbs',
    variety: 'Sweet Basil',
    description: 'Fresh basil grown organically on rooftop greenhouses. Great for pasta, pesto, and pizza.',
    price: 30,
    unit: 'bunch',
    stock: 60,
    images: [
      'https://images.pexels.com/photos/671956/pexels-photo-671956.jpeg'
    ],
    location: {
      lat: 14.6760,
      lng: 121.0437,
      address: 'Quezon City, Metro Manila'
    },
    harvestDate: new Date('2024-01-27'),
    condition: 'fresh',
    isActive: true,
    createdAt: new Date('2024-01-26'),
    updatedAt: new Date('2024-01-26')
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
  },
  
];

// simulate backend geofencing
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (val: number) => (val * Math.PI) / 180;
  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: mockProducts,
  marketPrices: mockMarketPrices,
  isLoading: false,
  searchQuery: '',
  filters: {
    category: '',
    location: '',
    priceRange: [0, 1000],
    condition: '',
    radiusKm: null,
    userLocation: null
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

      // NEW: Distance filter logic using Haversine formula
      const matchesDistance =
        !filters.radiusKm || !filters.userLocation ||
        getDistanceKm(
          product.location.lat,
          product.location.lng,
          filters.userLocation.lat,
          filters.userLocation.lng
        ) <= filters.radiusKm;

      // MODIFIED: Added matchesDistance to return condition
      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation &&
        matchesPrice &&
        matchesCondition &&
        matchesDistance &&   // <--- new condition added here
        product.isActive
      );
    });
  }

}));