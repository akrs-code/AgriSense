import React from 'react';
import { MapPin, Calendar, Star, Eye } from 'lucide-react';
import { Crop } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface CropCardProps {
  crop: Crop;
  onView?: (crop: Crop) => void;
  showActions?: boolean;
}

export const CropCard: React.FC<CropCardProps> = ({ crop, onView, showActions = true }) => {
  const handleView = () => {
    if (onView) onView(crop);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'fresh': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-yellow-100 text-yellow-800';
      case 'fair': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-48">
        <img
          src={crop.images[0]}
          alt={crop.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(crop.condition)}`}>
            {crop.condition.charAt(0).toUpperCase() + crop.condition.slice(1)}
          </span>
        </div>
        {!crop.isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">SOLD OUT</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{crop.name}</h3>
            <p className="text-sm text-gray-600">{crop.variety}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-green-600">₱{crop.pricePerUnit}</p>
            <p className="text-xs text-gray-500">per {crop.unit}</p>
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{crop.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-xs text-gray-500">
            <MapPin size={12} className="mr-1" />
            <span>{crop.location.address}</span>
          </div>
          
          <div className="flex items-center text-xs text-gray-500">
            <Calendar size={12} className="mr-1" />
            <span>Harvested {formatDistanceToNow(crop.harvestDate)} ago</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star size={12} className="text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600">4.8 (23 reviews)</span>
            </div>
            <span className="text-xs text-gray-500">{crop.quantity} {crop.unit} available</span>
          </div>
        </div>

        {showActions && (
          <button
            onClick={handleView}
            className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            <Eye size={16} />
            <span>View Details</span>
          </button>
        )}
      </div>
    </div>
  );
};