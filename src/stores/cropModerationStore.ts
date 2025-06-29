import { create } from 'zustand';
import toast from 'react-hot-toast';

export interface CropListing {
  id: string;
  cropName: string;
  variety: string;
  farmerName: string;
  farmerId: string;
  price: number;
  unit: string;
  quantity: number;
  submissionDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  images: string[];
  description: string;
  location: string;
  isSuspicious: boolean;
  flagReason?: string;
}

interface CropModerationState {
  cropListings: CropListing[];
  isLoading: boolean;
  approveCrop: (cropId: string) => Promise<void>;
  rejectCrop: (cropId: string, reason?: string) => Promise<void>;
  flagCrop: (cropId: string, reason: string) => Promise<void>;
  getCropsByStatus: (status: CropListing['status']) => CropListing[];
}

const mockCropListings: CropListing[] = [
  {
    id: 'crop-1',
    cropName: 'Premium Rice',
    variety: 'Jasmine',
    farmerName: 'Juan Dela Cruz',
    farmerId: 'farmer-1',
    price: 45,
    unit: 'kg',
    quantity: 500,
    submissionDate: new Date('2024-01-20'),
    status: 'pending',
    images: ['https://images.pexels.com/photos/164504/pexels-photo-164504.jpeg'],
    description: 'High-quality jasmine rice, freshly harvested from organic farm.',
    location: 'Cabanatuan, Nueva Ecija',
    isSuspicious: false
  },
  {
    id: 'crop-2',
    cropName: 'Sweet Corn',
    variety: 'Golden Sweet',
    farmerName: 'Maria Santos',
    farmerId: 'farmer-2',
    price: 35,
    unit: 'kg',
    quantity: 200,
    submissionDate: new Date('2024-01-18'),
    status: 'flagged',
    images: ['https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg'],
    description: 'Fresh sweet corn perfect for boiling and grilling.',
    location: 'Manila, Metro Manila',
    isSuspicious: true,
    flagReason: 'Urban location suspicious for corn farming'
  },
  {
    id: 'crop-3',
    cropName: 'Organic Tomatoes',
    variety: 'Cherry',
    farmerName: 'Carlos Rodriguez',
    farmerId: 'farmer-3',
    price: 80,
    unit: 'kg',
    quantity: 100,
    submissionDate: new Date('2024-01-15'),
    status: 'approved',
    images: ['https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg'],
    description: 'Organic cherry tomatoes grown without pesticides.',
    location: 'Tarlac City, Tarlac',
    isSuspicious: false
  }
];

export const useCropModerationStore = create<CropModerationState>((set, get) => ({
  cropListings: mockCropListings,
  isLoading: false,

  approveCrop: async (cropId: string) => {
    set({ isLoading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        cropListings: state.cropListings.map(crop =>
          crop.id === cropId
            ? { ...crop, status: 'approved' as const }
            : crop
        ),
        isLoading: false
      }));
      
      toast.success('✅ Crop approved');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to approve crop');
      throw error;
    }
  },

  rejectCrop: async (cropId: string, reason?: string) => {
    set({ isLoading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        cropListings: state.cropListings.map(crop =>
          crop.id === cropId
            ? { ...crop, status: 'rejected' as const, flagReason: reason }
            : crop
        ),
        isLoading: false
      }));
      
      toast.success('❌ Crop rejected');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to reject crop');
      throw error;
    }
  },

  flagCrop: async (cropId: string, reason: string) => {
    set({ isLoading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        cropListings: state.cropListings.map(crop =>
          crop.id === cropId
            ? { ...crop, status: 'flagged' as const, flagReason: reason, isSuspicious: true }
            : crop
        ),
        isLoading: false
      }));
      
      toast.success('⚠️ Crop flagged for review');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to flag crop');
      throw error;
    }
  },

  getCropsByStatus: (status: CropListing['status']) => {
    const { cropListings } = get();
    return cropListings.filter(crop => crop.status === status);
  }
}));