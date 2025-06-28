import React, { useState } from 'react';
import { Star, User, Package } from 'lucide-react';
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
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CompletedOrder | null>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: ''
  });
  const [reportForm, setReportForm] = useState({
    reason: '',
    comment: ''
  });

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

  const submittedReviews: Review[] = [
    {
      id: 'rev-1',
      orderId: 'ORD-003',
      cropName: 'Fresh Tomatoes',
      sellerName: 'Rodriguez Organic Farm',
      rating: 5,
      comment: 'Excellent quality tomatoes! Very fresh and delivered on time.',
      reviewDate: new Date('2024-01-15')
    },
    {
      id: 'rev-2',
      orderId: 'ORD-004',
      cropName: 'Organic Lettuce',
      sellerName: 'Green Valley Farm',
      rating: 4,
      comment: 'Good quality lettuce. Packaging could be improved.',
      reviewDate: new Date('2024-01-12')
    }
  ];

  const pendingReviews = completedOrders.filter(order => !order.hasReview);

  const handleOpenReviewModal = (order: CompletedOrder) => {
    setSelectedOrder(order);
    setReviewForm({ rating: 0, comment: '' });
    setShowReviewModal(true);
  };

  const handleOpenReportModal = (order: CompletedOrder) => {
    setSelectedOrder(order);
    setReportForm({ reason: '', comment: '' });
    setShowReportModal(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || reviewForm.rating === 0) return;

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

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || reportForm.reason === '') return;

    console.log('Submitting report:', {
      orderId: selectedOrder.id,
      sellerId: selectedOrder.sellerId,
      reason: reportForm.reason,
      comment: reportForm.comment
    });

    setShowReportModal(false);
    setSelectedOrder(null);
    setReportForm({ reason: '', comment: '' });
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-1">Rate your purchases and help other buyers</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending' ? 'border-green-500 text-green-600' : 'text-gray-500'
                }`}
              >
                Pending Reviews ({pendingReviews.length})
              </button>
              <button
                onClick={() => setActiveTab('submitted')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'submitted' ? 'border-green-500 text-green-600' : 'text-gray-500'
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
                    <p className="text-gray-600">Complete some orders to leave reviews for sellers.</p>
                  </div>
                ) : (
                  pendingReviews.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between flex-wrap gap-4">
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

                        <div className="flex flex-col md:flex-row gap-2">
                          <button
                            onClick={() => handleOpenReviewModal(order)}
                            className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center space-x-2"
                          >
                            <Star size={20} />
                            <span>Rate Seller</span>
                          </button>

                          <button
                            onClick={() => handleOpenReportModal(order)}
                            className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center space-x-2"
                          >
                            <User size={20} />
                            <span>Report Seller</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {submittedReviews.map((review) => (
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
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">Total Reviews</h3>
            <p className="text-3xl font-bold text-green-600">{submittedReviews.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">Average Rating Given</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {submittedReviews.length > 0 
                ? (submittedReviews.reduce((sum, r) => sum + r.rating, 0) / submittedReviews.length).toFixed(1)
                : '0.0'
              }
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">Pending Reviews</h3>
            <p className="text-3xl font-bold text-blue-600">{pendingReviews.length}</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showReviewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <form onSubmit={handleSubmitReview} className="p-6 space-y-6">
              <h2 className="text-xl font-bold">Rate Your Experience</h2>
              <p className="text-sm text-gray-600">{selectedOrder.cropName} from {selectedOrder.sellerName}</p>
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
                className="w-full border rounded-lg px-3 py-2"
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg flex-1">
                  Submit
                </button>
                <button type="button" onClick={() => setShowReviewModal(false)} className="border px-4 py-2 rounded-lg flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReportModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <form onSubmit={handleSubmitReport} className="p-6 space-y-6">
              <h2 className="text-xl font-bold">Report Seller</h2>
              <p className="text-sm text-gray-600">{selectedOrder.cropName} from {selectedOrder.sellerName}</p>
              <select
                required
                value={reportForm.reason}
                onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select a reason</option>
                <option value="fraud">Suspected Fraud</option>
                <option value="fake">Fake Products</option>
                <option value="misleading">Misleading Info</option>
                <option value="inappropriate">Inappropriate Behavior</option>
              </select>
              <textarea
                placeholder="Details (optional)"
                rows={4}
                value={reportForm.comment}
                onChange={(e) => setReportForm({ ...reportForm, comment: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded-lg flex-1">
                  Submit Report
                </button>
                <button type="button" onClick={() => setShowReportModal(false)} className="border px-4 py-2 rounded-lg flex-1">
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
