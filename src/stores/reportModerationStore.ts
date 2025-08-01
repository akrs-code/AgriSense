import { create } from 'zustand';
import toast from 'react-hot-toast';
import {
  Report,
  ReportResponseDTO,
  ListReportsResponseDTO,
  UpdateReportRequestDTO,
  CreateReportDTO,
} from '../types/report.types'; // Adjust path as needed
import { ReportTargetType, ReportType, ReportStatus, ReportPriority } from '../types/enums';

// --- Helper for mapping Backend DTO to Frontend Report ---
const mapReportResponseToFrontendReport = (dto: ReportResponseDTO): Report => {
  return {
    id: dto.id,
    reporterName: dto.reporterName,
    reporterId: dto.reporterId,
    targetType: dto.targetType as ReportTargetType, // Cast to enum
    targetName: dto.targetName,
    targetId: dto.targetId,
    reportType: dto.reportType as ReportType, // Cast to enum
    description: dto.description,
    reportDate: new Date(dto.reportDate), // Convert ISO string to Date object
    status: dto.status as ReportStatus, // Cast to enum
    priority: dto.priority as ReportPriority, // Cast to enum
    adminNotes: dto.adminNotes,
    actionTaken: dto.actionTaken,
    createdAt: new Date(dto.createdAt), // Add this
    updatedAt: new Date(dto.updatedAt),
  };
};

// --- API Client ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = {
  getReports: async (status?: ReportStatus): Promise<ListReportsResponseDTO> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found.');

    const url = status ? `${API_BASE_URL}/admin/reports?status=${status}` : `${API_BASE_URL}/admin/reports`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch reports.');
    }

    return response.json();
  },

  updateReportStatus: async (reportId: string, updates: UpdateReportRequestDTO): Promise<ReportResponseDTO> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found.');

    const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}`, {
      method: 'PATCH', // Use PATCH for partial updates
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update report.');
    }

    return response.json();
  },

  createReport: async (reportData: CreateReportDTO): Promise<ReportResponseDTO> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found.');

    const response = await fetch(`${API_BASE_URL}/reports`, { // Note: This uses /reports, not /admin/reports
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create report.');
    }

    return response.json();
  },
};

interface ReportModerationState {
  reports: Report[];
  isLoading: boolean;
  error: string | null; // Added to store potential errors
  createReport: (reportData: CreateReportDTO) => Promise<Report>;
  fetchReports: (status?: ReportStatus) => Promise<void>;
  warnUser: (reportId: string, notes?: string) => Promise<void>;
  suspendUser: (reportId: string, notes?: string) => Promise<void>;
  dismissReport: (reportId: string, notes?: string) => Promise<void>;
  getReportsByStatus: (status: ReportStatus) => Report[];

}

export const useReportModerationStore = create<ReportModerationState>((set, get) => ({
  reports: [], // Initialize with an empty array, data will be fetched from backend
  isLoading: false,
  error: null,

  createReport: async (reportData: CreateReportDTO): Promise<Report> => {
    set({ isLoading: true, error: null });
    try {
      const newReportDTO = await apiClient.createReport(reportData);
      const newFrontendReport = mapReportResponseToFrontendReport(newReportDTO);

      // Option 1: Add the new report to the existing list immediately (if desired for UI)
      // set(state => ({
      //     reports: [newFrontendReport, ...state.reports], // Add to the beginning
      //     isLoading: false,
      // }));

      toast.success('Report submitted successfully!');
      return newFrontendReport; // Return the created report
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      toast.error('Failed to submit report: ' + error.message);
      throw error; // Re-throw to allow component to catch if needed
    } finally {
      set({ isLoading: false }); // Ensure isLoading is reset even if toast is successful
    }
  },

  fetchReports: async (status?: ReportStatus) => {
    set({ isLoading: true, error: null });
    try {
      const reportsDTO = await apiClient.getReports(status);
      const frontendReports = reportsDTO.map(mapReportResponseToFrontendReport);
      set({ reports: frontendReports, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      toast.error(error.message || 'Failed to fetch reports.');
    }
  },

  warnUser: async (reportId: string, notes?: string) => {
    set({ isLoading: true, error: null });
    try {
      const updates: UpdateReportRequestDTO = {
        status: ReportStatus.Resolved,
        actionTaken: 'User warned',
        adminNotes: notes || 'Warning issued to user',
      };
      const updatedReportDTO = await apiClient.updateReportStatus(reportId, updates);
      const updatedFrontendReport = mapReportResponseToFrontendReport(updatedReportDTO);

      set(state => ({
        reports: state.reports.map(report =>
          report.id === reportId ? updatedFrontendReport : report
        ),
        isLoading: false,
      }));

      toast.success('⚠️ User warned');
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      toast.error('Failed to warn user: ' + error.message);
      throw error;
    }
  },

  suspendUser: async (reportId: string, notes?: string) => {
    set({ isLoading: true, error: null });
    try {
      const updates: UpdateReportRequestDTO = {
        status: ReportStatus.Resolved,
        actionTaken: 'User suspended',
        adminNotes: notes || 'User account suspended',
      };
      const updatedReportDTO = await apiClient.updateReportStatus(reportId, updates);
      const updatedFrontendReport = mapReportResponseToFrontendReport(updatedReportDTO);

      set(state => ({
        reports: state.reports.map(report =>
          report.id === reportId ? updatedFrontendReport : report
        ),
        isLoading: false,
      }));

      toast.success('❌ User suspended');
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      toast.error('Failed to suspend user: ' + error.message);
      throw error;
    }
  },

  dismissReport: async (reportId: string, notes?: string) => {
    set({ isLoading: true, error: null });
    try {
      const updates: UpdateReportRequestDTO = {
        status: ReportStatus.Dismissed,
        actionTaken: 'Report dismissed',
        adminNotes: notes || 'Report dismissed - no action required',
      };
      const updatedReportDTO = await apiClient.updateReportStatus(reportId, updates);
      const updatedFrontendReport = mapReportResponseToFrontendReport(updatedReportDTO);

      set(state => ({
        reports: state.reports.map(report =>
          report.id === reportId ? updatedFrontendReport : report
        ),
        isLoading: false,
      }));

      toast.success('✅ Report dismissed');
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      toast.error('Failed to dismiss report: ' + error.message);
      throw error;
    }
  },

  getReportsByStatus: (status: ReportStatus) => {
    const { reports } = get();
    return reports.filter(report => report.status === status);
  },
}));