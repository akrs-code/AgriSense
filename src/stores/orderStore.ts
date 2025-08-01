import { create } from 'zustand';
import { produce } from 'immer';

// Import all necessary types from the files you provided
import { OrderStatus, PaymentMethod } from '../types/enums';
import { Location } from '../types/location';
import {
  PlaceOrderRequestDTO,
  UpdateOrderStatusRequestDTO,
  OrderItem,
  OrderResponseDTO,
  GetOrdersResponseDTO
} from '../types/order.types';
import { PanelTopDashed } from 'lucide-react';



// State for the Zustand store
interface OrderState {
  orders: OrderResponseDTO[];
  isLoading: boolean;
  error: string | null;
}

// Actions for the Zustand store
interface OrderActions {
  fetchOrders: (
    buyer_id?: string,
    seller_id?: string,
    status?: OrderStatus
  ) => Promise<void>;
  // Corrected the return type to be a Promise that resolves to an array
  placeOrder: (placeOrderDTO: PlaceOrderRequestDTO) => Promise<OrderResponseDTO[]>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  getOrdersByBuyer: (buyerId: string) => OrderResponseDTO[];
  getOrdersBySeller: (sellerId: string) => OrderResponseDTO[];
}

const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// orderApiClient is a centralized object for all API calls related to orders
const orderApiClient = {
  /**
   * Fetches orders from the backend with optional filters.
   * Aligns with GET /api/orders.
   */
  fetchOrders: async (
    buyerId?: string,
    sellerId?: string,
    status?: OrderStatus
  ): Promise<GetOrdersResponseDTO> => { // Updated return type to the new DTO
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const url = new URL(`${API_BASE_URL}/order`);
    if (buyerId) url.searchParams.append('buyerId', buyerId);
    if (sellerId) url.searchParams.append('sellerId', sellerId);
    if (status) url.searchParams.append('status', status);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch orders.');
    }

    // Backend returns a GetOrdersResponseDTO object
    return response.json();
  },

  /**
   * Places a new order.
   * Aligns with POST /api/orders.
   */
  placeOrder: async (
    placeOrderDTO: PlaceOrderRequestDTO
  ): Promise<OrderResponseDTO[]> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }
    const response = await fetch(`${API_BASE_URL}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(placeOrderDTO),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to place order.');
    }

    // Backend returns an array of newly created orders (matching the input items)
    return response.json();
  },

  /**
   * Updates the status of an existing order.
   * Aligns with PATCH /api/orders/:id/status.
   */
  updateOrderStatus: async (
    orderId: string,
    status: OrderStatus
  ): Promise<OrderResponseDTO> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/order/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update order status.');
    }

    // Backend returns the single updated OrderResponseDTO
    return response.json();
  },
};

// Create the Zustand store
export const useOrderStore = create<OrderState & OrderActions>((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,

  /**
   * Fetches orders from the backend and updates the store state.
   */
  fetchOrders: async (
    buyerId?: string,
    sellerId?: string,
    status?: OrderStatus
  ) => {
    set({ isLoading: true, error: null });
    try {
      // The API client now returns the full DTO object
      const fetchedOrdersDto = await orderApiClient.fetchOrders(
        buyerId,
        sellerId,
        status
      );

      // Use immer's produce for safe state mutations
      set(
        produce((state: OrderState) => {
          // Extract the orders array from the DTO before updating the state
          state.orders = fetchedOrdersDto.orders;
          state.isLoading = false;
        })
      );
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      console.error('Error fetching orders:', error.message);
    }
  },

  /**
   * Places a new order and appends the newly created orders to the store state.
   */
  placeOrder: async (placeOrderDTO: PlaceOrderRequestDTO): Promise<OrderResponseDTO[]> => {

    set({ isLoading: true, error: null });
    try {
      const newlyPlacedOrders = await orderApiClient.placeOrder(placeOrderDTO);

      set(
        produce((state: OrderState) => {
          // Append the new orders to the existing list
          state.orders.push(...newlyPlacedOrders);
          state.isLoading = false;
        })
      );
      console.log('Order(s) placed successfully:', newlyPlacedOrders);
      // Explicitly return the array of orders
      return newlyPlacedOrders;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      console.error('Error placing order:', error.message);
      // Re-throw the error so the component can catch it
      throw error;
    }
  },

  /**
   * Updates the status of a specific order in the store state.
   */
  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    set({ isLoading: true, error: null });
    try {
      const updatedOrder = await orderApiClient.updateOrderStatus(
        orderId,
        status
      );

      set(
        produce((state: OrderState) => {
          const index = state.orders.findIndex((order) => order.id === orderId);
          if (index !== -1) {
            // Replace the old order with the updated one
            state.orders[index] = updatedOrder;
          }
          state.isLoading = false;
        })
      );
      console.log(
        `Order ${orderId} status updated to ${status} successfully.`,
        updatedOrder
      );
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      console.error('Error updating order status:', error.message);
      throw error;
    }
  },

  /**
   * Returns a list of orders filtered by buyerId.
   */
  getOrdersByBuyer: (buyer_id: string) => {
    const { orders } = get();
    return orders.filter((order) => order.buyer_id === buyer_id);
  },

  /**
   * Returns a list of orders filtered by sellerId.
   */
  getOrdersBySeller: (seller_id: string) => {
    const { orders } = get();
    return orders.filter((order) => order.seller_id === seller_id);
  },
}));

