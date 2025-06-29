import React, { useState } from 'react';
import { Package, Star, Loader2, MapPin, ShoppingCart, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { useReviewStore } from '../../stores/reviewStore';
import { useAuthStore } from '../../stores/authStore';
import { UserInfoSection } from '../common/UserInfoSection';
import toast from 'react-hot-toast';

export interface Order {
  id: string;
  cropName: string;
  sellerName: string;
  sellerId: string;
  productId: string;
  location: string;
  quantity: number;
  unit: string;
  price: number;
  status: 'Delivered' | 'Pending' | 'Cancelled';
  reviewed: boolean;
  orderDate: Date;
  image: string;
}

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    cropName: 'Premium Rice',
    sellerName: 'Juan Dela Cruz Farm',
    sellerId: 'seller-1',
    productId: '1',
    location: 'Cabanatuan, Nueva Ecija',
    quantity: 10,
    unit: 'kg',
    price: 450,
    status: 'Delivered',
    reviewed: false,
    orderDate: new Date('2024-01-15'),
    image: 'https://images.pexels.com/photos/164504/pexels-photo-164504.jpeg'
  },
  {
    id: 'ORD-002',
    cropName: 'Sweet Corn',
    sellerName: 'Maria Santos Farm',
    sellerId: 'seller-2',
    productId: '2',
    location: 'Quezon, Nueva Ecija',
    quantity: 5,
    unit: 'kg',
    price: 175,
    status: 'Pending',
    reviewed: false,
    orderDate: new Date('2024-01-18'),
    image: 'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg'
  },
  {
    id: 'ORD-003',
    cropName: 'Tomatoes',
    sellerName: 'Rodriguez Organic Farm',
    sellerId: 'seller-3',
    productId: '3',
    location: 'San Jose City',
    quantity: 3,
    unit: 'kg',
    price: 180,
    status: 'Delivered',
    reviewed: true,
    orderDate: new Date('2024-01-10'),
    image: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg'
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  const colorMap: Record<string, string> = {
    Delivered: 'bg-green-100 text-green-700',
    Pending: 'bg-yellow-100 text-yellow-800',
    Cancelled: 'bg-red-100 text-red-600',
  };
  return (
    <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${colorMap[status] || ''}`}>
      {status}
    </span>
  );
};

export const BuyerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const { addReview, hasUserReviewedOrder } = useReviewStore();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });

  const totalOrders = mockOrders.length;
  const pending = mockOrders.filter((o) => o.status === 'Pending').length;
  const reviewsGiven = mockOrders.filter((o) => o.reviewed).length;

  const handleReorder = (order: Order) => {
    // Create a mock product object for the cart
    const product = {
      id: order.productId,
      name: order.cropName,
      price: order.price / order.quantity, // Get unit price
      unit: order.unit,
      sellerId: order.sellerId,
      images: [order.image]
    };

    addToCart(product, order.quantity);
    toast.success(`${order.cropName} added to cart!`);
  };

  const handleOpenReviewModal = (order: Order) => {
    if (hasUserReviewedOrder(order.id, user!.id)) {
      toast.info('You have already reviewed this order');
      return;
    }
    
    setSelectedOrder(order);
    setReviewForm({ rating: 0, comment: '' });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || reviewForm.rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    try {
      await addReview({
        orderId: selectedOrder.id,
        productId: selectedOrder.productId,
        sellerId: selectedOrder.sellerId,
        buyerId: user!.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });

      // Update the order as reviewed (in real app, this would be handled by backend)
      const orderIndex = mockOrders.findIndex(o => o.id === selectedOrder.id);
      if (orderIndex !== -1) {
        mockOrders[orderIndex].reviewed = true;
      }

      toast.success('Review submitted successfully!');
      setShowReviewModal(false);
      setSelectedOrder(null);
      setReviewForm({ rating: 0, comment: '' });
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, onRatingChange?: (rating: number) => void) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRatingChange?.(star)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          disabled={!interactive}
        >
          <Star
            size={interactive ? 24 : 16}
            className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your orders, leave reviews, and explore fresh crops.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* User Info Section */}
        <UserInfoSection />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
              <Link
                to="/orders"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                View All Orders
              </Link>
            </div>
          </div>

          <div className="p-6">
            {mockOrders.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                <Package className="mx-auto mb-2" size={40} />
                <p>No recent orders found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center"
                  >
                    <div className="flex items-start space-x-4 flex-1">
                      <img
                        src={order.image}
                        alt={order.cropName}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900">{order.cropName}</h3>
                        <p className="text-sm text-gray-700">
                          From <span className="font-medium text-green-700">{order.sellerName}</span>
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin size={14} className="text-gray-400" />
                          {order.location}
                        </p>
                        <p className="text-sm text-gray-600">
                          Quantity: {order.quantity} {order.unit} • ₱{order.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-col md:items-end space-y-2">
                      <StatusBadge status={order.status} />
                      <div className="flex items-center space-x-2">
                        {order.status === 'Delivered' && !order.reviewed && (
                          <button
                            onClick={() => handleOpenReviewModal(order)}
                            className="inline-flex items-center text-sm text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-lg transition-colors"
                          >
                            <Star size={16} className="mr-1" /> Leave Review
                          </button>
                        )}
                        <button
                          onClick={() => handleReorder(order)}
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
                        >
                          <RotateCcw size={16} className="mr-1" /> Reorder
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <form onSubmit={handleSubmitReview} className="p-6 space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">Rate Your Experience</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedOrder.cropName} from {selectedOrder.sellerName}
                </p>
              </div>
              
              <div className="text-center">
                {renderStars(reviewForm.rating, true, (rating) => setReviewForm({ ...reviewForm, rating }))}
                <p className="text-sm text-gray-500 mt-2">
                  {reviewForm.rating === 0 ? 'Select a rating' : 
                   ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewForm.rating - 1]}
                </p>
              </div>
              
              <textarea
                placeholder="Leave a comment (optional)"
                rows={4}
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              
              <div className="flex gap-3">
                <button 
                  type="submit" 
                  disabled={reviewForm.rating === 0}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg flex-1 font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Review
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowReviewModal(false)} 
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex-1 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};