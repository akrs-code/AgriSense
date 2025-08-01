import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { OrderResponseDTO, OrderItem } from '../../types/order.types';
import { useReviewStore } from '../../stores/reviewStore';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import { SubmitReviewDTO } from '../../types/review.types';
import { User, Buyer } from '../../types/user/user.types'; // Import User and Buyer types

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderResponseDTO;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  order,
  onSuccess
}) => {
  const { user } = useAuthStore();
  const { submitReview, isLoading } = useReviewStore();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to submit a review');
      return;
    }

    // Since an order can have multiple items, let's assume this review modal is for the first item
    const firstOrderItem: OrderItem | undefined = order.order_items[0];

    if (!firstOrderItem) {
      toast.error('Cannot submit review for an order with no items.');
      return;
    }

    // Ensure the user is a buyer before proceeding
    const buyer = user as Buyer;
    if (buyer.id !== order.buyer_id) {
        toast.error('You are not authorized to review this order.');
        return;
    }

    // Construct the data payload matching the SubmitReviewDTO interface
    const reviewData: SubmitReviewDTO = {
      orderId: order.id,
      productId: firstOrderItem.product_id,
      productName: firstOrderItem.product_name,
      buyerId: user.id,
      sellerId: order.seller_id,
      sellerName: order.seller_name,
      rating,
      comment: comment.trim()
    };

    try {
      // Call the submitReview action from the Zustand store with the correct DTO
      await submitReview(reviewData);

      toast.success('Review submitted successfully!');
      onSuccess();
      onClose();
      
      // Reset form
      setRating(0);
      setComment('');
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  const renderStars = () => {
    return (
      <div className="flex items-center justify-center space-x-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={32}
              className={`${
                star <= (hoveredRating || rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getRatingText = () => {
    const ratingTexts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return ratingTexts[hoveredRating || rating] || 'Select a rating';
  };

  const firstOrderItem = order.order_items[0];
  if (!firstOrderItem) {
    // Render a message or handle the empty order case gracefully
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order has no items</h2>
          <p>This order cannot be reviewed.</p>
          <button
            onClick={handleClose}
            className="mt-4 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Rate Your Experience</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Info */}
          <div className="flex items-center space-x-4">
            <img
              src={firstOrderItem.product_image}
              alt={firstOrderItem.product_name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{firstOrderItem.product_name}</h3>
              <p className="text-sm text-gray-600">from {order.seller_name}</p>
              <p className="text-xs text-gray-500">Order #{order.id}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How was your experience?</h3>
            {renderStars()}
            <p className="text-sm text-gray-600 font-medium">{getRatingText()}</p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share your thoughts (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Tell other buyers about your experience with this product and seller..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{comment.length}/500 characters</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rating === 0 || isLoading}
              className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
