import React from 'react';
import { User, Mail, Phone, MapPin, Calendar, Shield, Camera } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { formatDistanceToNow } from 'date-fns';

export const UserInfoSection: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return user.isVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    if (user.role === 'seller') {
      const seller = user as any;
      return seller.verificationStatus || (user.isVerified ? 'Verified' : 'Unverified');
    }
    return user.isVerified ? 'Verified' : 'Unverified';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start space-x-6">
        {/* Profile Photo */}
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User size={32} className="text-green-600" />
            )}
          </div>
          <button className="absolute bottom-0 right-0 bg-green-500 text-white p-1.5 rounded-full hover:bg-green-600 transition-colors">
            <Camera size={12} />
          </button>
        </div>

        {/* User Details */}
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-gray-600">ID: {user.id}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                {user.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-gray-400" />
                <span className="text-gray-700">{user.email || 'No email provided'}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-700">{user.phone || 'No phone provided'}</span>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-gray-700">{user.location?.address || 'No location set'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-gray-700">
                  Joined {formatDistanceToNow(user.createdAt)} ago
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <Shield size={16} className="text-gray-400" />
                <span className="text-gray-700">
                  Last active: {formatDistanceToNow(user.updatedAt)} ago
                </span>
              </div>

              {user.role === 'seller' && (user as any).businessName && (
                <div className="flex items-center space-x-3">
                  <User size={16} className="text-gray-400" />
                  <span className="text-gray-700">{(user as any).businessName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Stats for Sellers */}
          {user.role === 'seller' && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{(user as any).rating || '0.0'}</div>
                <div className="text-xs text-gray-600">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{(user as any).reviewCount || '0'}</div>
                <div className="text-xs text-gray-600">Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  ₱{((user as any).totalSales || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Total Sales</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};