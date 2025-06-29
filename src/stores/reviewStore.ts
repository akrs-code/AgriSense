import { create } from 'zustand';

export interface Review {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  buyerId: string;
  sellerId: string;
  sellerName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

interface ReviewState {
  reviews: Review[];
  isLoading: boolean;
  submitReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
  getReviewsByProduct: (productId: string) => Review[];
  getReviewsBySeller: (sellerId: string) => Review[];
  getReviewByOrder: (orderId: string) => Review | undefined;
  hasReviewed: (orderId: string) => boolean;
}

const mockReviews: Review[] = [
  {
    id: 'rev-1',
    orderId: 'ORD-003',
    productId: '1',
    productName: 'Premium Rice',
    buyerId: 'buyer-1',
    sellerId: 'seller-1',
    sellerName: 'Juan Dela Cruz Farm',
    rating: 5,
    comment: 'Excellent quality rice! Very fresh and delivered on time.',
    createdAt: new Date('2024-01-16')
  }
];

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: mockReviews,
  isLoading: false,

  submitReview: async (reviewData) => {
    set({ isLoading: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newReview: Review = {
        ...reviewData,
        id: `rev-${Date.now()}`,
        createdAt: new Date()
      };
      
      set(state => ({
        reviews: [...state.reviews, newReview],
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  getReviewsByProduct: (productId: string) => {
    const { reviews } = get();
    return reviews.filter(review => review.productId === productId);
  },

  getReviewsBySeller: (sellerId: string) => {
    const { reviews } = get();
    return reviews.filter(review => review.sellerId === sellerId);
  },

  getReviewByOrder: (orderId: string) => {
    const { reviews } = get();
    return reviews.find(review => review.orderId === orderId);
  },

  hasReviewed: (orderId: string) => {
    const { reviews } = get();
    return reviews.some(review => review.orderId === orderId);
  }
}));