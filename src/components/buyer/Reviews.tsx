import React, { useState } from 'react';
import { Star, User, Calendar, Package, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CompletedOrder {
  id: string;
  cropName: string;
  sellerName: string;
  sellerId: string;
  completedDate: Date;
  quantity: number;
  unit: string;
  totalPrice: number;
  hasReview: boolean;
}

interface Review {
  id: string;
  orderId: string;
  cropName: string;
  sellerName: string;
  rating: number;
  comment: string;
  reviewDate: Date;
}

export const Reviews: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'submitted'>('pending');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CompletedOrder | null>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: ''
  });

  // Mock completed orders without reviews
  const completedOrders: CompletedOrder[] = [
    {
      id: 'ORD-001',
      cropName: 'Premium Rice',
      sellerName: 'Juan Dela Cruz Farm',
      sellerId: 'seller-1',
      completedDate: new Date('2024-01-20'),
      quantity: 50,
      unit: 'kg',
      totalPrice: 2250,
      hasReview: false
    },
    {
      id: 'ORD-002',
      cropName: 'Sweet Corn',
      sellerName: 'Maria Santos Farm',
      sellerId: 'seller-2',
      completedDate: new Date('2024-01-18'),
      quantity: 25,
      unit: 'kg',
      totalPrice: 875,
      hasReview: false
    }
  ];

  // Mock submitted reviews
  const submittedReviews: Review[] = [
    {
      id: 'rev-1',
      orderId: 'ORD-003',
      cropName: 'Fresh Tomatoes',
      sellerName: 'Rodriguez Organic Farm',
      rating: 5,
      comment: 'Excellent quality tomatoes! Very fresh and delivered on time. Will definitely order again.',
      reviewDate: new Date('2024-01-15')
    },
    {
      id: 'rev-2',
      orderId: 'ORD-004',
      cropName: 'Organic Lettuce',
      sellerName: 'Green Valley Farm',
      rating: 4,
      comment: 'Good quality lettuce, fresh and crisp. Packaging could be improved but overall satisfied.',
      reviewDate: new Date('2024-01-12')
    }
  ];

  const pendingReviews = completedOrders.filter(order => !order.hasReview);

  const handleOpenReviewModal = (order: CompletedOrder) => {
    setSelectedOrder(order);
    setReviewForm({ rating: 0, comment: '' });
    setShowReviewModal(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || reviewForm.rating === 0) return;

    // In a real app, this would submit to the backend
    console.log('Submitting review:', {
      orderId: selectedOrder.id,
      sellerId: selectedOrder.sellerId,
      rating: reviewForm.rating,
      comment: reviewForm.comment
    });

    setShowReviewModal(false);
    setSelectedOrder(null);
    setReviewForm({ rating: 0, comment: '' });
  };

  const renderStars = (rating: number, interactive: boolean = false, onRatingChange?: (rating: number) => void) => {
    return (
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-1">Rate your purchases and help other buyers</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'pending'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Pending Reviews ({pendingReviews.length})
              </button>
              <button
                onClick={() => setActiveTab('submitted')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'submitted'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Reviews ({submittedReviews.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'pending' ? (
              <div className="space-y-4">
                {pendingReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending reviews</h3>
                    <p className="text-gray-600">
                      Complete some orders to leave reviews for sellers.
                    </p>
                  </div>
                ) : (
                  pendingReviews.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                              <Package size={20} className="text-green-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{order.cropName}</h3>
                              <p className="text-sm text-gray-600">from {order.sellerName}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <p><strong>Order ID:</strong> {order.id}</p>
                              <p><strong>Quantity:</strong> {order.quantity} {order.unit}</p>
                            </div>
                            <div>
                              <p><strong>Total:</strong> ₱{order.totalPrice.toLocaleString()}</p>
                              <p><strong>Completed:</strong> {order.completedDate.toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center">
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                Delivered
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenReviewModal(order)}
                          className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center space-x-2"
                        >
                          <Star size={20} />
                          <span>Rate Seller</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {submittedReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                    <p className="text-gray-600">
                      Your submitted reviews will appear here.
                    </p>
                  </div>
                ) : (
                  submittedReviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <User size={20} className="text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{review.cropName}</h3>
                              <p className="text-sm text-gray-600">from {review.sellerName}</p>
                            </div>
                            <div className="text-right">
                              {renderStars(review.rating)}
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDistanceToNow(review.reviewDate)} ago
                              </p>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Order #{review.orderId}</span>
                            <span>Review submitted on {review.reviewDate.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Total Reviews</h3>
            <p className="text-3xl font-bold text-green-600">{submittedReviews.length}</p>
            <p className="text-sm text-gray-600">Reviews submitted</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Average Rating Given</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {submittedReviews.length > 0 
                ? (submittedReviews.reduce((sum, r) => sum + r.rating, 0) / submittedReviews.length).toFixed(1)
                : '0.0'
              }
            </p>
            <p className="text-sm text-gray-600">Out of 5 stars</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Pending Reviews</h3>
            <p className="text-3xl font-bold text-blue-600">{pendingReviews.length}</p>
            <p className="text-sm text-gray-600">Awaiting your feedback</p>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Rate Your Experience</h2>
              <p className="text-gray-600 mt-1">{selectedOrder.cropName} from {selectedOrder.sellerName}</p>
            </div>
            
            <form onSubmit={handleSubmitReview} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How would you rate this seller?
                </label>
                <div className="flex justify-center">
                  {renderStars(reviewForm.rating, true, (rating) => 
                    setReviewForm(prev => ({ ...prev, rating }))
                  )}
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">
                  {reviewForm.rating === 0 && 'Select a rating'}
                  {reviewForm.rating === 1 && 'Poor'}
                  {reviewForm.rating === 2 && 'Fair'}
                  {reviewForm.rating === 3 && 'Good'}
                  {reviewForm.rating === 4 && 'Very Good'}
                  {reviewForm.rating === 5 && 'Excellent'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share your experience (optional)
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  placeholder="Tell other buyers about your experience with this seller..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={reviewForm.rating === 0}
                  className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
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