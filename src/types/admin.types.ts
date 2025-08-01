import { VerificationStatus, UserRole } from '../types/enums';
import { User } from '../types/user/user.types'; // Assuming User type is now properly exported from user.types.ts

// Represents the documents provided for verification
export interface VerificationDocuments {
    governmentId: string;
    businessLicense?: string; // Optional for some sellers
    farmCertificate?: string; // Optional for some sellers
    additionalDocs?: string[]; // Array of URLs for other documents
}

// Represents a single verification application
export interface VerificationApplication {
    id: string;
    sellerId: string;
    documents: VerificationDocuments;
    status: VerificationStatus; // 'pending' | 'approved' | 'rejected'
    submittedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: string; // ID of the admin who reviewed it
    reviewNotes?: string;
}

// Represents a user from the admin's perspective,
// potentially with more details than a standard 'User' if needed for admin views.
// For now, it can just be the existing User type.
export type AdminUserView = User;

export interface ApproveApplicationRequestDTO {
    notes?: string;
}

// Request DTO for rejecting a verification application
export interface RejectApplicationRequestDTO {
    notes: string; // Notes are typically required for rejection
}

export interface SuspendUserRequestDTO {
    reason: string;
}

export interface GetApplicationsResponseDTO {
    applications: VerificationApplication[];
    totalCount: number; // For pagination
}

// Response DTO for fetching a list of users (for admin view)
export interface GetUsersResponseDTO {
    users: User[];
    totalCount: number; // For pagination
}

// Response DTO for a single verification application after approval/rejection
export type SingleApplicationResponseDTO = VerificationApplication;

// Response DTO for a single user after suspension/update
export type SingleUserResponseDTO = User;
