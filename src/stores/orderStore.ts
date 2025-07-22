import { create } from 'zustand';
import { CartItem } from './cartStore';

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  buyerId: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'e-wallet' | 'cod';
  orderDate: Date;
  estimatedDelivery?: Date;
  deliveryAddress: string;
  trackingNumber?: string;
  canReorder: boolean;
  canReview: boolean;
}

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  placeOrder: (items: CartItem[], paymentMethod: 'e-wallet' | 'cod', deliveryAddress: string, buyerId: string) => Promise<void>;
  getOrdersByBuyer: (buyerId: string) => Order[];
  getOrdersBySeller: (sellerId: string) => Order[];
}

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    productId: '1',
    productName: 'Premium Rice',
    productImage: 'https://images.pexels.com/photos/164504/pexels-photo-164504.jpeg',
    buyerId: 'buyer-1',
    sellerId: 'seller-1',
    sellerName: 'Juan Dela Cruz Farm',
    quantity: 50,
    unit: 'kg',
    pricePerUnit: 45,
    totalPrice: 2250,
    status: 'pending',
    paymentMethod: 'e-wallet',
    orderDate: new Date('2024-01-20'),
    estimatedDelivery: new Date('2024-01-25'),
    deliveryAddress: 'Quezon City, Metro Manila',
    canReorder: true,
    canReview: false
  },
  {
    id: 'ORD-002',
    productId: '2',
    productName: 'Sweet Corn',
    productImage: 'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg',
    buyerId: 'buyer-1',
    sellerId: 'seller-1',
    sellerName: 'Maria Santos Farm',
    quantity: 25,
    unit: 'kg',
    pricePerUnit: 35,
    totalPrice: 875,
    status: 'processing',
    paymentMethod: 'cod',
    orderDate: new Date('2024-01-18'),
    estimatedDelivery: new Date('2024-01-23'),
    deliveryAddress: 'Quezon City, Metro Manila',
    canReorder: true,
    canReview: false
  },
  {
    id: 'ORD-003',
    productId: '1',
    productName: 'Premium Rice',
    productImage: 'https://images.pexels.com/photos/164504/pexels-photo-164504.jpeg',
    buyerId: 'buyer-1',
    sellerId: 'seller-1',
    sellerName: 'Juan Dela Cruz Farm',
    quantity: 100,
    unit: 'kg',
    pricePerUnit: 45,
    totalPrice: 4500,
    status: 'delivered',
    paymentMethod: 'e-wallet',
    orderDate: new Date('2024-01-15'),
    deliveryAddress: 'Quezon City, Metro Manila',
    canReorder: true,
    canReview: true
  }
];

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: mockOrders,
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isLoading: false });
  },

  updateOrderStatus: async (orderId: string, status: Order['status']) => {
    set({ isLoading: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        orders: state.orders.map(order =>
          order.id === orderId
            ? { 
                ...order, 
                status,
                canReview: status === 'delivered' ? true : order.canReview
              }
            : order
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  placeOrder: async (items: CartItem[], paymentMethod: 'e-wallet' | 'cod', deliveryAddress: string, buyerId: string) => {
    set({ isLoading: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create orders for each unique seller
      const ordersBySeller = new Map<string, CartItem[]>();
      
      items.forEach(item => {
        const sellerId = item.product.sellerId;
        if (!ordersBySeller.has(sellerId)) {
          ordersBySeller.set(sellerId, []);
        }
        ordersBySeller.get(sellerId)!.push(item);
      });
      
      const newOrders: Order[] = [];
      
      ordersBySeller.forEach((sellerItems, sellerId) => {
        sellerItems.forEach(item => {
          const newOrder: Order = {
            id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            productId: item.product.id,
            productName: item.product.name,
            productImage: item.product.images[0],
            buyerId,
            sellerId,
            sellerName: `Seller ${sellerId.slice(-4)}`, // In real app, get from seller data
            quantity: item.quantity,
            unit: item.product.unit,
            pricePerUnit: item.product.price,
            totalPrice: item.subtotal,
            status: 'pending',
            paymentMethod,
            orderDate: new Date(),
            estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            deliveryAddress,
            canReorder: true,
            canReview: false
          };
          
          newOrders.push(newOrder);
        });
      });
      
      set(state => ({
        orders: [...state.orders, ...newOrders],
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  getOrdersByBuyer: (buyerId: string) => {
    const { orders } = get();
    return orders.filter(order => order.buyerId === buyerId);
  },

  getOrdersBySeller: (sellerId: string) => {
    const { orders } = get();
    return orders.filter(order => order.sellerId === sellerId);
  }
}));