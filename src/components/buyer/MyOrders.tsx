import React, { useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, RotateCcw, Eye, Star, Filter, Search, Wallet, CreditCard } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';
import { useOrderStore, Order } from '../../stores/orderStore';
import { useCartStore } from '../../stores/cartStore';
import { useProductStore } from '../../stores/productStore';
import { useReviewStore } from '../../stores/reviewStore';
import { ReviewModal } from './ReviewModal';
import toast from 'react-hot-toast';

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

export const MyOrders: React.FC = () => {
  const { user } = useAuthStore();
  const { orders, getOrdersByBuyer, updateOrderStatus, isLoading } = useOrderStore();
  const { addToCart } = useCartStore();
  const { products } = useProductStore();
  const { hasReviewed } = useReviewStore();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [pendingReorder, setPendingReorder] = useState<{ order: Order; product: any } | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);

  const buyerOrders = user ? getOrdersByBuyer(user.id) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'processing':
        return <Package size={16} className="text-blue-600" />;
      case 'shipped':
        return <Package size={16} className="text-purple-600" />;
      case 'delivered':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getPaymentMethodIcon = (paymentMethod: string) => {
    switch (paymentMethod) {
      case 'e-wallet':
        return <Wallet size={16} className="text-blue-600" />;
      case 'cod':
        return <CreditCard size={16} className="text-green-600" />;
      default:
        return <CreditCard size={16} className="text-gray-600" />;
    }
  };

  const getPaymentMethodColor = (paymentMethod: string) => {
    switch (paymentMethod) {
      case 'e-wallet':
        return 'bg-blue-100 text-blue-800';
      case 'cod':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get farmer e-wallet details from seller profile
  const getFarmerEWalletDetails = (sellerId: string) => {
    // In a real app, this would fetch from the seller's profile API
    // For now, we'll return mock data based on seller ID
    const sellerProfiles: { [key: string]: any } = {
      'seller-1': {
        provider: 'GCash',
        accountNumber: '09123456789',
        accountName: 'Juan Dela Cruz',
        qrCodeImage: 'https://via.placeholder.com/300x300/4F46E5/ffffff?text=GCash+QR+Code'
      },
      'seller-2': {
        provider: 'Maya',
        accountNumber: '09987654321',
        accountName: 'Maria Santos',
        qrCodeImage: 'https://via.placeholder.com/300x300/E11D48/ffffff?text=Maya+QR+Code'
      }
    };
    
    return sellerProfiles[sellerId] || {
      provider: 'GCash',
      accountNumber: '09123456789',
      accountName: 'Unknown Farmer',
      qrCodeImage: 'https://via.placeholder.com/300x300/4F46E5/ffffff?text=QR+Code'
    };
  };

  const filteredOrders = buyerOrders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

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

  const handleOpenReviewModal = (order: Order) => {
    setReviewingOrder(order);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setReviewingOrder(null);
  };

  const handleReviewSuccess = () => {
    // Update the order to mark it as reviewed
    if (reviewingOrder) {
      // In a real app, you'd update the order in the backend
      // For now, we'll just close the modal and show success
      toast.success('Review submitted successfully!');
    }
  };

  const stats = [
    {
      title: 'Total Orders',
      value: buyerOrders.length,
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'In Transit',
      value: buyerOrders.filter(o => o.status === 'shipped').length,
      icon: Package,
      color: 'bg-purple-500'
    },
    {
      title: 'Delivered',
      value: buyerOrders.filter(o => o.status === 'delivered').length,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Total Spent',
      value: `₱${buyerOrders.reduce((sum, o) => sum + o.totalPrice, 0).toLocaleString()}`,
      icon: Package,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">Track your purchases and order history</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {selectedStatus === 'all' 
                  ? 'You haven\'t placed any orders yet'
                  : `No ${selectedStatus} orders found`
                }
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const orderHasReview = hasReviewed(order.id);
              const canReview = order.status === 'delivered' && !orderHasReview;
              
              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <img
                        src={order.productImage}
                        alt={order.productName}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {order.productName}
                          </h3>
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="capitalize">{order.status}</span>
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>Order ID:</strong> {order.id}</p>
                            <p><strong>Seller:</strong> {order.sellerName}</p>
                          </div>
                          <div>
                            <p><strong>Quantity:</strong> {order.quantity} {order.unit}</p>
                            <p><strong>Total:</strong> ₱{order.totalPrice.toLocaleString()}</p>
                          </div>
                          <div>
                            <p><strong>Order Date:</strong> {order.orderDate.toLocaleDateString()}</p>
                            {order.estimatedDelivery && (
                              <p><strong>Est. Delivery:</strong> {order.estimatedDelivery.toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center space-x-2">
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(order.paymentMethod)}`}>
                            {getPaymentMethodIcon(order.paymentMethod)}
                            <span>{order.paymentMethod === 'e-wallet' ? 'E-wallet Payment' : 'Cash on Delivery'}</span>
                          </span>
                        </div>

                        {order.trackingNumber && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Tracking Number:</strong> {order.trackingNumber}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye size={16} />
                        <span>View Details</span>
                      </button>
                      
                      {order.canReorder && (
                        <button
                          onClick={() => handleReorder(order)}
                          className="flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <RotateCcw size={16} />
                          <span>Reorder</span>
                        </button>
                      )}
                      
                      {canReview && (
                        <button
                          onClick={() => handleOpenReviewModal(order)}
                          className="flex items-center space-x-1 bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg hover:bg-yellow-200 transition-colors"
                        >
                          <Star size={16} />
                          <span>Review</span>
                        </button>
                      )}

                      {orderHasReview && order.status === 'delivered' && (
                        <div className="flex items-center space-x-1 text-green-600 px-3 py-2 text-sm">
                          <CheckCircle size={16} />
                          <span>Reviewed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-start space-x-4">
                <img
                  src={selectedOrder.productImage}
                  alt={selectedOrder.productName}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedOrder.productName}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                      <p><strong>Quantity:</strong> {selectedOrder.quantity} {selectedOrder.unit}</p>
                      <p><strong>Price per unit:</strong> ₱{selectedOrder.pricePerUnit}</p>
                      <p><strong>Total Price:</strong> ₱{selectedOrder.totalPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p><strong>Seller:</strong> {selectedOrder.sellerName}</p>
                      <p><strong>Order Date:</strong> {selectedOrder.orderDate.toLocaleDateString()}</p>
                      {selectedOrder.estimatedDelivery && (
                        <p><strong>Est. Delivery:</strong> {selectedOrder.estimatedDelivery.toLocaleDateString()}</p>
                      )}
                      <p><strong>Delivery Address:</strong> {selectedOrder.deliveryAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Order Status</h3>
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="capitalize">{selectedOrder.status}</span>
                  </span>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Payment Method</h3>
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getPaymentMethodColor(selectedOrder.paymentMethod)}`}>
                    {getPaymentMethodIcon(selectedOrder.paymentMethod)}
                    <span>{selectedOrder.paymentMethod === 'e-wallet' ? 'E-wallet Payment' : 'Cash on Delivery'}</span>
                  </span>
                </div>
              </div>

              {/* E-wallet Payment Details */}
              {selectedOrder.paymentMethod === 'e-wallet' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    {(() => {
                      const eWalletDetails = getFarmerEWalletDetails(selectedOrder.sellerId);
                      return (
                        <div className="space-y-4">
                          <div className="flex items-start space-x-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-blue-900 mb-2">Send payment to:</h4>
                              <div className="space-y-2 text-sm">
                                <p><strong>Provider:</strong> {eWalletDetails.provider}</p>
                                <p><strong>Account Number:</strong> {eWalletDetails.accountNumber}</p>
                                <p><strong>Account Name:</strong> {eWalletDetails.accountName}</p>
                                <p><strong>Amount:</strong> ₱{selectedOrder.totalPrice.toLocaleString()}</p>
                              </div>
                            </div>
                            {eWalletDetails.qrCodeImage && (
                              <div className="flex-shrink-0 text-center">
                                <img
                                  src={eWalletDetails.qrCodeImage}
                                  alt="Payment QR Code"
                                  className="w-32 h-32 object-contain border-2 border-blue-300 rounded-lg bg-white p-2"
                                />
                                <p className="text-xs text-center text-blue-700 mt-2 font-medium">Scan to pay</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <h5 className="font-semibold text-yellow-900 mb-1">Payment Instructions:</h5>
                            <ul className="text-xs text-yellow-800 space-y-1">
                              <li>• Send the exact amount to the farmer's e-wallet</li>
                              <li>• Take a screenshot of your payment confirmation</li>
                              <li>• Contact the farmer to confirm payment</li>
                              <li>• Keep your receipt for reference</li>
                            </ul>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                {selectedOrder.canReorder && (
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
        productName={pendingReorder?.product?.name || ''}
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