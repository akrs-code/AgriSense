import { create } from 'zustand';
import { User, Seller, Buyer, Admin, BaseUser, Login } from '../types/user/user.types';
import { UserRole, VerificationStatus } from '../types/enums';
import { LoginRequestDTO, CreateUserDTO } from '../types/user/user.request';
import { UpdateProfileRequestDTO } from '../types/user/user.request';
import { LocationUpdateRequestDTO } from '../types/location';
import { EWalletUpdateRequestDTO } from '../types/ewallet.type';
import { SellerVerificationRequestDTO } from '../types/verification.dto';
import { FileUploadResult } from '../utils/fileUpload';
import toast from 'react-hot-toast';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type UserResponseDTO = BaseUser | Buyer | Seller | Admin;


const mapUserResponseToFrontendUser = (dto: UserResponseDTO): User => {
  const baseUser: BaseUser = {
    id: dto.id,
    email: dto.email || '', // Ensure email is a string
    phone: dto.phone,
    name: dto.name,
    role: dto.role,
    location: dto.location ? {
      lat: dto.location.lat,
      lng: dto.location.lng,
      address: dto.location.address || 'Unknown Address' // Handle null address
    } : { lat: 0, lng: 0, address: 'Unknown' }, // Provide a default if location is null
    avatar: dto.avatar || undefined,
    createdAt: new Date(dto.createdAt), // Convert ISO string to Date object
    updatedAt: new Date(dto.updatedAt), // Convert ISO string to Date object
    eWalletDetails: dto.eWalletDetails, // This is now directly mapped as it's in BaseUserResponseDTO
  };

  if (dto.role === UserRole.Seller) {
    const sellerDto = dto as Seller;
    const seller: Seller = {
      ...baseUser,
      businessName: sellerDto.businessName || '',
      isVerified: sellerDto.isVerified,
      verificationStatus: sellerDto.verificationStatus,
      credentials: sellerDto.credentials || null,
      rating: sellerDto.rating,
      reviewCount: sellerDto.reviewCount,
      totalSales: sellerDto.totalSales,
    };
    return seller;
  } else if (dto.role === UserRole.Buyer) {
    const buyerDto = dto as Buyer;
    const buyer: Buyer = {
      ...baseUser,
      purchaseHistory: buyerDto.purchaseHistory || [],
      favoriteProducts: buyerDto.favoriteProducts || [],
    };
    return buyer;
  } else if (dto.role === UserRole.Admin) {
    // Admin type directly extends BaseUser, so no extra properties to map currently
    const admin: Admin = {
      ...baseUser,
    };
    return admin;
  } else {
    // Fallback to BaseUser if role doesn't match specific types (shouldn't happen with strict enums)
    return baseUser;
  }
};


// --- API Client ---

const apiClient = {
  login: async (credentials: LoginRequestDTO): Promise<Login> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Throw a specific error message if available from backend
      throw new Error(errorData.message || 'Login failed. Please check your credentials.');
    }

    return response.json();
  },
  register: async (userData: CreateUserDTO): Promise<Login> => { // Changed return type to Login
    const response = await fetch(`${API_BASE_URL}/auth/register`, { // Changed endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData), // Sending the CreateUserDTO directly
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed. Please try again.');
    }

    // Backend returns LoginResponseDTO, which maps to frontend Login type
    const responseData = await response.json(); // Parse the full response object
    return responseData.result;
  },

  fetchUserProfile: async (token: string): Promise<UserResponseDTO> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch user profile.');
    }

    const result = await response.json();
    return result.result;
  },

  updateProfile: async (updates: UpdateProfileRequestDTO): Promise<UserResponseDTO> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found.');

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PATCH', // Correctly using PATCH for partial updates
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Throwing a specific error message from the backend is crucial for UX
      throw new Error(errorData.message || 'Failed to update profile.');
    }

    const result = await response.json();
    return result.result; // Backend returns { result: UserResponseDTO }
  },

  updateUserLocation: async (updates: LocationUpdateRequestDTO): Promise<UserResponseDTO> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found.');

    const response = await fetch(`${API_BASE_URL}/auth/location`, { // Note the /location endpoint
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update location.');
    }

    const result = await response.json();
    return result;
  },

  updateEWalletDetails: async (updates: EWalletUpdateRequestDTO): Promise<UserResponseDTO> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found.');

    const response = await fetch(`${API_BASE_URL}/auth/e-wallet`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update e-wallet details.');
    }

    const responseData = await response.json();
    return responseData.result;
  },

  submitSellerVerification: async (verificationData: SellerVerificationRequestDTO): Promise<UserResponseDTO> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found.');

    const response = await fetch(`${API_BASE_URL}/sellers/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(verificationData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit verification documents.');
    }

    const result = await response.json();
    return result.result;
  },
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authToken: string | null;
  verificationStatus: VerificationStatus | null; // Keep this here for Sellers
  login: (userData: LoginRequestDTO) => Promise<void>; // Changed 'email' to 'phone'
  register: (userData: CreateUserDTO) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: UpdateProfileRequestDTO) => Promise<void>;
  updateLocation: (location: LocationUpdateRequestDTO) => Promise<void>;
  updateEWalletDetails: (eWalletDetails: EWalletUpdateRequestDTO) => Promise<void>;
  initializeAuth: () => Promise<void>;
  submitSellerVerification: (businessName: string, documents: FileUploadResult[]) => Promise<void>;

}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  authToken: null,
  verificationStatus: null,
  login: async (userData: LoginRequestDTO) => { // Changed 'email' to 'phone'
    set({ isLoading: true });

    try {
      const loginRequest: LoginRequestDTO = userData;
      const response = await apiClient.login(loginRequest);

      const frontendUser = mapUserResponseToFrontendUser(response.user);
      localStorage.setItem('authToken', response.token); // Store the token

      set({
        user: frontendUser,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) { // Catch the error to display to the user
      set({ isLoading: false });
      console.error("Login failed:", error.message);
      // Re-throw to allow components to handle the error (e.g., display a toast)
      throw new Error(error.message || 'An unexpected error occurred during login.');
    }
  },

  register: async (userData) => {
    set({ isLoading: true });

    try {
      // Backend CreateUserDTO requires name, phone, password, role. Email is optional.
      const backendCreateUserDto: CreateUserDTO = {
        name: userData.name,
        phone: userData.phone,
        password: userData.password,
        role: userData.role,
        email: userData.email === '' ? null : userData.email,
      };

      // Call the actual backend API
      const response = await apiClient.register(backendCreateUserDto);

      // mapUserResponseToFrontendUser expects UserResponseDTO, which is response.user
      const frontendUser = mapUserResponseToFrontendUser(response.user);
      localStorage.setItem('authToken', response.token);

      set({
        user: frontendUser,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) {
      set({ isLoading: false });
      console.error("Registration failed:", error.message);
      throw new Error(error.message || 'An unexpected error occurred during registration.');
    }
  },

  logout: () => {
    localStorage.removeItem('authToken'); // <--- ADD THIS LINE
    set({
      user: null,
      isAuthenticated: false
    });
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) {
      set({ isLoading: false }); // Ensure isLoading is reset if user is null
      throw new Error('User not logged in.'); // Provide an error
    }

    set({ isLoading: true });

    try {
      // Call the actual backend API
      const updatedUserResponseDTO = await apiClient.updateProfile(updates);

      // Map the backend UserResponseDTO to frontend User type
      const frontendUser = mapUserResponseToFrontendUser(updatedUserResponseDTO);

      set({
        user: frontendUser, // Update the user in the store with the response from the backend
        isLoading: false
      });
    } catch (error: any) {
      set({ isLoading: false });
      console.error("Profile update failed:", error.message);
      throw new Error(error.message || 'An unexpected error occurred during profile update.');
    }
  },

  updateLocation: async (locationUpdates: LocationUpdateRequestDTO) => { // Update type to allow partial
    const { user } = get();
    if (!user) {
      set({ isLoading: false });
      throw new Error('User not logged in.');
    }

    set({ isLoading: true });
    try {
      const updatedUserResponseDTO = await apiClient.updateUserLocation(locationUpdates);
      const frontendUser = mapUserResponseToFrontendUser(updatedUserResponseDTO);

      set({
        user: frontendUser,
        isLoading: false
      });
    } catch (error: any) {
      set({ isLoading: false });
      console.error("Location update failed:", error.message);
      throw new Error(error.message || 'An unexpected error occurred during location update.');
    }
  },

  updateEWalletDetails: async (eWalletDetailsUpdates: EWalletUpdateRequestDTO) => {
    const { user } = get();
    // All users can have EWalletDetails

    set({ isLoading: true });

    try {
      const updatedUserResponseDTO = await apiClient.updateEWalletDetails(eWalletDetailsUpdates);
      const frontendUser = mapUserResponseToFrontendUser(updatedUserResponseDTO);

      set({
        user: frontendUser,
        isLoading: false
      });
      // Add a success toast
      // toast.success('E-wallet details updated successfully!');
    } catch (error: any) {
      set({ isLoading: false });
      console.error("Failed to update e-wallet details:", error.message);
      // Add an error toast
      // toast.error('Failed to update e-wallet details: ' + error.message);
      throw new Error(error.message || 'An unexpected error occurred during e-wallet update.');
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true }); // Start loading
    const token = localStorage.getItem('authToken'); // Get token directly from localStorage for initial check

    if (token) {
      try {
        // Fetch user profile using the token
        const userData = await apiClient.fetchUserProfile(token);
        const frontendUser = mapUserResponseToFrontendUser(userData);

        set({
          user: frontendUser,
          authToken: token,
          isAuthenticated: true,
          // FIXED: Conditionally set verificationStatus for Seller
          verificationStatus: frontendUser.role === UserRole.Seller ? (frontendUser as Seller).verificationStatus : null,
          isLoading: false
        });
      } catch (error) {
        console.error('Error during auth initialization:', error);
        // Token invalid or expired, clear local storage and state
        get().logout(); // Use get().logout() to ensure full logout logic runs
        set({ isLoading: false });
      }
    } else {
      // No token found, user is not authenticated
      set({ user: null, authToken: null, isAuthenticated: false, verificationStatus: null, isLoading: false });
    }
  },

  submitSellerVerification: async (businessName: string, documents: FileUploadResult[]) => {
    set({ isLoading: true });
    const { user } = get();
    if (!user || user.role !== UserRole.Seller) {
      set({ isLoading: false });
      throw new Error('User is not a seller or not logged in.');
    }

    try {
      const documentUrls = documents.map(doc => doc.url);
      const verificationData: SellerVerificationRequestDTO = {
        businessName,
        credentials: { documents: documentUrls },
        verificationStatus: VerificationStatus.Pending, // Add the required property
      };

      const updatedUserResponseDTO = await apiClient.submitSellerVerification(verificationData);
      const frontendUser = mapUserResponseToFrontendUser(updatedUserResponseDTO);

      set({
        user: frontendUser,
        verificationStatus: (frontendUser as Seller).verificationStatus,
        isLoading: false
      });

      if ((frontendUser as Seller).verificationStatus === VerificationStatus.Pending) {
        toast.success('Verification documents and profile submitted successfully!');
      }

    } catch (error: any) {
      set({ isLoading: false });
      console.error("Seller verification submission failed:", error.message);
      throw new Error(error.message || 'Failed to submit documents. Please try again.');
    }
  }
}));