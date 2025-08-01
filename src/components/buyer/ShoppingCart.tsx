import React, { useState, useEffect } from 'react';
import {
  Minus,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  ShoppingCart as ShoppingCartIcon,
  ArrowRight,
  Package,
  CreditCard,
  Wallet,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  DollarSign,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { useOrderStore } from '../../stores/orderStore';
import { useProductStore } from '../../stores/productStore'; // Import useProductStore
import toast from 'react-hot-toast';
import { PaymentMethod } from '../../types/enums';
import {
  PlaceOrderRequestDTO,
  PlaceOrderItemDTO,
  OrderResponseDTO,
} from '../../types/order.types';
import { calculateDistance, estimateDeliveryTime } from '../../utils/distance.utils';
import { CartItem } from '../../types/cart.types';
import { Product } from '../../types/product.types'; // Import Product type

const ShoppingCart: React.FC = () => {
  const { user } = useAuthStore();
  const {
    items,
    totalItems,
    totalAmount,
    updateQuantity,
    removeFromCart,
    clearCart,
    isLoading: isCartLoading,
  } = useCartStore();
  const { placeOrder } = useOrderStore();
  const { fetchProductById } = useProductStore(); // Get fetchProductById from the store

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    PaymentMethod
  >(PaymentMethod.EWallet);

  const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>(null);
  const [isItemsCollapsed, setIsItemsCollapsed] = useState(false);
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);
  const [cartProducts, setCartProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  const shippingFee = 50.0;

  // Function to fetch products for all cart items
  const fetchProductsForCart = async () => {
    if (items.length === 0) {
      setCartProducts([]);
      setIsProductsLoading(false);
      return;
    }

    setIsProductsLoading(true);
    try {
      // Create an array of promises for fetching each product
      const productPromises = items.map((item) =>
        fetchProductById(item.productId)
      );

      // Wait for all promises to resolve
      const products = await Promise.all(productPromises);

      // Filter out any null products in case of a failed fetch
      setCartProducts(products.filter((p): p is Product => p !== null));
    } catch (error) {
      console.error('Error fetching cart products:', error);
      toast.error('Failed to load product details.');
    } finally {
      setIsProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsForCart();
  }, [items]); // Re-fetch whenever cart items change

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (user) {
      if (newQuantity < 1) return;
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    if (user) {
      removeFromCart(itemId);
    }
  };

  const handleClearCart = () => {
    if (user) {
      clearCart();
      toast.success('Cart cleared successfully!');
    } else {
      toast.error('Please log in to clear your cart.');
    }
  };

  const handleProceedToCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty. Please add items to proceed.');
      return;
    }
    if (!user) {
      toast.error('Please log in to place an order.');
      return;
    }
    setShowOrderModal(true);
  };

  const handlePlaceOrder = async () => {
    if (!user || items.length === 0) {
      toast.error('Cannot place an empty order.');
      return;
    }
    setIsPlacingOrder(true);
    const defaultLocation = {
        lat: 0,
        lng: 0,
        address: null,
    };

    const orderData: PlaceOrderRequestDTO = {
        payment_method: selectedPaymentMethod,
        items: items.map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
        })) as PlaceOrderItemDTO[],
        delivery_location: user?.location || defaultLocation,
    };
    try {
      const orderResponses: OrderResponseDTO[] = await placeOrder(orderData);
      const firstOrderId =
        orderResponses.length > 0 ? orderResponses[0].id : 'N/A';
      toast.success(`Order #${firstOrderId} placed successfully!`);
      setShowOrderModal(false);
      clearCart();
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isCartLoading || isProductsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      {/* Header aligned with MarketIntelligence */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
              <ShoppingCartIcon size={28} />
              <span>Your Shopping Cart</span>
            </h1>
            <p className="text-xl font-semibold text-gray-700">
              ({totalItems} items)
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
            <ShoppingCartIcon size={80} className="mb-6 text-gray-300" />
            <p className="text-2xl font-semibold text-gray-700">
              Your cart is empty.
            </p>
            <Link
              to="/"
              className="mt-6 px-8 py-4 bg-green-600 text-white rounded-full text-lg font-bold hover:bg-green-700 transition-colors shadow-lg"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items Section */}
            <div className="lg:col-span-2 space-y-4">
              <div
                className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8"
                onClick={() => setIsItemsCollapsed(!isItemsCollapsed)}
              >
                <div className="p-6 border-b border-gray-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                      <span>Cart Items</span>
                    </h2>
                    <button className="text-gray-500 hover:text-gray-900 transition-colors">
                      {isItemsCollapsed ? (
                        <ChevronDown size={24} />
                      ) : (
                        <ChevronUp size={24} />
                      )}
                    </button>
                  </div>
                </div>

                {!isItemsCollapsed && (
                  <div className="p-6">
                    {items.map((item) => {
                      // Find the corresponding product from the fetched products
                      const product = cartProducts.find(p => p.id === item.productId);
                      if (!product) return null; // Or show a placeholder if product is not found
                      
                      return (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row items-center bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 mb-4"
                        >
                          <div className="w-28 h-28 flex-shrink-0 relative">
                            <img
                              src={product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/112x112/E8F5E9/000000?text=No+Image'}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1 w-full sm:w-auto mt-4 sm:mt-0 sm:ml-6">
                            <h3 className="text-xl font-bold text-gray-900">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {product.category} {product.variety && `(${product.variety})`}
                            </p>
                            <div className="text-2xl font-extrabold text-green-700 mt-2">
                              &#8369;{product.price.toLocaleString()}
                            </div>
                          </div>
                          <div className="flex items-center mt-6 sm:mt-0 sm:ml-6">
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                                className="p-3 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Minus size={18} />
                              </button>
                              <span className="px-5 text-xl font-medium text-gray-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(item.id, item.quantity + 1)
                                }
                                className="p-3 text-gray-600 hover:bg-gray-200 transition-colors"
                              >
                                <Plus size={18} />
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="ml-4 p-3 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 size={22} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={handleClearCart}
                        className="px-6 py-3 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors font-semibold"
                      >
                        Clear Cart
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Summary and Actions Section */}
            <div className="lg:col-span-1 flex flex-col">
              <div
                className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8"
                onClick={() => setIsSummaryCollapsed(!isSummaryCollapsed)}
              >
                <div className="p-6 border-b border-gray-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                      <span>Order Summary</span>
                    </h2>
                    <button className="text-gray-500 hover:text-gray-900 transition-colors">
                      {isSummaryCollapsed ? (
                        <ChevronDown size={24} />
                      ) : (
                        <ChevronUp size={24} />
                      )}
                    </button>
                  </div>
                </div>

                {!isSummaryCollapsed && (
                  <div className="p-6">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-lg text-gray-700">
                          <span>Total Items</span>
                          <span className="font-semibold text-gray-900">
                            {totalItems}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-lg text-gray-700">
                          <span>Subtotal</span>
                          <span className="font-semibold text-gray-900">
                            &#8369;{totalAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-lg text-gray-700">
                          <span>Shipping</span>
                          <span className="font-semibold text-gray-900">
                            &#8369;{shippingFee.toLocaleString()}
                          </span>
                        </div>
                        <div className="border-t border-gray-300 pt-4 mt-4">
                          <div className="flex justify-between items-center text-2xl font-bold text-green-700">
                            <span>Total</span>
                            <span>
                              &#8369;{(totalAmount + shippingFee).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-col space-y-4">
                      <button
                        onClick={handleProceedToCheckout}
                        className="w-full px-8 py-4 bg-green-600 text-white rounded-xl text-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center shadow-md"
                      >
                        Proceed to Checkout
                        <ArrowRight size={20} className="ml-2" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Confirmation Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
          {/* Main modal container with responsive classes */}
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-auto relative p-4 sm:p-6 lg:p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Confirm Your Order
            </h2>
            <p className="text-gray-600 mb-8">
              Review your delivery details, payment method, and final cost before confirming.
            </p>

            <div className="grid grid-cols-1 gap-8">
              {/* Left Column: Details */}
              <div className="space-y-6">
                {/* Shipping Details */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-blue-800 flex items-center space-x-2 mb-2">
                    <MapPin size={20} />
                    <span>Shipping Address</span>
                  </h3>
                  {user?.location?.address ? (
                    <p className="text-gray-800">
                      {user.location.address}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">
                      Shipping address not available. Please update your profile.
                    </p>
                  )}
                </div>

                {/* Estimated Delivery Time */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-purple-800 flex items-center space-x-2 mb-2">
                    <Calendar size={20} />
                    <span>Estimated Delivery</span>
                  </h3>
                  {deliveryEstimate !== null ? (
                    <p className="text-gray-800">
                      {deliveryEstimate}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">
                      Cannot estimate delivery time. Please ensure both seller and buyer locations are available.
                    </p>
                  )}
                </div>

                {/* Payment Method */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-yellow-800 flex items-center space-x-2 mb-4">
                    <CreditCard size={20} />
                    <span>Select Payment Method</span>
                  </h3>
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={() => setSelectedPaymentMethod(PaymentMethod.EWallet)}
                      className={`flex items-center space-x-3 p-3 sm:p-4 rounded-lg transition-colors border-2 ${
                        selectedPaymentMethod === PaymentMethod.EWallet
                          ? 'bg-yellow-200 border-yellow-500 shadow-md'
                          : 'bg-white border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {selectedPaymentMethod === PaymentMethod.EWallet && (
                        <CheckCircle2 size={24} className="text-yellow-600" />
                      )}
                      <div className="flex items-center space-x-2 text-gray-800 flex-1">
                        <Wallet size={20} />
                        <span className="font-medium">E-Wallet</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setSelectedPaymentMethod(PaymentMethod.COD)}
                      className={`flex items-center space-x-3 p-3 sm:p-4 rounded-lg transition-colors border-2 ${
                        selectedPaymentMethod === PaymentMethod.COD
                          ? 'bg-yellow-200 border-yellow-500 shadow-md'
                          : 'bg-white border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {selectedPaymentMethod === PaymentMethod.COD && (
                        <CheckCircle2 size={24} className="text-yellow-600" />
                      )}
                      <div className="flex items-center space-x-2 text-gray-800 flex-1">
                        <Package size={20} />
                        <span className="font-medium">Cash on Delivery</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="flex flex-col justify-between">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6 mb-6">
                  <h3 className="text-xl font-bold text-green-800 flex items-center space-x-2 mb-4">
                    <DollarSign size={24} />
                    <span>Cost Breakdown</span>
                  </h3>
                  <div className="space-y-3 text-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Subtotal ({totalItems} items)</span>
                      <span className="font-semibold text-gray-900">&#8369;{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Shipping Fee</span>
                      <span className="font-semibold text-gray-900">&#8369;{shippingFee.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-green-300 mt-4 pt-4">
                      <div className="flex justify-between items-center text-2xl font-bold text-green-700">
                        <span>Total</span>
                        <span>&#8369;{(totalAmount + shippingFee).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="px-4 py-2 sm:px-8 sm:py-3 rounded-xl text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center justify-center font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isPlacingOrder}
                  >
                    {isPlacingOrder ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        Confirm Order
                        <ArrowRight size={20} className="ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;