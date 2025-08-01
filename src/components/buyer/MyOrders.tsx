import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, RotateCcw, Eye, Star, Filter, Search, Wallet, CreditCard, Loader2 } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';
import { useOrderStore } from '../../stores/orderStore';
import { useCartStore } from '../../stores/cartStore';
import { OrderResponseDTO } from '../../types/order.types';
import { OrderStatus, UserRole, ProductCondition } from '../../types/enums';
import { Product } from '../../types/product.types'; // Import Product type
import toast from 'react-hot-toast';
import { ReviewModal } from './ReviewModal'; // Assuming ReviewModal exists in the same directory

// Helper component for different order statuses
const getStatusIconAndColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Pending:
      return { icon: <Clock size={20} />, color: 'text-yellow-500' };
    case OrderStatus.Processing:
      return { icon: <Package size={20} />, color: 'text-blue-500' };
    case OrderStatus.Shipped:
      return { icon: <RotateCcw size={20} />, color: 'text-indigo-500' };
    case OrderStatus.Delivered:
      return { icon: <CheckCircle size={20} />, color: 'text-green-500' };
    case OrderStatus.Cancelled:
      return { icon: <XCircle size={20} />, color: 'text-red-500' };
    default:
      return { icon: <Clock size={20} />, color: 'text-gray-500' };
  }
};

interface ReorderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
}

export const ReorderConfirmationModal: React.FC<ReorderConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Already in Cart</h3>
        <p className="text-gray-600 mb-4">
          The product "{productName}" is already in your cart. Do you want to add it again?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
          >
            Add to Cart Again
          </button>
        </div>
      </div>
    </div>
  );
};

export const MyOrders: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDTO | null>(null);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [pendingReorder, setPendingReorder] = useState<OrderResponseDTO | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingOrder, setReviewingOrder] = useState<OrderResponseDTO | null>(null);

  // Zustand stores
  const userId = useAuthStore(state => state.user?.id);
  const userRole = useAuthStore(state => state.user?.role);
  const orders = useOrderStore(state => state.orders);
  const fetchOrders = useOrderStore(state => state.fetchOrders);
  const isLoading = useOrderStore(state => state.isLoading);
  const error = useOrderStore(state => state.error);
  // Assuming addToCart now takes a Product object and a quantity
  const addToCart = useCartStore(state => state.addToCart);

  // Added useEffect to fetch orders when the component mounts or userId changes
  useEffect(() => {
    if (userId) {
      fetchOrders(userId, userRole === UserRole.Seller ? userId : undefined, undefined);
    }
  }, [fetchOrders, userId, userRole]);

  const handleViewOrder = (order: OrderResponseDTO) => {
    setSelectedOrder(order);
  };

  const handleReorder = (order: OrderResponseDTO) => {
    setPendingReorder(order);
    setShowReorderModal(true);
  };

  const handleCloseReorderModal = () => {
    setShowReorderModal(false);
    setPendingReorder(null);
  };

  const handleConfirmReorder = async () => {
    if (!pendingReorder) return;
    try {
      // The addToCart function seems to have been updated to accept a Product object.
      // We will construct a partial Product object from the available OrderItem data.
      for (const item of pendingReorder.order_items) {
        const partialProduct: Product = {
          id: item.product_id,
          name: item.product_name,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price_per_unit,
          images: item.product_image ? [item.product_image] : null,
          // Fill in other required fields with placeholder/default values
          seller_id: pendingReorder.seller_id,
          variety: null,
          description: null,
          harvest_date: new Date(),
          location: pendingReorder.delivery_location,
          category: 'Default',
          condition: ProductCondition.Good, // Default condition
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        };
        await addToCart(partialProduct, item.quantity);
      }
      toast.success(`Successfully added all items from order #${pendingReorder.id.slice(0, 8)} to your cart!`);
      handleCloseReorderModal();
    } catch (err) {
      console.error(err);
      toast.error('Failed to reorder. Please try again.');
    }
  };

  const handleReviewOrder = (order: OrderResponseDTO) => {
    setReviewingOrder(order);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setReviewingOrder(null);
    setSelectedOrder(null); // Close the order detail modal as well
  };

  const handleReviewSuccess = () => {
    // A simple toast to notify the user
    toast.success("Review submitted successfully!");
    handleCloseReviewModal();
  };

  const renderStatusPill = (status: OrderStatus) => {
    const { icon, color } = getStatusIconAndColor(status);
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-opacity-20 ${color} bg-current`}>
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredOrders = orders; // Now using the real orders from the store

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
        <span className="ml-3 text-lg text-gray-700">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50 text-red-700 p-4 rounded-lg">
        <XCircle className="h-6 w-6 mr-2" />
        <span className="text-lg">Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-600">Track and manage your recent orders.</p>
        </header>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No orders yet</h3>
            <p className="mt-1 text-gray-600">
              Looks like you haven't placed any orders. Start shopping now!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map(order => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 transition-transform duration-300 hover:scale-[1.02] cursor-pointer"
                onClick={() => handleViewOrder(order)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {/* Safely format the date, with a fallback */}
                      {order.created_at ? `Placed ${formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}` : 'Date not available'}
                    </p>
                  </div>
                  {renderStatusPill(order.status)}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-600">Seller: <span className="font-medium text-gray-800">{order.seller_name}</span></p>
                  <p className="text-sm text-gray-600 mt-1">
                    Total: <span className="font-bold text-green-600">₱{Number(order.total_price || 0).toFixed(2)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XCircle size={24} />
              </button>
            </div>

            {/* Order Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-6 pb-6 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-500">Order ID</p>
                <p className="mt-1 text-base font-semibold text-gray-900">{selectedOrder.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="mt-1">{renderStatusPill(selectedOrder.status)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Order Date</p>
                {/* Safely display the date, with a fallback */}
                <p className="mt-1 text-base text-gray-900">
                  {selectedOrder.order_date ? new Date(selectedOrder.order_date).toLocaleDateString() : 'Date not available'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Payment Method</p>
                <p className="mt-1 text-base text-gray-900">{selectedOrder.payment_method === 'e-wallet' ? 'E-Wallet' : 'Cash on Delivery'}</p>
              </div>
            </div>

            {/* Items List */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Items</h4>
              <div className="space-y-4">
                {selectedOrder.order_items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                    <img
                      src={item.product_image || `https://placehold.co/80x80/E2E8F0/A0AEC0?text=${item.product_name ? item.product_name.charAt(0).toUpperCase() : '?'}`}
                      alt={item.product_name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <p className="text-base font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} {item.unit} x ₱{item.price_per_unit}
                      </p>
                      <p className="text-sm text-gray-800 font-semibold mt-1">
                        Subtotal: ₱{item.subtotal || '0.00'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total and actions */}
            <div className="flex flex-col md:flex-row md:justify-between items-center pt-6 border-t border-gray-200">
              <div className="text-xl font-bold text-gray-900 mb-4 md:mb-0">
                Total: <span className="text-green-600">₱{Number(selectedOrder.total_price || 0).toFixed(2)}</span>
              </div>
              <div className="flex w-full md:w-auto space-x-3">
                {selectedOrder.can_review && (
                  <button
                    onClick={() => handleReviewOrder(selectedOrder)}
                    className="flex-1 bg-yellow-400 text-white py-3 px-4 rounded-lg font-medium hover:bg-yellow-500 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Star size={20} />
                    <span>Leave a Review</span>
                  </button>
                )}
                {selectedOrder.can_reorder && (
                  <button
                    onClick={() => {
                      handleReorder(selectedOrder);
                      setSelectedOrder(null);
                    }}
                    className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <RotateCcw size={20} />
                    <span>Reorder</span>
                  </button>
                )}
                
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reorder Confirmation Modal */}
      <ReorderConfirmationModal
        isOpen={showReorderModal}
        onClose={handleCloseReorderModal}
        onConfirm={handleConfirmReorder}
        productName={pendingReorder?.order_items[0]?.product_name || ''}
      />

      {/* Review Modal */}
      {showReviewModal && reviewingOrder && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={handleCloseReviewModal}
          order={reviewingOrder}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};
