import { create } from 'zustand';
import { VerificationApplication, User } from '../types';

interface AdminState {
  applications: VerificationApplication[];
  users: User[];
  isLoading: boolean;
  fetchApplications: () => Promise<void>;
  approveApplication: (applicationId: string, notes?: string) => Promise<void>;
  rejectApplication: (applicationId: string, notes: string) => Promise<void>;
  fetchUsers: () => Promise<void>;
  suspendUser: (userId: string) => Promise<void>;
}

const mockApplications: VerificationApplication[] = [
  {
    id: 'app-1',
    sellerId: 'seller-pending-1',
    documents: {
      governmentId: 'https://example.com/gov-id.jpg',
      businessLicense: 'https://example.com/business-license.pdf',
      farmCertificate: 'https://example.com/farm-cert.pdf',
      additionalDocs: ['https://example.com/additional-1.jpg']
    },
    status: 'pending',
    submittedAt: new Date('2024-01-15'),
  },
  {
    id: 'app-2',
    sellerId: 'seller-pending-2',
    documents: {
      governmentId: 'https://example.com/gov-id-2.jpg',
      additionalDocs: []
    },
    status: 'pending',
    submittedAt: new Date('2024-01-18'),
  }
];

export const useAdminStore = create<AdminState>((set, get) => ({
  applications: mockApplications,
  users: [],
  isLoading: false,

  fetchApplications: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isLoading: false });
  },

  approveApplication: async (applicationId, notes) => {
    set({ isLoading: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        applications: state.applications.map(app =>
          app.id === applicationId
            ? {
                ...app,
                status: 'approved' as const,
                reviewNotes: notes,
                reviewedAt: new Date(),
                reviewedBy: 'admin-1'
              }
            : app
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  rejectApplication: async (applicationId, notes) => {
    set({ isLoading: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        applications: state.applications.map(app =>
          app.id === applicationId
            ? {
                ...app,
                status: 'rejected' as const,
                reviewNotes: notes,
                reviewedAt: new Date(),
                reviewedBy: 'admin-1'
              }
            : app
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isLoading: false });
  },

  suspendUser: async (userId) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isLoading: false });
  }
}));