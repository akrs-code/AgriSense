import React, { useState } from 'react';
import { Star, User, Filter, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  buyerName: string;
  rating: number;
  comment: string;
  cropName: string;
  reviewDate: Date;
  verified: boolean;
}

export const RatingsReviews: React.FC = () => {
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterCrop, setFilterCrop] = useState<string>('all');

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: '1',
      buyerName: 'Maria Santos',
      rating: 5,
      comment: 'Excellent quality rice! Very fresh and clean. Will definitely order again.',
      cropName: 'Premium Rice',
      reviewDate: new Date('2024-01-18'),
      verified: true
    },
    {
      id: '2',
      buyerName: 'Juan Dela Cruz',
      rating: 4,
      comment: 'Good quality corn, delivered on time. Slightly expensive but worth it.',
      cropName: 'Sweet Corn',
      reviewDate: new Date('2024-01-15'),
      verified: true
    },
    {
      id: '3',
      buyerName: 'Ana Rodriguez',
      rating: 5,
      comment: 'Amazing farmer! Very responsive and professional. The rice quality is top-notch.',
      cropName: 'Premium Rice',
      reviewDate: new Date('2024-01-12'),
      verified: true
    },
    {
      id: '4',
      buyerName: 'Carlos Mendoza',
      rating: 4,
      comment: 'Fresh vegetables, good packaging. Delivery was a bit delayed but overall satisfied.',
      cropName: 'Mixed Vegetables',
      reviewDate: new Date('2024-01-10'),
      verified: true
    }
  ];

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const totalReviews = reviews.length;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / totalReviews) * 100
  }));

  const crops = ['all', ...Array.from(new Set(reviews.map(r => r.cropName)))];

  const filteredReviews = reviews.filter(review => {
    const matchesRating = filterRating === null || review.rating === filterRating;
    const matchesCrop = filterCrop === 'all' || review.cropName === filterCrop;
    return matchesRating && matchesCrop;
  });

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Ratings & Reviews</h1>
          <p className="text-gray-600 mt-1">See what buyers think about your products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Rating Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Overall Rating */}
              <div className="mt-8 text-center">
                <div className="text-6xl font-bold text-gray-900 mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center mb-2">
                  {renderStars(Math.round(averageRating), 24)}
                </div>
                <p className="text-gray-600">
                  Based on {totalReviews} reviews
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="lg:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-4">Rating Distribution</h3>
                <div className="space-y-3">
                  {ratingDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 w-16">
                        <span className="text-sm font-medium">{rating}</span>
                        <Star size={14} className="text-yellow-400 fill-current" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalReviews}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Star size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">5-Star Reviews</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {reviews.filter(r => r.rating === 5).length}
                </p>
                <p className="text-xs text-green-600 font-medium">
                  {((reviews.filter(r => r.rating === 5).length / totalReviews) * 100).toFixed(0)}% of total
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">95%</p>
                <p className="text-xs text-green-600 font-medium">Excellent</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <User size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterRating || ''}
                  onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>

                <select
                  value={filterCrop}
                  onChange={(e) => setFilterCrop(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {crops.map(crop => (
                    <option key={crop} value={crop}>
                      {crop === 'all' ? 'All Crops' : crop}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Customer Reviews ({filteredReviews.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredReviews.length === 0 ? (
              <div className="p-12 text-center">
                <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews found</h3>
                <p className="text-gray-600">
                  Try adjusting your filters to see more reviews.
                </p>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <div key={review.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                            <span>{review.buyerName}</span>
                            {review.verified && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Verified Purchase
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">{review.cropName}</p>
                        </div>
                        <div className="text-right">
                          {renderStars(review.rating)}
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(review.reviewDate)} ago
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};