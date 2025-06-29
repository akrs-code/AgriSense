import { create } from 'zustand';

export interface Review {
  id: string;
  orderId: string;
  productId: string;
  sellerId: string;
  buyerId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

interface ReviewState {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
  getReviewsByProduct: (productId: string) => Review[];
  getReviewsBySeller: (sellerId: string) => Review[];
  hasUserReviewedOrder: (orderId: string, buyerId: string) => boolean;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],

  addReview: async (reviewData) => {
    const newReview: Review = {
      ...reviewData,
      id: Date.now().toString(),
      createdAt: new Date()
    };

    set(state => ({
      reviews: [...state.reviews, newReview]
    }));
  },

  getReviewsByProduct: (productId) => {
    return get().reviews.filter(review => review.productId === productId);
  },

  getReviewsBySeller: (sellerId) => {
    return get().reviews.filter(review => review.sellerId === sellerId);
  },

  hasUserReviewedOrder: (orderId, buyerId) => {
    return get().reviews.some(review => review.orderId === orderId && review.buyerId === buyerId);
  }
}));