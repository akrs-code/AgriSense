export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: 'buyer' | 'seller' | 'admin';
  isVerified: boolean;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
}

export interface Seller extends User {
  role: 'seller';
  businessName: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  credentials?: {
    documents: string[];
    businessLicense?: string;
    farmCertificate?: string;
    governmentId: string;
  };
  rating: number;
  reviewCount: number;
  totalSales: number;
  eWalletDetails?: {
    provider: string; // e.g., 'GCash', 'PayMaya', 'PayPal'
    accountNumber: string;
    accountName: string;
    qrCodeImage?: string;
  };
}

export interface Buyer extends User {
  role: 'buyer';
  purchaseHistory: string[];
  favoriteProducts: string[];
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  category: string;
  variety: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  images: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  harvestDate: Date;
  condition: 'fresh' | 'good' | 'fair';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'location';
  isRead: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participants: string[];
  productId?: string;
  lastMessage?: Message;
  updatedAt: Date;
}

export interface MarketPrice {
  id: string;
  productName: string;
  category: string;
  region: string;
  averagePrice: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

export interface Transaction {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentMethod: 'e-wallet' | 'cod';
  deliveryAddress: string;
  createdAt: Date;
}

export interface VerificationApplication {
  id: string;
  sellerId: string;
  documents: {
    businessLicense?: string;
    farmCertificate?: string;
    governmentId: string;
    additionalDocs: string[];
  };
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNotes?: string;
  submittedAt: Date;
  reviewedAt?: Date;
}