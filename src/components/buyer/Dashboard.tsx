import React, { useState } from 'react';
import { Package, Star, Loader2, MapPin, ShoppingCart, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useOrderStore, Order } from '../../stores/orderStore';
import { useCartStore } from '../../stores/cartStore';
import { useProductStore } from '../../stores/productStore';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }: { status: string }) => {
  const colorMap: Record<string, string> = {
    delivered: 'bg-green-100 text-green-700',
    processing: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    shipped: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-600',
  };
  return (
    <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${colorMap[status] || ''}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

interface ReorderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
}

const ReorderConfirmationModal: React.FC<ReorderConfirmationModalProps> = ({
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
        <p className="text-gray-600 mb-6">
          "{productName}" is already in your cart. Do you want to add it again?
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            Add Again
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export const BuyerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { orders, getOrdersByBuyer } = useOrderStore();
  const { addToCart } = useCartStore();
  const { products } = useProductStore();
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [pendingReorder, setPendingReorder] = useState<{ order: Order; product: any } | null>(null);

  const buyerOrders = user ? getOrdersByBuyer(user.id) : [];
  const recentOrders = buyerOrders.slice(0, 5); // Show only 5 most recent

  const totalOrders = buyerOrders.length;
  const pending = buyerOrders.filter((o) => o.status === 'pending').length;
  const reviewsGiven = buyerOrders.filter((o) => o.canReview && o.status === 'delivered').length;

  const handleReorder = async (order: Order) => {
    // Find the product in the store
    const product = products.find(p => p.id === order.productId);
    
    if (!product) {
      toast.error('Product is no longer available');
      return;
    }

    if (!product.isActive || product.stock === 0) {
      toast.error('Product is currently unavailable');
      return;
    }

    try {
      const added = await addToCart(product, 1);
      
      if (!added) {
        // Product already in cart, show confirmation modal
        setPendingReorder({ order, product });
        setShowReorderModal(true);
      } else {
        toast.success(`${product.name} added to cart!`);
      }
    } catch (error) {
      toast.error('Failed to add product to cart');
    }
  };

  const handleConfirmReorder = async () => {
    if (!pendingReorder) return;

    try {
      // Force add to cart (increment quantity)
      const { product } = pendingReorder;
      await addToCart(product, 1);
      toast.success(`${product.name} added to cart again!`);
    } catch (error) {
      toast.error('Failed to add product to cart');
    } finally {
      setShowReorderModal(false);
      setPendingReorder(null);
    }
  };

  const handleCloseReorderModal = () => {
    setShowReorderModal(false);
    setPendingReorder(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back, {user?.name}</h1>
          <p className="text-gray-600 mt-1">Track your orders, leave reviews, and explore fresh crops.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
          </div>
          <div className="bg-blue-500 text-white p-3 rounded-lg">
            <Package size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Reviews Given</p>
            <p className="text-3xl font-bold text-gray-900">{reviewsGiven}</p>
          </div>
          <div className="bg-yellow-500 text-white p-3 rounded-lg">
            <Star size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Pending Deliveries</p>
            <p className="text-3xl font-bold text-gray-900">{pending}</p>
          </div>
          <div className="bg-purple-500 text-white p-3 rounded-lg">
            <Loader2 size={24} />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Recent Orders</h2>
          <Link
            to="/orders"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            View All Orders
          </Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Package className="mx-auto mb-4 text-gray-400" size={40} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <Link
              to="/marketplace"
              className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors inline-flex items-center space-x-2"
            >
              <ShoppingCart size={20} />
              <span>Browse Products</span>
            </Link>
          </div>
        ) : (
          recentOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center"
            >
              <div className="flex items-start space-x-4 flex-1">
                <img
                  src={order.productImage}
                  alt={order.productName}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">{order.productName}</h3>
                  <p className="text-sm text-gray-700">
                    From <span className="font-medium text-green-700">{order.sellerName}</span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" />
                    {order.deliveryAddress}
                  </p>
                  <p className="text-sm text-gray-600">
                    Quantity: {order.quantity} {order.unit} • ₱{order.totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-col md:items-end space-y-2">
                <StatusBadge status={order.status} />
                <div className="flex items-center space-x-2">
                  {order.status === 'delivered' && order.canReview && (
                    <Link
                      to={`/reviews/new?orderId=${order.id}`}
                      className="inline-flex items-center text-sm text-yellow-600 hover:text-yellow-800 font-medium"
                    >
                      <Star size={16} className="mr-1" /> Leave Review
                    </Link>
                  )}
                  {order.canReorder && (
                    <button
                      onClick={() => handleReorder(order)}
                      className="inline-flex items-center text-sm text-green-600 hover:text-green-800 font-medium"
                    >
                      <RotateCcw size={16} className="mr-1" /> Reorder
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reorder Confirmation Modal */}
      <ReorderConfirmationModal
        isOpen={showReorderModal}
        onClose={handleCloseReorderModal}
        onConfirm={handleConfirmReorder}
        productName={pendingReorder?.product?.name || ''}
      />
    </div>
  );
};