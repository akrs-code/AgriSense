import { Location } from './location';
import { CropListingStatus } from './enums';


export interface CropListing {
    id: string;
    crop_name: string;
    variety: string | null;
    farmer_name: string;
    farmer_id: string;
    price: number;
    unit: string;
    quantity: number;
    submission_date: string; // ISO 8601 string for dates from backend
    status: CropListingStatus;
    images: string[];
    description: string | null;
    location: Location | null;
    is_suspicious: boolean;
    flag_reason: string | null;
    created_at: string;
    updated_at: string;
}

// DTO for creating a new crop listing (if your system allows frontend to create them directly)
export interface CreateCropListingDTO {
    crop_name: string;
    variety?: string;
    farmer_id: string;
    price: number;
    unit: string;
    quantity: number;
    images?: string[];
    description?: string;
    location?: Location;
}

export interface UpdateCropListingDTO {
    crop_name?: string;
    variety?: string | null;
    price?: number;
    unit?: string;
    quantity?: number;
    images?: string[] | null;
    description?: string | null;
    location?: Location | null;
    is_active?: boolean;
}


// DTO for approving a crop listing
export interface ApproveCropDTO {
}

// DTO for rejecting a crop listing
export interface RejectCropDTO {
    reason?: string;
}

export interface FlagCropDTO {
    reason: string;
}

// DTO for fetching crop listings (e.g., with filters)
export interface GetCropListingsFilterDTO {
    status?: CropListingStatus;
    farmerId?: string;
}