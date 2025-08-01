import { create } from 'zustand';
import toast from 'react-hot-toast';
import { Seller } from '../types';
import { ApproveFarmerDTO, GetFarmerProfilesFilterDTO, RejectFarmerDTO } from '../types/farmerModeration.types';
import { VerificationStatus } from '../types/enums';


const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const farmerApiClient = {
  // Fetches farmer profiles, optionally filtered by status
  fetchFarmerProfiles: async (filters?: GetFarmerProfilesFilterDTO): Promise<Seller[]> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
    };

    const queryParams = new URLSearchParams();
    if (filters?.status) {
      // Assuming backend uses 'status' or 'verification_status' as query param
      queryParams.append('status', filters.status);
    }
    // Add other filter parameters as needed (e.g., name, email, businessName)

    const url = `${API_BASE_URL}/farmers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch farmer profiles.' }));
      throw new Error(errorData.message || 'Failed to fetch farmer profiles.');
    }

    // Backend should return an array of Seller objects
    const farmerProfiles: Seller[] = await response.json();
    return farmerProfiles;
  },

  // Approves a farmer profile
  approveFarmer: async (farmerId: string, data?: ApproveFarmerDTO): Promise<Seller> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/farmers/${farmerId}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: data ? JSON.stringify(data) : undefined, // Include body if ApproveFarmerDTO has fields
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to approve farmer.' }));
      throw new Error(errorData.message || 'Failed to approve farmer.');
    }

    // Backend should return the updated Seller object
    const updatedFarmer: Seller = await response.json();
    return updatedFarmer;
  },

  // Rejects a farmer profile
  rejectFarmer: async (farmerId: string, data: RejectFarmerDTO): Promise<Seller> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/farmers/${farmerId}/reject`, {
      method: 'PATCH', // Or PUT
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data), // Send the reason in the body
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to reject farmer.' }));
      throw new Error(errorData.message || 'Failed to reject farmer.');
    }

    // Backend should return the updated Seller object
    const updatedFarmer: Seller = await response.json();
    return updatedFarmer;
  },
};



interface FarmerModerationState {
  farmerProfiles: Seller[]; // Use Seller[] instead of FarmerProfile[]
  isLoading: boolean;
  fetchFarmerProfiles: (filters?: GetFarmerProfilesFilterDTO) => Promise<void>;
  approveFarmer: (farmerId: string, data?: ApproveFarmerDTO) => Promise<void>;
  rejectFarmer: (farmerId: string, reason?: string) => Promise<void>;
  getFarmersByStatus: (status: VerificationStatus) => Seller[]; // Use VerificationStatus
}


export const useFarmerModerationStore = create<FarmerModerationState>((set, get) => ({
  farmerProfiles: [], // Initialize with an empty array, data will be fetched from API
  isLoading: false,

  fetchFarmerProfiles: async (filters?: GetFarmerProfilesFilterDTO) => {
    set({ isLoading: true });
    try {
      const fetchedFarmers = await farmerApiClient.fetchFarmerProfiles(filters);
      set({
        farmerProfiles: fetchedFarmers,
        isLoading: false,
      });
      console.log('Farmer profiles fetched successfully:', fetchedFarmers);
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.message || 'Failed to fetch farmer profiles.');
      console.error('Error fetching farmer profiles:', error);
      throw error;
    }
  },

  approveFarmer: async (farmerId: string, data?: ApproveFarmerDTO) => {
    set({ isLoading: true });
    try {
      const updatedFarmer = await farmerApiClient.approveFarmer(farmerId, data);

      set(state => ({
        farmerProfiles: state.farmerProfiles.map(farmer =>
          farmer.id === farmerId ? updatedFarmer : farmer
        ),
        isLoading: false,
      }));
      toast.success(`Farmer ${updatedFarmer.name} approved successfully!`);
      console.log('Farmer approved successfully:', updatedFarmer);
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.message || 'Failed to approve farmer.');
      console.error('Error approving farmer:', error);
      throw error;
    }
  },

  rejectFarmer: async (farmerId: string, reason?: string) => {
    set({ isLoading: true });

    try {
      const requestBody: RejectFarmerDTO = { reason };
      const updatedFarmer = await farmerApiClient.rejectFarmer(farmerId, requestBody); // Call the actual API client

      set(state => ({
        farmerProfiles: state.farmerProfiles.map(farmer =>
          farmer.id === farmerId
            ? updatedFarmer // Replace with the actual updated farmer from backend
            : farmer
        ),
        isLoading: false
      }));

      toast.success('❌ Farmer rejected successfully!');
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.message || 'Failed to reject farmer.');
      console.error('Error rejecting farmer:', error);
      throw error;
    }
  },

  getFarmersByStatus: (status: VerificationStatus) => {
    const { farmerProfiles } = get();
    // Filter by verificationStatus property on the Seller object
    return farmerProfiles.filter(farmer => farmer.verificationStatus === status);
  }
}));