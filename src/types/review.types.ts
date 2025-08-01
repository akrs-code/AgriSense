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
    createdAt: string; // Changed to string for ISO date from backend
}

export interface SubmitReviewDTO {
    orderId: string;
    productId: string;
    productName: string;
    buyerId: string;
    sellerId: string;
    sellerName: string;
    rating: number;
    comment: string;
}

export interface BackendReviewsResponse {
    reviews: Review[];
}

