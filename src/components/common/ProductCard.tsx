import React from 'react';
import { MapPin, Calendar, Star, Heart } from 'lucide-react';
import { Product } from '../../types/product.types';
import { formatDistanceToNow } from 'date-fns';

interface ProductCardProps {
  product: Product;
  onView?: (product: Product) => void;
  showActions?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onView,
  showActions = true
}) => {
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'fresh': return 'bg-success-bg text-success';
      case 'good': return 'bg-secondary-light text-secondary-dark';
      case 'fair': return 'bg-error-bg text-error';
      default: return 'bg-neutral text-text-muted';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-border overflow-hidden hover:shadow-md transition-all duration-300 group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
        <div className="absolute top-3 left-3">
          {product.condition && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(product.condition)}`}>
              {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
            <Heart size={16} className="text-text-muted hover:text-error" />
          </button>
        </div>
        {product.quantity === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">OUT OF STOCK</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-text text-lg leading-tight">{product.name}</h3>
            <p className="text-sm text-text-muted">{product.variety}</p>
          </div>
          <div className="text-right ml-2">
            <p className="text-xl font-bold text-secondary">₱{product.price}</p>
            <p className="text-xs text-text-muted">per {product.unit}</p>
          </div>
        </div>

        <p className="text-sm text-text mb-3 line-clamp-2">{product.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-xs text-text-muted">
            <MapPin size={12} className="mr-1 flex-shrink-0" />
            <span className="truncate">{product.location ? product.location.address : 'N/A'}</span>
          </div>

          <div className="flex items-center text-xs text-text-muted">
            <Calendar size={12} className="mr-1 flex-shrink-0" />
            <span>Harvested {formatDistanceToNow(product.harvest_date)} ago</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star size={12} className="text-secondary fill-current" />
              <span className="text-xs text-text-muted">4.8 (23 reviews)</span>
            </div>
            <span className="text-xs text-text-muted font-medium">
              {product.quantity} {product.unit} available
            </span>
          </div>
        </div>

        {showActions && (
          <button
            onClick={() => onView?.(product)}
            className="w-full bg-primary text-white py-2.5 px-4 rounded-lg font-medium hover:bg-primary-dark transition-colors transform hover:scale-[1.02] active:scale-[0.98]"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
};