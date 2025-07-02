import { create } from 'zustand';
import toast from 'react-hot-toast';

// Define the shape of each farmer's profile
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
  profileImageUrl?: string;       // Optional: for use in modal and map popup
}

// Define the zustand store's shape and methods
interface FarmerModerationState {
  farmerProfiles: FarmerProfile[];
  isLoading: boolean;
  approveFarmer: (farmerId: string) => Promise<void>;
  rejectFarmer: (farmerId: string, reason?: string) => Promise<void>;
  getFarmersByStatus: (status: FarmerProfile['status']) => FarmerProfile[];
}

// Sample data to simulate a backend
const mockFarmerProfiles: FarmerProfile[] = [
  {
    id: 'seller-1',
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
    documentsSubmitted: true,
    profileImageUrl: 'https://randomuser.me/api/portraits/men/1.jpg' // sample image
  },
  {
    id: 'seller-2',
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
    // no image for this seller
  },
  {
    id: 'seller-3',
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
  },
  {
    id: 'seller-4',
    name: 'Liza Navarro',
    email: 'liza@urbanorganics.ph',
    phone: '+63 917 123 4567',
    businessName: 'Urban Organics QC',
    registrationDate: new Date('2024-01-19'),
    location: {
      lat: 14.6760,
      lng: 121.0437,
      address: 'Quezon City, Metro Manila'
    },
    status: 'approved',
    documentsSubmitted: true,
    verificationNotes: 'Verified urban farm with rooftop greenhouse setup.',
    profileImageUrl: 'https://randomuser.me/api/portraits/women/65.jpg' // Metro Manila
  },
  {
    id: 'seller-5',
    name: 'Pedro Reyes',
    email: 'pedro@reyespoultry.com',
    phone: '+63 926 234 5678',
    businessName: 'Reyes Poultry Farm',
    registrationDate: new Date('2024-01-20'),
    location: {
      lat: 14.5358,
      lng: 121.0453,
      address: 'Pasig City, Metro Manila'
    },
    status: 'approved',
    documentsSubmitted: true,
    verificationNotes: 'Site inspection complete. Poultry housing meets sanitary standards.',
    profileImageUrl: 'https://randomuser.me/api/portraits/men/33.jpg' // Metro Manila
  },
  {
    id: 'seller-6',
    name: 'Angela Bautista',
    email: 'angela@bautistafarms.ph',
    phone: '+63 927 987 6543',
    businessName: 'Bautista Family Farms',
    registrationDate: new Date('2024-01-21'),
    location: {
      lat: 14.5244,
      lng: 121.0794,
      address: 'Taguig City, Metro Manila'
    },
    status: 'approved',
    documentsSubmitted: true,
    profileImageUrl: 'https://randomuser.me/api/portraits/women/12.jpg' // Metro Manila
  }
];


// Zustand store setup
export const useFarmerModerationStore = create<FarmerModerationState>((set, get) => ({
  farmerProfiles: mockFarmerProfiles,
  isLoading: false,

  // Approve farmer by updating their status and setting a default note
  approveFarmer: async (farmerId: string) => {
    set({ isLoading: true });

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

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

  // Reject farmer with optional custom reason
  rejectFarmer: async (farmerId: string, reason?: string) => {
    set({ isLoading: true });

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

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

  // Get farmers based on approval status
  getFarmersByStatus: (status: FarmerProfile['status']) => {
    const { farmerProfiles } = get();
    return farmerProfiles.filter(farmer => farmer.status === status);
  }
}));
