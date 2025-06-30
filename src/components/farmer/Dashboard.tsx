import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wheat,
  TrendingUp,
  MessageSquare,
  DollarSign,
  MapPin,
  Users,
  Star,
  Plus
} from 'lucide-react';
import { useCropStore } from '../../stores/cropStore';
import { useAuthStore } from '../../stores/authStore';

export const FarmerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { crops } = useCropStore();
  const { user } = useAuthStore();

  const farmerCrops = crops.filter(crop => crop.farmerId === user?.id);
  const totalRevenue = farmerCrops.reduce(
    (sum, crop) => sum + crop.quantity * crop.pricePerUnit,
    0
  );
  const availableCrops = farmerCrops.filter(crop => crop.isAvailable).length;

  const stats = [
    {
      title: 'Active Listings',
      value: availableCrops,
      icon: Wheat,
      color: 'bg-green-500',
      change: '+12%'
    },
    {
      title: 'Total Revenue',
      value: `₱${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-blue-500',
      change: '+8%'
    },
    {
      title: 'Inquiries',
      value: '23',
      icon: MessageSquare,
      color: 'bg-purple-500',
      change: '+5'
    },
    {
      title: 'Rating',
      value: '4.8',
      icon: Star,
      color: 'bg-yellow-500',
      change: '+0.1'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.name || 'Farmer'}!
            </h1>
            <p className="text-green-100 mt-1">
              <MapPin size={16} className="inline mr-1" />
              {user?.location?.address || 'No location set'}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <p className="text-green-100">Today's Weather</p>
              <p className="text-xl font-semibold">28°C ☀️</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
                <p className="text-green-600 text-xs mt-1 font-medium">
                  {stat.change}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Wheat size={16} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                New crop listing added
              </p>
              <p className="text-xs text-gray-500">Rice - Jasmine variety</p>
            </div>
            <span className="text-xs text-gray-400">2h ago</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageSquare size={16} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                New inquiry received
              </p>
              <p className="text-xs text-gray-500">From Maria Santos</p>
            </div>
            <span className="text-xs text-gray-400">4h ago</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star size={16} className="text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                New review received
              </p>
              <p className="text-xs text-gray-500">5-star rating</p>
            </div>
            <span className="text-xs text-gray-400">1d ago</span>
          </div>
        </div>
      </div>

      {/* Market Intelligence Preview */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Market Intelligence
          </h3>
          <button className="text-green-600 text-sm font-medium hover:text-green-700">
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-800">
              Rice (Central Luzon)
            </p>
            <p className="text-xl font-bold text-green-900">₱42/kg</p>
            <p className="text-xs text-green-600">+5% from last week</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800">
              Corn (Nueva Ecija)
            </p>
            <p className="text-xl font-bold text-blue-900">₱38/kg</p>
            <p className="text-xs text-blue-600">Stable</p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm font-medium text-purple-800">Most Demanded</p>
            <p className="text-lg font-bold text-purple-900">Sweet Corn</p>
            <p className="text-xs text-purple-600">High demand this month</p>
          </div>
        </div>
      </div>
    </div>
  );
};
