import { create } from 'zustand';
import { Crop, MarketPrice } from '../types';

interface CropState {
  crops: Crop[];
  marketPrices: MarketPrice[];
  isLoading: boolean;
  addCrop: (crop: Omit<Crop, 'id' | 'createdAt'>) => void;
  updateCrop: (id: string, updates: Partial<Crop>) => void;
  deleteCrop: (id: string) => void;
  fetchCrops: () => Promise<void>;
  fetchMarketPrices: () => Promise<void>;
  filterCrops: (filters: {
    type?: string;
    location?: string;
    maxDistance?: number;
    userLat?: number;
    userLng?: number;
  }) => Crop[];
}

const mockCrops: Crop[] = [
  {
    id: '1',
    farmerId: '1',
    name: 'Rice',
    variety: 'Jasmine',
    quantity: 500,
    unit: 'kg',
    pricePerUnit: 45,
    harvestDate: new Date('2024-01-15'),
    condition: 'fresh',
    description: 'Premium quality jasmine rice, freshly harvested',
    images: ['https://images.pexels.com/photos/164504/pexels-photo-164504.jpeg'],
    location: {
      lat: 14.5995,
      lng: 120.9842,
      address: 'Cabanatuan, Nueva Ecija'
    },
    isAvailable: true,
    createdAt: new Date('2024-01-10')
  },
  {
    id: '2',
    farmerId: '2',
    name: 'Corn',
    variety: 'Sweet Corn',
    quantity: 200,
    unit: 'kg',
    pricePerUnit: 35,
    harvestDate: new Date('2024-01-20'),
    condition: 'fresh',
    description: 'Sweet corn perfect for boiling and grilling',
    images: ['https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg'],
    location: {
      lat: 14.6091,
      lng: 121.0223,
      address: 'Quezon, Nueva Ecija'
    },
    isAvailable: true,
    createdAt: new Date('2024-01-12')
  }
];

const mockMarketPrices: MarketPrice[] = [
  {
    id: '1',
    cropName: 'Rice',
    region: 'Central Luzon',
    price: 42,
    unit: 'kg',
    date: new Date()
  },
  {
    id: '2',
    cropName: 'Corn',
    region: 'Central Luzon',
    price: 38,
    unit: 'kg',
    date: new Date()
  }
];

export const useCropStore = create<CropState>((set, get) => ({
  crops: mockCrops,
  marketPrices: mockMarketPrices,
  isLoading: false,

  addCrop: (cropData) => {
    const newCrop: Crop = {
      ...cropData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    set(state => ({
      crops: [...state.crops, newCrop]
    }));
  },

  updateCrop: (id, updates) => {
    set(state => ({
      crops: state.crops.map(crop => 
        crop.id === id ? { ...crop, ...updates } : crop
      )
    }));
  },

  deleteCrop: (id) => {
    set(state => ({
      crops: state.crops.filter(crop => crop.id !== id)
    }));
  },

  fetchCrops: async () => {
    set({ isLoading: true });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isLoading: false });
  },

  fetchMarketPrices: async () => {
    set({ isLoading: true });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isLoading: false });
  },

  filterCrops: (filters) => {
    const { crops } = get();
    
    return crops.filter(crop => {
      if (filters.type && !crop.name.toLowerCase().includes(filters.type.toLowerCase())) {
        return false;
      }
      
      if (filters.location && !crop.location.address.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      // Add distance filtering logic here if needed
      
      return true;
    });
  }
}));