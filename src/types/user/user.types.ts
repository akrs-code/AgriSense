import { UserRole } from "../enums";
import { VerificationStatus } from "../enums";
import { EWalletDetails } from "../ewallet.type";
import { Location } from "../location";

export interface BaseUser { // <-- Jairus: changed user to BaseUser
  id: string;
  email: string | null;
  phone: string;
  name: string;
  role: UserRole
  // isVerified: boolean; <-- Jairus: Removed as this is seller specific
  location: Location;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  // verificationStatus?: 'pending' | 'approved' | 'rejected'; <-- Jairus: Removed as this is seller specific
  eWalletDetails: EWalletDetails | null;
}

export interface Seller extends BaseUser {
  businessName: string;
  isVerified: boolean; // <-- Jairus: added as this is seller specific
  verificationStatus: VerificationStatus;
  credentials: {
    documents: string[];
    businessLicense?: string;
    farmCertificate?: string;
    governmentId: string;
  } | null;
  rating: number | null;
  reviewCount: number;
  totalSales: number;
}

export interface Buyer extends BaseUser {
  purchaseHistory: string[];
  favoriteProducts: string[];
}

export interface Admin extends BaseUser {
}

export type User = BaseUser | Seller | Buyer | Admin;

export interface Login {
  user: User;
  token: string;
}