export interface EWalletDetails {
  provider: string;
  accountNumber: string;
  accountName: string;
  qrCodeImage?: string | null; // Allow setting to null to remove image
}

export interface EWalletUpdateRequestDTO {
  provider?: string;
  accountNumber?: string;
  accountName?: string;
  qrCodeImage?: string | null;
}