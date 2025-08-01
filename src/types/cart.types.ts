import { Product } from "./product.types";
export interface CartItem {
    id: string;
    productId: string;
    quantity: number;
}

export interface BackendCartResponse {
    items: CartItem[];
    totalItems: number;
    totalAmount: number;
}