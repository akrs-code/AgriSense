import { create } from 'zustand';
import {
  VerificationApplication,
  AdminUserView, // Use the User type from your combined types
  ApproveApplicationRequestDTO,
  RejectApplicationRequestDTO,
  SuspendUserRequestDTO,
  GetApplicationsResponseDTO,
  GetUsersResponseDTO,
  SingleApplicationResponseDTO,
  SingleUserResponseDTO,
} from '../types/admin.types'; // Import from the central index.ts
import { UserRole } from '../types/enums';
// --- API Client for Admin Operations ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthToken = (): string => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication token not found. Please log in.');
  }
  return token;
};

const adminApiClient = {
  fetchApplications: async (): Promise<GetApplicationsResponseDTO> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/applications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch applications.');
    }
    const data = await response.json();
    // Assuming backend returns { applications: [...], totalCount: X }
    // Convert date strings to Date objects if necessary
    data.applications = data.applications.map((app: any) => ({
      ...app,
      submittedAt: new Date(app.submittedAt),
      reviewedAt: app.reviewedAt ? new Date(app.reviewedAt) : undefined,
    }));
    return data;
  },

  approveApplication: async (applicationId: string, notes?: string): Promise<SingleApplicationResponseDTO> => {
    const token = getAuthToken();
    const requestBody: ApproveApplicationRequestDTO = { notes };
    const response = await fetch(`${API_BASE_URL}/admin/applications/${applicationId}/approve`, {
      method: 'PATCH', // Or PUT, depending on your API design
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to approve application.');
    }
    const data = await response.json();
    // Convert date strings to Date objects
    data.submittedAt = new Date(data.submittedAt);
    data.reviewedAt = data.reviewedAt ? new Date(data.reviewedAt) : undefined;
    return data;
  },

  rejectApplication: async (applicationId: string, notes: string): Promise<SingleApplicationResponseDTO> => {
    const token = getAuthToken();
    const requestBody: RejectApplicationRequestDTO = { notes };
    const response = await fetch(`${API_BASE_URL}/admin/applications/${applicationId}/reject`, {
      method: 'PATCH', // Or PUT
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to reject application.');
    }
    const data = await response.json();
    // Convert date strings to Date objects
    data.submittedAt = new Date(data.submittedAt);
    data.reviewedAt = data.reviewedAt ? new Date(data.reviewedAt) : undefined;
    return data;
  },

  fetchUsers: async (): Promise<GetUsersResponseDTO> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch users.');
    }
    const data = await response.json();
    // Assuming backend returns { users: [...], totalCount: X }
    // Convert date strings to Date objects and handle potential nulls/undefined for location/ewallet
    data.users = data.users.map((u: any) => ({
      ...u,
      createdAt: new Date(u.createdAt),
      updatedAt: new Date(u.updatedAt),
      location: u.location ? { ...u.location } : { lat: 0, lng: 0, address: 'Unknown' }, // Default location
      eWalletDetails: u.eWalletDetails || null, // Ensure it's null if not provided
      // Special handling for Seller properties if they exist
      ...(u.role === UserRole.Seller && {
        credentials: u.credentials || null
      })
    }));
    return data;
  },

  suspendUser: async (userId: string, reason: string): Promise<SingleUserResponseDTO> => {
    const token = getAuthToken();
    const requestBody: SuspendUserRequestDTO = { reason };
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/suspend`, {
      method: 'PATCH', // Or POST if suspension is a distinct action
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to suspend user.');
    }
    const data = await response.json();
    // Convert date strings to Date objects and handle potential nulls/undefined for location/ewallet
    data.createdAt = new Date(data.createdAt);
    data.updatedAt = new Date(data.updatedAt);
    data.location = data.location ? { ...data.location } : { lat: 0, lng: 0, address: 'Unknown' };
    data.eWalletDetails = data.eWalletDetails || null;
    return data;
  },
};

interface AdminState {
  applications: VerificationApplication[];
  users: AdminUserView[]; // Use the imported User type
  isLoading: boolean;
  error: string | null; // Added for error handling

  fetchApplications: () => Promise<void>;
  approveApplication: (applicationId: string, notes?: string) => Promise<void>;
  rejectApplication: (applicationId: string, notes: string) => Promise<void>;
  fetchUsers: () => Promise<void>;
  suspendUser: (userId: string, reason: string) => Promise<void>;
  clearError: () => void; // Added to clear errors
}

export const useAdminStore = create<AdminState>((set, get) => ({
  applications: [], // Start with an empty array
  users: [],       // Start with an empty array
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminApiClient.fetchApplications();
      set({ applications: response.applications, isLoading: false });
    } catch (error: any) {
      console.error("Failed to fetch applications:", error);
      set({ isLoading: false, error: error.message || 'Error fetching applications.' });
    }
  },

  approveApplication: async (applicationId, notes) => {
    set({ isLoading: true, error: null });
    try {
      const updatedApplication = await adminApiClient.approveApplication(applicationId, notes);
      set(state => ({
        applications: state.applications.map(app =>
          app.id === applicationId ? updatedApplication : app
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error("Failed to approve application:", error);
      set({ isLoading: false, error: error.message || 'Error approving application.' });
      throw error; // Re-throw to allow component to handle
    }
  },

  rejectApplication: async (applicationId, notes) => {
    set({ isLoading: true, error: null });
    try {
      const updatedApplication = await adminApiClient.rejectApplication(applicationId, notes);
      set(state => ({
        applications: state.applications.map(app =>
          app.id === applicationId ? updatedApplication : app
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error("Failed to reject application:", error);
      set({ isLoading: false, error: error.message || 'Error rejecting application.' });
      throw error; // Re-throw to allow component to handle
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminApiClient.fetchUsers();
      set({ users: response.users, isLoading: false });
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
      set({ isLoading: false, error: error.message || 'Error fetching users.' });
    }
  },

  suspendUser: async (userId, reason) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await adminApiClient.suspendUser(userId, reason);
      set(state => ({
        users: state.users.map(user =>
          user.id === userId ? updatedUser : user
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error("Failed to suspend user:", error);
      set({ isLoading: false, error: error.message || 'Error suspending user.' });
      throw error; // Re-throw to allow component to handle
    }
  }
}));