// src/hooks/useAppInitializer.ts
import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useProductStore } from '../stores/productStore';
import { useOrderStore } from '../stores/orderStore';
import { useCartStore } from '../stores/cartStore';
import { UserRole } from '../types/enums';

/**
 * A custom hook to initialize all necessary application data on startup.
 * This includes user authentication, products, market prices, and user-specific data like orders and cart.
 * @returns {boolean} - Returns true when all initial data fetching is complete.
 */
export const useAppInitializer = () => {
    const { initializeAuth, user, isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
    const { fetchProducts, fetchMarketPrices, products, marketPrices, isLoading: isProductLoading } = useProductStore();
    const { fetchOrders, orders, isLoading: isOrderLoading } = useOrderStore();
    const { items, fetchCart, isLoading: isCartLoading } = useCartStore();

    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const initializeData = async () => {
            // Step 1: Initialize authentication first
            await initializeAuth();

            // Step 2: Fetch global data that doesn't depend on a user
            await fetchProducts();
            await fetchMarketPrices();
        };

        initializeData();
    }, [initializeAuth, fetchProducts, fetchMarketPrices]);
    console.log('Products: ');
    console.log(products);
    console.log('Market Prices:');
    console.log(marketPrices);
    useEffect(() => {
        // Step 3: Fetch user-specific data only after authentication is confirmed
        if (isAuthenticated && user) {
            // Fetch user-specific orders
            if (user.role === UserRole.Buyer) {
                fetchOrders(user.id, undefined, undefined);
            } else if (user.role === UserRole.Seller) {
                fetchOrders(undefined, user.id, undefined);
            }

            // Fetch user-specific cart
            fetchCart();
        }
    }, [isAuthenticated, user, fetchOrders, fetchCart]);
    console.log('Orders: ');
    console.log(orders);
    console.log('Cart');


    useEffect(() => {
        // Step 4: Check if all initial loading states are false
        if (!isAuthLoading && !isProductLoading && !isOrderLoading && !isCartLoading) {
            setIsInitializing(false);
        }
    }, [isAuthLoading, isProductLoading, isOrderLoading, isCartLoading]);

    return isInitializing;
};