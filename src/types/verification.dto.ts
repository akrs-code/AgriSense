import { VerificationStatus } from './enums';

export interface SellerVerificationRequestDTO {
  businessName: string;
  credentials: {
    documents: string[]; // URLs of the uploaded documents
  };
  verificationStatus: VerificationStatus.Pending;
}