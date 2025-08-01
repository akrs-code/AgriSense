import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, MapPin, Calendar, BarChart3, Target, Wifi, WifiOff, ChevronUp, ChevronDown, Info } from 'lucide-react';
import { useProductStore } from '../../stores/productStore';

export const MarketIntelligence: React.FC = () => {
  const { marketPrices } = useProductStore();
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // State for collapsible sections
  const [isPricesCollapsed, setIsPricesCollapsed] = useState(false);
  const [isInsightsCollapsed, setIsInsightsCollapsed] = useState(false);
  const [isPriceHistoryCollapsed, setIsPriceHistoryCollapsed] = useState(false);

  // Mock data for demonstration
  const demandInsights = [
    {
      crop: 'Sweet Corn',
      demand: 'High',
      trend: 'up',
      percentage: '+25%',
      reason: 'Increased demand from local restaurants'
    },
    {
      crop: 'Tomatoes',
      demand: 'Medium',
      trend: 'stable',
      percentage: '0%',
      reason: 'Steady demand from wet markets'
    },
    {
      crop: 'Rice',
      demand: 'High',
      trend: 'up',
      percentage: '+15%',
      reason: 'Export opportunities opening'
    }
  ];

  const priceHistory = [
    { month: 'Jan', rice: 42, corn: 35, tomato: 80 },
    { month: 'Feb', rice: 45, corn: 38, tomato: 75 },
    { month: 'Mar', rice: 48, corn: 40, tomato: 85 },
    { month: 'Apr', rice: 46, corn: 42, tomato: 90 },
    { month: 'May', rice: 50, corn: 45, tomato: 88 }
  ];

  const regions = [
    { value: 'all', label: 'All Regions' },
    { value: 'Central Luzon', label: 'Central Luzon' },
    { value: 'CALABARZON', label: 'CALABARZON' },
    { value: 'NCR', label: 'NCR' }
  ];

  // Filter market prices based on the selected region
  const filteredMarketPrices = marketPrices.filter(price => {
    if (selectedRegion === 'all') {
      return true;
    }
    return price.region.toLowerCase().includes(selectedRegion.toLowerCase());
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'down':
        return <TrendingDown size={16} className="text-red-500" />;
      default:
        return <Minus size={16} className="text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Market Intelligence</h1>
              <p className="text-gray-600 mt-1">Real-time crop prices and market insights</p>
            </div>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <Wifi size={20} />
                  <span className="text-sm font-medium">Live Data</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-orange-600">
                  <WifiOff size={20} />
                  <span className="text-sm font-medium">Cached Data</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Region Filter */}
        <div className="mb-6 flex justify-end">
          <label htmlFor="region-select" className="sr-only">Filter by region</label>
          <select
            id="region-select"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
          >
            {regions.map(region => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
        </div>

        {/* Current Market Prices */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-200 cursor-pointer" onClick={() => setIsPricesCollapsed(!isPricesCollapsed)}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <span>Current Market Prices</span>
                <span className="text-sm text-gray-500 font-normal">
                  (Last updated: {new Date().toLocaleString()})
                </span>
              </h2>
              <button className="text-gray-500 hover:text-gray-900 transition-colors">
                {isPricesCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
              </button>
            </div>
          </div>

          {!isPricesCollapsed && (
            <div className="p-6">
              {filteredMarketPrices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMarketPrices.map((price) => (
                    <div key={price.id} className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{price.crop_name}</h3>
                        {getTrendIcon(price.trend)}
                      </div>
                      
                      {price.specification && (
                        <p className="text-sm font-medium text-gray-800 bg-green-200 rounded-md px-2 py-1 mb-1 inline-block">
                          {price.specification}
                        </p>
                      )}
                      {price.category && (
                        <p className="text-xs text-gray-500 mb-1">Category: {price.category}</p>
                      )}

                      <div className="mb-2 mt-3">
                        <span className="text-3xl font-bold text-green-600">₱{price.price}</span>
                        <span className="text-gray-600 ml-2">per {price.unit}</span>
                      </div>
                      
                      <div className="flex flex-col space-y-1 text-sm">
                        <div className="flex items-center text-gray-600">
                          <MapPin size={14} className="mr-1" />
                          <span>{price.region}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar size={14} className="mr-1" />
                          <span>Date: {new Date(price.date).toLocaleDateString()}</span>
                        </div>
                        {price.source && (
                          <div className="flex items-center text-gray-600">
                            <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200 rounded-full">Source: {price.source}</span>
                          </div>
                        )}
                        <div className={`font-medium ${getTrendColor(price.trend)} mt-2`}>
                          {price.trend === 'up' && 'Trending Up'}
                          {price.trend === 'down' && 'Trending Down'}
                          {price.trend === 'stable' && 'Stable Trend'}
                          {price.trend === 'N/A' && 'Trend: Not Available'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Info size={48} className="mx-auto mb-4" />
                  <h3 className="text-xl font-semibold">Data not available for this region.</h3>
                  <p className="mt-2">Try selecting a different region or check back later.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Demand Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-200 cursor-pointer" onClick={() => setIsInsightsCollapsed(!isInsightsCollapsed)}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <Target className="text-blue-600" size={24} />
                <span>Crop Demand Insights</span>
              </h2>
              <button className="text-gray-500 hover:text-gray-900 transition-colors">
                {isInsightsCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
              </button>
            </div>
          </div>

          {!isInsightsCollapsed && (
            <div className="p-6">
              <p className="text-gray-600 mb-4">What's in demand this month</p>
              <div className="space-y-4">
                {demandInsights.map((insight, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🌾</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{insight.crop}</h3>
                        <p className="text-sm text-gray-600">{insight.reason}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className={`font-semibold ${
                          insight.demand === 'High' ? 'text-green-600' :
                          insight.demand === 'Medium' ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {insight.demand} Demand
                        </span>
                        {getTrendIcon(insight.trend)}
                      </div>
                      <div className={`text-sm ${getTrendColor(insight.trend)}`}>
                        {insight.percentage}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Price History Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200 cursor-pointer" onClick={() => setIsPriceHistoryCollapsed(!isPriceHistoryCollapsed)}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <BarChart3 className="text-purple-600" size={24} />
                <span>Price Trends (Last 5 Months)</span>
              </h2>
              <button className="text-gray-500 hover:text-gray-900 transition-colors">
                {isPriceHistoryCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
              </button>
            </div>
          </div>

          {!isPriceHistoryCollapsed && (
            <div className="p-6">
              <div className="space-y-6">
                {/* Simple chart representation */}
                <div className="grid grid-cols-5 gap-4">
                  {priceHistory.map((month, index) => (
                    <div key={index} className="text-center">
                      <div className="mb-2">
                        <div className="space-y-1">
                          <div 
                            className="bg-green-500 rounded-t"
                            style={{ height: `${month.rice}px` }}
                            title={`Rice: ₱${month.rice}`}
                          ></div>
                          <div 
                            className="bg-yellow-500"
                            style={{ height: `${month.corn}px` }}
                            title={`Corn: ₱${month.corn}`}
                          ></div>
                          <div 
                            className="bg-red-500 rounded-b"
                            style={{ height: `${month.tomato * 0.5}px` }}
                            title={`Tomato: ₱${month.tomato}`}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-700">{month.month}</div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Rice</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>Corn</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Tomato</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Offline Notice */}
        {!isOnline && (
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <WifiOff className="text-orange-600" size={20} />
              <div>
                <h3 className="font-semibold text-orange-900">Offline Mode</h3>
                <p className="text-sm text-orange-800">
                  You're viewing cached market data. Connect to internet for real-time updates.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
