import { VerificationStatus } from '../types/enums';

export interface GetFarmerProfilesFilterDTO {
    status?: VerificationStatus;
}

// DTO for approving a farmer
export interface ApproveFarmerDTO {
}

// DTO for rejecting a farmer
export interface RejectFarmerDTO {
    reason?: string; // Reason for rejection
}
