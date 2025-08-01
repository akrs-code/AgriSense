import { Location } from "./location";
export enum UserRole {
  Buyer = 'buyer',
  Seller = 'seller',
  Admin = 'admin',
}

export enum VerificationStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export enum ProductCondition {
  Fresh = 'fresh',
  Good = 'good',
  Fair = 'fair'
}

export enum MarketTrend {
  Up = 'up',
  Down = 'down',
  Stable = 'stable',
  NA = 'N/A'
}

export enum OrderStatus {
  Pending = 'pending',
  Processing = 'processing',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Cancelled = 'cancelled'
}

export enum PaymentMethod {
  EWallet = 'e-wallet',
  COD = 'cod'
}

export enum CropListingStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Flagged = 'flagged',
}

export enum ReportTargetType {
  Farmer = 'farmer',
  Crop = 'crop',
  Message = 'message',
}

export enum ReportType {
  Abuse = 'abuse',
  Scam = 'scam',
  Inappropriate = 'inappropriate',
  Fake = 'fake',
  Other = 'other',
}

export enum ReportStatus {
  Pending = 'pending',
  Investigating = 'investigating',
  Resolved = 'resolved',
  Dismissed = 'dismissed',
}

export enum ReportPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export enum MessageType {
  Text = 'text',
  Image = 'image',
  Location = 'location'
}