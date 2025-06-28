import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Download, RefreshCw, Filter, BarChart3, MapPin, Calendar } from 'lucide-react';
import { useProductStore } from '../../stores/productStore';

export const MarketIntelligence: React.FC = () => {
  const { marketPrices } = useProductStore();
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock enhanced data for admin view
  const demandTrends = [
    {
      crop: 'Rice',
      currentDemand: 'High',
      trend: 'up',
      percentage: '+15%',
      volume: '2,500 tons',
      avgPrice: 45,
      regions: ['Central Luzon', 'CALABARZON', 'Ilocos']
    },
    {
      crop: 'Corn',
      currentDemand: 'Medium',
      trend: 'stable',
      percentage: '0%',
      volume: '1,800 tons',
      avgPrice: 38,
      regions: ['Central Luzon', 'Cagayan Valley']
    },
    {
      crop: 'Tomatoes',
      currentDemand: 'High',
      trend: 'up',
      percentage: '+25%',
      volume: '950 tons',
      avgPrice: 85,
      regions: ['Benguet', 'Nueva Ecija']
    }
  ];

  const regionalComparison = [
    { region: 'Central Luzon', rice: 45, corn: 38, tomato: 85, volume: '4,200 tons' },
    { region: 'CALABARZON', rice: 48, corn: 40, tomato: 90, volume: '3,800 tons' },
    { region: 'Ilocos', rice: 42, corn: 35, tomato: 80, volume: '2,100 tons' },
    { region: 'Cagayan Valley', rice: 44, corn: 36, tomato: 82, volume: '1,900 tons' }
  ];

  const regions = [
    { value: 'all', label: 'All Regions' },
    { value: 'central-luzon', label: 'Central Luzon' },
    { value: 'calabarzon', label: 'CALABARZON' },
    { value: 'ilocos', label: 'Ilocos' },
    { value: 'cagayan-valley', label: 'Cagayan Valley' }
  ];

  const crops = [
    { value: 'all', label: 'All Crops' },
    { value: 'rice', label: 'Rice' },
    { value: 'corn', label: 'Corn' },
    { value: 'tomato', label: 'Tomatoes' }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const handleExportPDF = () => {
    // Simulate PDF export
    const link = document.createElement('a');
    link.href = '#';
    link.download = `market-intelligence-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    // Simulate CSV export
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Region,Rice Price,Corn Price,Tomato Price,Volume\n" +
      regionalComparison.map(row => 
        `${row.region},${row.rice},${row.corn},${row.tomato},${row.volume}`
      ).join("\n");
    
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `market-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-success" />;
      case 'down':
        return <TrendingDown size={16} className="text-error" />;
      default:
        return <div className="w-4 h-4 bg-text-muted rounded-full"></div>;
    }
  };

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-neutral-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text">Market Intelligence</h1>
              <p className="text-text-muted mt-1">Monitor crop demand, prices, and market trends</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 bg-info text-white px-4 py-2 rounded-lg hover:bg-info/90 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                <span>Refresh Data</span>
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExportPDF}
                  className="flex items-center space-x-2 bg-error text-white px-4 py-2 rounded-lg hover:bg-error/90 transition-colors"
                >
                  <Download size={20} />
                  <span>Export PDF</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center space-x-2 bg-success text-white px-4 py-2 rounded-lg hover:bg-success/90 transition-colors"
                >
                  <Download size={20} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-border mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <Filter size={20} className="text-text-muted" />
              <span className="text-sm font-medium text-text">Filter by:</span>
              
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="border border-neutral-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {regions.map(region => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="border border-neutral-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {crops.map(crop => (
                  <option key={crop.value} value={crop.value}>
                    {crop.label}
                  </option>
                ))}
              </select>

              <div className="text-sm text-text-muted">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Live Crop Prices Table */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-border mb-8">
          <div className="p-6 border-b border-neutral-border">
            <div className="flex items-center space-x-2">
              <BarChart3 className="text-primary" size={24} />
              <h2 className="text-xl font-semibold text-text">Live Crop Prices</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral">
                <tr>
                  <th className="text-left py-3 px-6 font-semibold text-text">Crop</th>
                  <th className="text-left py-3 px-6 font-semibold text-text">Region</th>
                  <th className="text-left py-3 px-6 font-semibold text-text">Current Price</th>
                  <th className="text-left py-3 px-6 font-semibold text-text">Trend</th>
                  <th className="text-left py-3 px-6 font-semibold text-text">Volume</th>
                  <th className="text-left py-3 px-6 font-semibold text-text">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {marketPrices.map((price) => (
                  <tr key={price.id} className="hover:bg-neutral transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-text">{price.productName}</div>
                      <div className="text-sm text-text-muted">{price.category}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1">
                        <MapPin size={14} className="text-text-muted" />
                        <span className="text-text">{price.region}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-secondary">₱{price.averagePrice}</div>
                      <div className="text-sm text-text-muted">per {price.unit}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(price.trend)}
                        <span className={`font-medium ${
                          price.trend === 'up' ? 'text-success' :
                          price.trend === 'down' ? 'text-error' : 'text-text-muted'
                        }`}>
                          {price.trend === 'up' && '+5%'}
                          {price.trend === 'down' && '-3%'}
                          {price.trend === 'stable' && 'Stable'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-text">2,500 tons</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1 text-text-muted">
                        <Calendar size={14} />
                        <span className="text-sm">{price.lastUpdated.toLocaleTimeString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Demand Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-border mb-8">
          <div className="p-6 border-b border-neutral-border">
            <h2 className="text-xl font-semibold text-text">Monthly Demand Trends</h2>
            <p className="text-text-muted mt-1">Top crops by demand and volume</p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {demandTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-neutral rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🌾</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-text">{trend.crop}</h3>
                      <div className="flex items-center space-x-4 text-sm text-text-muted">
                        <span>Volume: {trend.volume}</span>
                        <span>Avg Price: ₱{trend.avgPrice}</span>
                        <span>Regions: {trend.regions.length}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`font-semibold ${
                        trend.currentDemand === 'High' ? 'text-success' :
                        trend.currentDemand === 'Medium' ? 'text-secondary' : 'text-text-muted'
                      }`}>
                        {trend.currentDemand} Demand
                      </span>
                      {getTrendIcon(trend.trend)}
                    </div>
                    <div className={`text-sm font-medium ${
                      trend.trend === 'up' ? 'text-success' :
                      trend.trend === 'down' ? 'text-error' : 'text-text-muted'
                    }`}>
                      {trend.percentage}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Regional Market Comparison */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-border">
          <div className="p-6 border-b border-neutral-border">
            <h2 className="text-xl font-semibold text-text">Regional Market Comparison</h2>
            <p className="text-text-muted mt-1">Price comparison across different regions</p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {regionalComparison.map((region, index) => (
                <div key={index} className="border border-neutral-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-text">{region.region}</h3>
                    <span className="text-sm text-text-muted">Volume: {region.volume}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-text-muted">Rice</div>
                      <div className="text-lg font-bold text-primary">₱{region.rice}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-text-muted">Corn</div>
                      <div className="text-lg font-bold text-secondary">₱{region.corn}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-text-muted">Tomato</div>
                      <div className="text-lg font-bold text-error">₱{region.tomato}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};