import { create } from 'zustand';
import toast from 'react-hot-toast';

export interface Report {
  id: string;
  reporterName: string;
  reporterId: string;
  targetType: 'farmer' | 'crop' | 'message';
  targetName: string;
  targetId: string;
  reportType: 'abuse' | 'scam' | 'inappropriate' | 'fake' | 'other';
  description: string;
  reportDate: Date;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high';
  adminNotes?: string;
  actionTaken?: string;
}

interface ReportModerationState {
  reports: Report[];
  isLoading: boolean;
  warnUser: (reportId: string, notes?: string) => Promise<void>;
  suspendUser: (reportId: string, notes?: string) => Promise<void>;
  dismissReport: (reportId: string, notes?: string) => Promise<void>;
  getReportsByStatus: (status: Report['status']) => Report[];
}

const mockReports: Report[] = [
  {
    id: 'RPT-001',
    reporterName: 'Maria Santos',
    reporterId: 'buyer-1',
    targetType: 'farmer',
    targetName: 'Suspicious Farm Co.',
    targetId: 'farmer-suspicious-1',
    reportType: 'scam',
    description: 'This farmer took payment but never delivered the rice. Phone number is disconnected.',
    reportDate: new Date('2024-01-20'),
    status: 'pending',
    priority: 'high'
  },
  {
    id: 'RPT-002',
    reporterName: 'Juan Dela Cruz',
    reporterId: 'buyer-2',
    targetType: 'crop',
    targetName: 'Premium Rice Listing',
    targetId: 'crop-fake-1',
    reportType: 'fake',
    description: 'The photos used in this listing are stock photos from the internet, not actual farm photos.',
    reportDate: new Date('2024-01-18'),
    status: 'investigating',
    priority: 'medium'
  },
  {
    id: 'RPT-003',
    reporterName: 'Ana Rodriguez',
    reporterId: 'buyer-3',
    targetType: 'message',
    targetName: 'Inappropriate Message',
    targetId: 'msg-inappropriate-1',
    reportType: 'inappropriate',
    description: 'Farmer sent inappropriate messages and used offensive language.',
    reportDate: new Date('2024-01-15'),
    status: 'resolved',
    priority: 'medium',
    adminNotes: 'Reviewed conversation logs. Warning issued to farmer.',
    actionTaken: 'Warning issued to farmer account'
  }
];

export const useReportModerationStore = create<ReportModerationState>((set, get) => ({
  reports: mockReports,
  isLoading: false,

  warnUser: async (reportId: string, notes?: string) => {
    set({ isLoading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        reports: state.reports.map(report =>
          report.id === reportId
            ? { 
                ...report, 
                status: 'resolved' as const, 
                actionTaken: 'User warned',
                adminNotes: notes || 'Warning issued to user'
              }
            : report
        ),
        isLoading: false
      }));
      
      toast.success('⚠️ User warned');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to warn user');
      throw error;
    }
  },

  suspendUser: async (reportId: string, notes?: string) => {
    set({ isLoading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        reports: state.reports.map(report =>
          report.id === reportId
            ? { 
                ...report, 
                status: 'resolved' as const, 
                actionTaken: 'User suspended',
                adminNotes: notes || 'User account suspended'
              }
            : report
        ),
        isLoading: false
      }));
      
      toast.success('❌ User suspended');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to suspend user');
      throw error;
    }
  },

  dismissReport: async (reportId: string, notes?: string) => {
    set({ isLoading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        reports: state.reports.map(report =>
          report.id === reportId
            ? { 
                ...report, 
                status: 'dismissed' as const, 
                actionTaken: 'Report dismissed',
                adminNotes: notes || 'Report dismissed - no action required'
              }
            : report
        ),
        isLoading: false
      }));
      
      toast.success('✅ Report dismissed');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to dismiss report');
      throw error;
    }
  },

  getReportsByStatus: (status: Report['status']) => {
    const { reports } = get();
    return reports.filter(report => report.status === status);
  }
}));