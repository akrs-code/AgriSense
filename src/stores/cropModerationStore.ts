import { create } from 'zustand';
import toast from 'react-hot-toast';
import { CropListing, FlagCropDTO, GetCropListingsFilterDTO, RejectCropDTO } from '../types/cropListing.types';


const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const apiClient = {
  // Fetches crop listings, optionally filtered by status
  fetchCropListings: async (filters?: GetCropListingsFilterDTO): Promise<CropListing[]> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
    };

    // Construct query parameters based on filters
    const queryParams = new URLSearchParams();
    if (filters?.status) {
      queryParams.append('status', filters.status);
    }
    if (filters?.farmerId) {
      queryParams.append('farmer_id', filters.farmerId); // Use snake_case for backend param
    }
    // Add other filter parameters as needed (e.g., page, limit, date ranges)

    const url = `${API_BASE_URL}/crop-listings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch crop listings.' }));
      throw new Error(errorData.message || 'Failed to fetch crop listings.');
    }

    const cropListings: CropListing[] = await response.json();

    return cropListings;
  },

  // Approves a crop listing
  approveCrop: async (cropId: string): Promise<CropListing> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/crop-listings/${cropId}/approve`, {
      method: 'PATCH', // PATCH is generally preferred for partial updates
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      // No body typically needed for simple approval if ID is in URL
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to approve crop.' }));
      throw new Error(errorData.message || 'Failed to approve crop.');
    }

    // Backend should return the updated crop listing
    const updatedCrop: CropListing = await response.json();
    return updatedCrop;
  },

  // Rejects a crop listing
  rejectCrop: async (cropId: string, reason?: string): Promise<CropListing> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const requestBody: RejectCropDTO = { reason };

    const response = await fetch(`${API_BASE_URL}/crop-listings/${cropId}/reject`, {
      method: 'PATCH', // PATCH is generally preferred for partial updates
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody), // Send the reason in the body
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to reject crop.' }));
      throw new Error(errorData.message || 'Failed to reject crop.');
    }

    // Backend should return the updated crop listing
    const updatedCrop: CropListing = await response.json();
    return updatedCrop;
  },

  // Flags a crop listing
  flagCrop: async (cropId: string, reason: string): Promise<CropListing> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const requestBody: FlagCropDTO = { reason }; // Reason is required for FlagCropDTO

    const response = await fetch(`${API_BASE_URL}/crop-listings/${cropId}/flag`, {
      method: 'PATCH', // PATCH is generally preferred for partial updates
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody), // Send the reason in the body
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to flag crop.' }));
      throw new Error(errorData.message || 'Failed to flag crop.');
    }

    // Backend should return the updated crop listing
    const updatedCrop: CropListing = await response.json();
    return updatedCrop;
  },
};


interface CropModerationState {
  cropListings: CropListing[];
  isLoading: boolean;
  approveCrop: (cropId: string) => Promise<void>;
  rejectCrop: (cropId: string, reason?: string) => Promise<void>;
  flagCrop: (cropId: string, reason: string) => Promise<void>;
  getCropsByStatus: (status: CropListing['status']) => CropListing[];
}



export const useCropModerationStore = create<CropModerationState>((set, get) => ({
  cropListings: [],
  isLoading: false,

  fetchCropListings: async (filters?: GetCropListingsFilterDTO) => {
    set({ isLoading: true });
    try {
      const fetchedCrops = await apiClient.fetchCropListings(filters);
      set({
        cropListings: fetchedCrops,
        isLoading: false,
      });
      console.log('Crop listings fetched successfully:', fetchedCrops);
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.message || 'Failed to fetch crop listings.');
      console.error('Error fetching crop listings:', error);
      // Re-throw if calling component needs to handle it further
      throw error;
    }
  },

  approveCrop: async (cropId: string) => {
    set({ isLoading: true });

    try {
      const updatedCrop = await apiClient.approveCrop(cropId); // Call the actual API client

      set(state => ({
        cropListings: state.cropListings.map(crop =>
          crop.id === cropId
            ? updatedCrop // Replace with the actual updated crop from backend
            : crop
        ),
        isLoading: false
      }));

      toast.success('✅ Crop approved successfully!');
    } catch (error: any) { // Catch error as 'any' for better error message handling
      set({ isLoading: false });
      toast.error(error.message || 'Failed to approve crop.');
      console.error('Error approving crop:', error);
      throw error; // Re-throw for component to handle if needed
    }
  },

  rejectCrop: async (cropId: string, reason?: string) => {
    set({ isLoading: true });

    try {
      const updatedCrop = await apiClient.rejectCrop(cropId, reason); // Call the actual API client

      set(state => ({
        cropListings: state.cropListings.map(crop =>
          crop.id === cropId
            ? updatedCrop // Replace with the actual updated crop from backend
            : crop
        ),
        isLoading: false
      }));

      toast.success('❌ Crop rejected successfully!');
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.message || 'Failed to reject crop.');
      console.error('Error rejecting crop:', error);
      throw error;
    }
  },

  flagCrop: async (cropId: string, reason: string) => {
    set({ isLoading: true });

    try {
      const updatedCrop = await apiClient.flagCrop(cropId, reason); // Call the actual API client

      set(state => ({
        cropListings: state.cropListings.map(crop =>
          crop.id === cropId
            ? updatedCrop // Replace with the actual updated crop from backend
            : crop
        ),
        isLoading: false
      }));

      toast.success('⚠️ Crop flagged for review!');
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.message || 'Failed to flag crop.');
      console.error('Error flagging crop:', error);
      throw error;
    }
  },

  getCropsByStatus: (status: CropListing['status']) => {
    const { cropListings } = get();
    return cropListings.filter(crop => crop.status === status);
  }
}));