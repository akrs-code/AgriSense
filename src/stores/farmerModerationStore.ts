import { create } from 'zustand';
import toast from 'react-hot-toast';

export interface FarmerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  registrationDate: Date;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  documentsSubmitted: boolean;
  verificationNotes?: string;
}

interface FarmerModerationState {
  farmerProfiles: FarmerProfile[];
  isLoading: boolean;
  approveFarmer: (farmerId: string) => Promise<void>;
  rejectFarmer: (farmerId: string, reason?: string) => Promise<void>;
  getFarmersByStatus: (status: FarmerProfile['status']) => FarmerProfile[];
}

const mockFarmerProfiles: FarmerProfile[] = [
  {
    id: 'farmer-1',
    name: 'Juan Dela Cruz',
    email: 'juan@delacruzfarm.com',
    phone: '+63 912 345 6789',
    businessName: 'Dela Cruz Organic Farm',
    registrationDate: new Date('2024-01-15'),
    location: {
      lat: 15.4817,
      lng: 120.5979,
      address: 'Cabanatuan, Nueva Ecija'
    },
    status: 'pending',
    documentsSubmitted: true
  },
  {
    id: 'farmer-2',
    name: 'Maria Santos',
    email: 'maria@santosfarm.com',
    phone: '+63 923 456 7890',
    businessName: 'Santos Family Farm',
    registrationDate: new Date('2024-01-18'),
    location: {
      lat: 14.6091,
      lng: 121.0223,
      address: 'Quezon, Nueva Ecija'
    },
    status: 'pending',
    documentsSubmitted: true
  },
  {
    id: 'farmer-3',
    name: 'Carlos Rodriguez',
    email: 'carlos@rodriguezfarm.com',
    phone: '+63 934 567 8901',
    businessName: 'Rodriguez Organic Farm',
    registrationDate: new Date('2024-01-10'),
    location: {
      lat: 15.2500,
      lng: 120.8833,
      address: 'Tarlac City, Tarlac'
    },
    status: 'approved',
    documentsSubmitted: true,
    verificationNotes: 'All documents verified. Farm location confirmed.'
  }
];

export const useFarmerModerationStore = create<FarmerModerationState>((set, get) => ({
  farmerProfiles: mockFarmerProfiles,
  isLoading: false,

  approveFarmer: async (farmerId: string) => {
    set({ isLoading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        farmerProfiles: state.farmerProfiles.map(farmer =>
          farmer.id === farmerId
            ? { ...farmer, status: 'approved' as const, verificationNotes: 'Approved by admin' }
            : farmer
        ),
        isLoading: false
      }));
      
      toast.success('✅ Farmer approved');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to approve farmer');
      throw error;
    }
  },

  rejectFarmer: async (farmerId: string, reason?: string) => {
    set({ isLoading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        farmerProfiles: state.farmerProfiles.map(farmer =>
          farmer.id === farmerId
            ? { ...farmer, status: 'rejected' as const, verificationNotes: reason || 'Rejected by admin' }
            : farmer
        ),
        isLoading: false
      }));
      
      toast.success('❌ Farmer rejected');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to reject farmer');
      throw error;
    }
  },

  getFarmersByStatus: (status: FarmerProfile['status']) => {
    const { farmerProfiles } = get();
    return farmerProfiles.filter(farmer => farmer.status === status);
  }
}));