import { OrderStatus, PaymentMethod } from '../types/enums';
import { Location } from '../types/location';




// DTO for a single item when placing an order (adjusted to match frontend's PlaceOrderDTO item)
export interface PlaceOrderItemDTO {
    product_id: string;
    quantity: number;
}

// DTO for placing a new order (from the buyer's perspective, for their entire cart)
export interface PlaceOrderRequestDTO {
    items: PlaceOrderItemDTO[];
    payment_method: PaymentMethod;
    delivery_location: Location | null
}

// DTO for updating the status of an existing order
export interface UpdateOrderStatusRequestDTO {
    status: OrderStatus;
}

// DTO for fetching orders (e.g., filters, pagination)
export interface GetOrdersQueryDTO {
    buyer_id?: string;
    seller_id?: string;
    status?: OrderStatus;
    page?: number;
    limit?: number;
}

// --- Response DTOs ---


export interface OrderItem { // Define this to match Backend's OrderItemEntity
    id: string; // If the frontend needs an ID for each item
    product_id: string;
    product_name: string;
    product_image: string;
    quantity: number;
    unit: string;
    price_per_unit: number;
    subtotal: number;
}


export interface OrderResponseDTO {
    id: string;
    buyer_id: string;
    seller_id: string;
    seller_name: string;
    order_items: OrderItem[]; // <-- Change to array of items
    total_price: number;
    status: OrderStatus;
    payment_method: PaymentMethod;
    order_date: Date; // <-- Change to Date
    estimated_delivery_date?: Date | null; // <-- Change to Date | null, standardize name
    delivery_location: Location | null;
    tracking_number?: string | null;
    can_reorder: boolean;
    can_review: boolean;
    created_at: Date; // <-- Add these if frontend needs them
    updated_at: Date; // <-- Add these if frontend needs them
}

export interface GetOrdersResponseDTO {
    orders: OrderResponseDTO[];
    total_count?: number;
    page?: number;
    limit?: number;
}