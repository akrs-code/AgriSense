import { create } from 'zustand';
import { CreateProductDTO, Product, UpdateProductDTO } from '../types/product.types';
import { MarketPrice } from '../types/marketPrice.types';

const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = {
  addProduct: async (productData: CreateProductDTO): Promise<Product> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Throw a specific error message from the backend for better debugging/UX
      throw new Error(errorData.message || 'Failed to add product.');
    }

    // The backend is expected to return the newly created product (ProductResponseDTO, which matches frontend Product)
    const newProduct: Product = await response.json();
    return newProduct;
  },

  updateProduct: async (id: string, updates: UpdateProductDTO): Promise<Product> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/product/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update product.');
    }

    const updatedProduct: Product = await response.json();
    return updatedProduct;
  },

  deleteProduct: async (id: string): Promise<void> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/product/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    // For a DELETE request, a 204 No Content is common for success
    if (!response.ok) {
      // If the backend sends an error message, parse it. Otherwise, use a generic message.
      const errorData = await response.json().catch(() => ({ message: 'Failed to delete product.' }));
      throw new Error(errorData.message || 'Failed to delete product.');
    }
    // No content expected for a successful delete (204 No Content)
  },

  fetchProducts: async (): Promise<Product[]> => {
    const token = getAuthToken();
    // For fetching products, we might not strictly require a token,
    // but if one exists, we should send it.
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/product`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch products.' }));
      throw new Error(errorData.message || 'Failed to fetch products.');
    }

    const products: Product[] = await response.json();
    return products;
  },

  fetchMarketPrices: async (): Promise<MarketPrice[]> => {
    const token = getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Assuming a new endpoint for market prices, e.g., /api/market-prices
    const response = await fetch(`${API_BASE_URL}/market-prices`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch market prices.' }));
      throw new Error(errorData.message || 'Failed to fetch market prices.');
    }

    const marketPrices: MarketPrice[] = await response.json();
    return marketPrices;
  },

  fetchProductById: async (id: string): Promise<Product | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/product/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Return null if product is not found
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch product by ID.');
      }

      const product: Product = await response.json();
      return product;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
  },
}

interface ProductState {
  products: Product[];
  marketPrices: MarketPrice[];
  isLoading: boolean;
  searchQuery: string;
  selectedProduct: Product | null;
  filters: {
    category: string;
    location: string;
    priceRange: [number, number];
    condition: string;
  };
  addProduct: (product: CreateProductDTO) => Promise<void>;
  updateProduct: (id: string, updates: UpdateProductDTO) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchMarketPrices: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<ProductState['filters']>) => void;
  getFilteredProducts: () => Product[];
  fetchProductById: (id: string) => Promise<Product | null>; // Add this line
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  marketPrices: [],
  isLoading: false,
  searchQuery: '',
  filters: {
    category: '',
    location: '',
    priceRange: [0, 1000],
    condition: ''
  },
  selectedProduct: null,
  addProduct: async (productData: CreateProductDTO) => {
    set({ isLoading: true });

    try {
      // Call the API client to send the product data
      const newProduct = await apiClient.addProduct(productData); // Expecting Product from backend

      // Update the Zustand store with the product returned by the backend (which includes ID, timestamps)
      set(state => ({
        products: [...state.products, newProduct],
        isLoading: false
      }));
      console.log('Product added successfully:', newProduct);
    } catch (error: any) {
      set({ isLoading: false });
      console.error('Error adding product:', error.message);
      // Re-throw the error so components can handle it (e.g., display a toast notification)
      throw error;
    }
  },

  updateProduct: async (id: string, updates: UpdateProductDTO) => { // Corrected type to UpdateProductDTO
    set({ isLoading: true });

    try {
      // Call the API client to send the update request
      const updatedProduct = await apiClient.updateProduct(id, updates);

      // Update the Zustand store with the product returned by the backend
      set(state => ({
        products: state.products.map(product =>
          product.id === id
            ? updatedProduct // Replace the old product with the fully updated one from backend
            : product
        ),
        isLoading: false
      }));
      console.log(`Product ${id} updated successfully:`, updatedProduct);
    } catch (error: any) {
      set({ isLoading: false });
      console.error('Error updating product:', error.message);
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    set({ isLoading: true });

    try {
      // Call the API client to send the delete request
      await apiClient.deleteProduct(id);

      // Update the Zustand store by filtering out the deleted product
      set(state => ({
        products: state.products.filter(product => product.id !== id),
        isLoading: false
      }));
      console.log(`Product ${id} deleted successfully.`);
    } catch (error: any) {
      set({ isLoading: false });
      console.error('Error deleting product:', error.message);
      throw error;
    }
  },

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const fetchedProducts = await apiClient.fetchProducts();
      set({
        products: fetchedProducts,
        isLoading: false
      });
      console.log('Products fetched successfully:', fetchedProducts);
    } catch (error: any) {
      set({ isLoading: false });
      console.error('Error fetching products:', error.message);
      throw error;
    }
  },

  fetchMarketPrices: async () => {
    set({ isLoading: true });
    try {
      const fetchedMarketPrices = await apiClient.fetchMarketPrices();
      set({
        marketPrices: fetchedMarketPrices, // Update the marketPrices state
        isLoading: false
      });
      console.log('Market prices fetched successfully:', fetchedMarketPrices);
    } catch (error: any) {
      set({ isLoading: false });
      console.error('Error fetching market prices:', error.message);
      throw error;
    }
  },

  fetchProductById: async (id: string): Promise<Product | null> => {
    return await apiClient.fetchProductById(id);
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  getFilteredProducts: () => {
    const { products, searchQuery, filters } = get(); // Get current state from the store

    // Convert search query to lowercase once for efficiency
    const lowerCaseSearchQuery = searchQuery ? searchQuery.toLowerCase() : '';

    return products.filter(product => {
      // 1. Search Query Match
      const matchesSearch = !searchQuery ||
        product.name.toLowerCase().includes(lowerCaseSearchQuery) ||
        product.category.toLowerCase().includes(lowerCaseSearchQuery) ||
        (product.variety && product.variety.toLowerCase().includes(lowerCaseSearchQuery)) ||
        (product.description && product.description.toLowerCase().includes(lowerCaseSearchQuery));

      // 2. Category Filter Match
      const matchesCategory = !filters.category || product.category === filters.category;

      // 3. Location Filter Match
      // REMOVED THE INCORRECT TYPE ANNOTATION ': Location'
      const matchesLocation = !filters.location ||
        (product.location && product.location.address &&
          product.location.address.toLowerCase().includes(filters.location.toLowerCase()));

      // 4. Price Range Filter Match
      const matchesPrice = product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1];

      // 5. Condition Filter Match
      const matchesCondition = !filters.condition || (product.condition && product.condition === filters.condition);

      // 6. Only show active products
      const isActive = product.is_active !== undefined ? product.is_active : true;

      // Combine all conditions
      return matchesSearch && matchesCategory && matchesLocation &&
        matchesPrice && matchesCondition && isActive;
    });
  }
}));