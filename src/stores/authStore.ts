import { create } from 'zustand';
import { User, Seller, Buyer } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email?: string;
    password: string;
    name: string;
    phone: string;
    role: 'buyer' | 'seller';
    businessName?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateLocation: (location: { lat: number; lng: number; address: string }) => void;
  updateEWalletDetails: (eWalletDetails: { provider: string; accountNumber: string; accountName: string; qrCodeImage?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data based on email
      let mockUser: User;
      
      if (email === 'admin@agrimarket.com') {
        mockUser = {
          id: 'admin-1',
          email,
          phone: '+63 912 345 6789',
          name: 'Admin User',
          role: 'admin',
          isVerified: true,
          location: {
            lat: 14.5995,
            lng: 120.9842,
            address: 'Manila, Philippines'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } else if (email.includes('seller')) {
        mockUser = {
          id: 'seller-1',
          email,
          phone: '+63 912 345 6789',
          name: 'Juan Dela Cruz',
          role: 'seller',
          isVerified: true,
          location: {
            lat: 15.4817,
            lng: 120.5979,
            address: 'Cabanatuan, Nueva Ecija'
          },
          businessName: 'Dela Cruz Farm',
          verificationStatus: 'approved',
          rating: 4.8,
          reviewCount: 156,
          totalSales: 2500000,
          eWalletDetails: {
            provider: 'GCash',
            accountNumber: '09123456789',
            accountName: 'Juan Dela Cruz',
            qrCodeImage: 'https://via.placeholder.com/300x300/4F46E5/ffffff?text=GCash+QR+Code'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        } as Seller;
      } else {
        mockUser = {
          id: 'buyer-1',
          email,
          phone: '+63 912 345 6789',
          name: 'Maria Santos',
          role: 'buyer',
          isVerified: true,
          location: {
            lat: 14.5995,
            lng: 120.9842,
            address: 'Quezon City, Philippines'
          },
          purchaseHistory: [],
          favoriteProducts: [],
          createdAt: new Date(),
          updatedAt: new Date()
        } as Buyer;
      }

      set({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (userData) => {
    set({ isLoading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create email from phone if not provided
      const email = userData.email || `${userData.phone.replace(/\D/g, '')}@agrisense.com`;
      
      const newUser: User = {
        id: Date.now().toString(),
        email: email,
        phone: userData.phone,
        name: userData.name,
        role: userData.role,
        isVerified: false,
        location: {
          lat: 14.5995,
          lng: 120.9842,
          address: 'Philippines'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        ...(userData.role === 'seller' && {
          businessName: userData.businessName || `${userData.name}'s Farm`,
          verificationStatus: undefined, // Start without verification status
          rating: 0,
          reviewCount: 0,
          totalSales: 0
        })
      };

      set({
        user: newUser,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false
    });
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;

    set({ isLoading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({
        user: { ...user, ...updates, updatedAt: new Date() },
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateLocation: (location) => {
    const { user } = get();
    if (!user) return;

    set({
      user: { ...user, location }
    });
  },

  updateEWalletDetails: async (eWalletDetails) => {
    const { user } = get();
    if (!user || user.role !== 'seller') return;

    set({ isLoading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = {
        ...user,
        eWalletDetails,
        updatedAt: new Date()
      } as Seller;

      set({
        user: updatedUser,
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  }
}));