import { create } from 'zustand';
import { BackendReviewsResponse, Review, SubmitReviewDTO } from '../types/review.types';

const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const reviewApiClient = {
  submitReview: async (reviewData: SubmitReviewDTO): Promise<Review> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to submit review.' }));
      throw new Error(errorData.message || 'Failed to submit review.');
    }
    return response.json();
  },

  fetchReviews: async (params?: { productId?: string; sellerId?: string; orderId?: string }): Promise<BackendReviewsResponse> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    let url = `${API_BASE_URL}/reviews`;
    const queryParams = new URLSearchParams();

    if (params?.productId) {
      queryParams.append('productId', params.productId);
    }
    if (params?.sellerId) {
      queryParams.append('sellerId', params.sellerId);
    }
    if (params?.orderId) {
      queryParams.append('orderId', params.orderId);
    }

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch reviews.' }));
      throw new Error(errorData.message || 'Failed to fetch reviews.');
    }
    return response.json();
  },
};

interface ReviewState {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  submitReview: (review: SubmitReviewDTO) => Promise<void>;
  fetchReviewsByProduct: (productId: string) => Promise<void>;
  fetchReviewsBySeller: (sellerId: string) => Promise<void>;
  fetchReviewByOrder: (orderId: string) => Promise<void>; // Changed to async fetch
  getReviewsByProduct: (productId: string) => Review[]; // Keep for cached access
  getReviewsBySeller: (sellerId: string) => Review[]; // Keep for cached access
  getReviewByOrder: (orderId: string) => Review | undefined; // Keep for cached access
  hasReviewed: (orderId: string) => boolean;
  setError: (message: string | null) => void;
}



export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [], // Initialize as empty, data will be fetched from backend
  isLoading: false,
  error: null,

  submitReview: async (reviewData) => {
    set({ isLoading: true, error: null });
    try {
      const newReview = await reviewApiClient.submitReview(reviewData);

      set(state => ({
        reviews: [...state.reviews, newReview],
        isLoading: false
      }));
      console.log('Review submitted successfully:', newReview);
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      console.error('Error submitting review:', error.message);
      throw error;
    }
  },

  fetchReviewsByProduct: async (productId: string) => {
    set({ isLoading: true, error: null });
    try {
      const backendResponse = await reviewApiClient.fetchReviews({ productId });
      set({
        reviews: backendResponse.reviews, // Overwrite or merge? For product/seller, overwriting might be simpler
        isLoading: false
      });
      console.log(`Reviews for product ${productId} fetched successfully:`, backendResponse.reviews);
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      console.error('Error fetching reviews by product:', error.message);
      throw error;
    }
  },

  fetchReviewsBySeller: async (sellerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const backendResponse = await reviewApiClient.fetchReviews({ sellerId });
      set({
        reviews: backendResponse.reviews,
        isLoading: false
      });
      console.log(`Reviews for seller ${sellerId} fetched successfully:`, backendResponse.reviews);
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      console.error('Error fetching reviews by seller:', error.message);
      throw error;
    }
  },

  fetchReviewByOrder: async (orderId: string) => {
    set({ isLoading: true, error: null });
    try {
      const backendResponse = await reviewApiClient.fetchReviews({ orderId });
      // Assuming fetching by orderId returns at most one review
      if (backendResponse.reviews.length > 0) {
        set(state => {
          const existingReviewIndex = state.reviews.findIndex(r => r.id === backendResponse.reviews[0].id);
          if (existingReviewIndex > -1) {
            // Update existing review if it's already in the store
            const updatedReviews = [...state.reviews];
            updatedReviews[existingReviewIndex] = backendResponse.reviews[0];
            return { reviews: updatedReviews, isLoading: false };
          } else {
            // Add new review
            return { reviews: [...state.reviews, backendResponse.reviews[0]], isLoading: false };
          }
        });
        console.log(`Review for order ${orderId} fetched successfully:`, backendResponse.reviews[0]);
      } else {
        set({ isLoading: false });
        console.log(`No review found for order ${orderId}.`);
      }
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      console.error('Error fetching review by order:', error.message);
      throw error;
    }
  },

  // These getters now primarily serve to access already loaded/cached data in the store
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
  },

  setError: (message: string | null) => {
    set({ error: message });
  }
}));