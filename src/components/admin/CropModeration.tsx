import React, { useState } from 'react';
import { Package, Eye, CheckCircle, XCircle, Flag, Search, Filter, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CropListing {
  id: string;
  cropName: string;
  variety: string;
  farmerName: string;
  farmerId: string;
  price: number;
  unit: string;
  quantity: number;
  submissionDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  images: string[];
  description: string;
  location: string;
  isSuspicious: boolean;
  flagReason?: string;
}

export const CropModeration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'flagged' | 'rejected'>('pending');
  const [selectedCrop, setSelectedCrop] = useState<CropListing | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFarmer, setFilterFarmer] = useState('all');

  // Mock crop listings data
  const cropListings: CropListing[] = [
    {
      id: 'crop-1',
      cropName: 'Premium Rice',
      variety: 'Jasmine',
      farmerName: 'Juan Dela Cruz',
      farmerId: 'farmer-1',
      price: 45,
      unit: 'kg',
      quantity: 500,
      submissionDate: new Date('2024-01-20'),
      status: 'pending',
      images: ['https://images.pexels.com/photos/164504/pexels-photo-164504.jpeg'],
      description: 'High-quality jasmine rice, freshly harvested from organic farm.',
      location: 'Cabanatuan, Nueva Ecija',
      isSuspicious: false
    },
    {
      id: 'crop-2',
      cropName: 'Sweet Corn',
      variety: 'Golden Sweet',
      farmerName: 'Maria Santos',
      farmerId: 'farmer-2',
      price: 35,
      unit: 'kg',
      quantity: 200,
      submissionDate: new Date('2024-01-18'),
      status: 'flagged',
      images: ['https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg'],
      description: 'Fresh sweet corn perfect for boiling and grilling.',
      location: 'Manila, Metro Manila',
      isSuspicious: true,
      flagReason: 'Urban location suspicious for corn farming'
    },
    {
      id: 'crop-3',
      cropName: 'Organic Tomatoes',
      variety: 'Cherry',
      farmerName: 'Carlos Rodriguez',
      farmerId: 'farmer-3',
      price: 80,
      unit: 'kg',
      quantity: 100,
      submissionDate: new Date('2024-01-15'),
      status: 'approved',
      images: ['https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg'],
      description: 'Organic cherry tomatoes grown without pesticides.',
      location: 'Tarlac City, Tarlac',
      isSuspicious: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'flagged':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Eye size={16} className="text-yellow-600" />;
      case 'approved':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-600" />;
      case 'flagged':
        return <Flag size={16} className="text-orange-600" />;
      default:
        return <Eye size={16} className="text-gray-600" />;
    }
  };

  const filteredCrops = cropListings.filter(crop => {
    const matchesTab = crop.status === activeTab;
    const matchesSearch = searchQuery === '' || 
      crop.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFarmer = filterFarmer === 'all' || crop.farmerId === filterFarmer;
    
    return matchesTab && matchesSearch && matchesFarmer;
  });

  const handleApproveCrop = (cropId: string) => {
    console.log('Approving crop:', cropId);
    // In a real app, this would make an API call
  };

  const handleRejectCrop = (cropId: string) => {
    console.log('Rejecting crop:', cropId);
    // In a real app, this would make an API call
  };

  const handleFlagCrop = (cropId: string, reason: string) => {
    console.log('Flagging crop:', cropId, 'Reason:', reason);
    // In a real app, this would make an API call
  };

  const stats = [
    {
      title: 'Total Listings',
      value: cropListings.length,
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Pending Review',
      value: cropListings.filter(c => c.status === 'pending').length,
      icon: Eye,
      color: 'bg-yellow-500'
    },
    {
      title: 'Flagged',
      value: cropListings.filter(c => c.status === 'flagged').length,
      icon: Flag,
      color: 'bg-orange-500'
    },
    {
      title: 'Suspicious',
      value: cropListings.filter(c => c.isSuspicious).length,
      icon: AlertTriangle,
      color: 'bg-red-500'
    }
  ];

  const farmers = Array.from(new Set(cropListings.map(c => ({ id: c.farmerId, name: c.farmerName }))));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Crop Listing Moderation</h1>
          <p className="text-gray-600 mt-1">Review and moderate crop listings from farmers</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['pending', 'approved', 'flagged', 'rejected'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} 
                  ({cropListings.filter(c => c.status === tab).length})
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search crops or farmers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={filterFarmer}
                  onChange={(e) => setFilterFarmer(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Farmers</option>
                  {farmers.map(farmer => (
                    <option key={farmer.id} value={farmer.id}>{farmer.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Crop Listings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Listings ({filteredCrops.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredCrops.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-600">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : `No ${activeTab} listings at the moment`
                  }
                </p>
              </div>
            ) : (
              filteredCrops.map((crop) => (
                <div key={crop.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={crop.images[0]}
                        alt={crop.cropName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                            <span>{crop.cropName} - {crop.variety}</span>
                            {crop.isSuspicious && (
                              <AlertTriangle size={16} className="text-red-500" title="Suspicious listing" />
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">by {crop.farmerName}</p>
                        </div>
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(crop.status)}`}>
                          {getStatusIcon(crop.status)}
                          <span className="capitalize">{crop.status}</span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <p><strong>Price:</strong> ₱{crop.price}/{crop.unit}</p>
                          <p><strong>Quantity:</strong> {crop.quantity} {crop.unit}</p>
                        </div>
                        <div>
                          <p><strong>Location:</strong> {crop.location}</p>
                          <p><strong>Submitted:</strong> {crop.submissionDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p><strong>Listing ID:</strong> {crop.id}</p>
                          <p><strong>Farmer ID:</strong> {crop.farmerId}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">{crop.description}</p>

                      {crop.flagReason && (
                        <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-sm text-orange-800">
                            <strong>Flag Reason:</strong> {crop.flagReason}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedCrop(crop)}
                          className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Eye size={16} />
                          <span>View Details</span>
                        </button>
                        
                        {crop.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveCrop(crop.id)}
                              className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectCrop(crop.id)}
                              className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleFlagCrop(crop.id, 'Suspicious listing')}
                              className="bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                            >
                              Flag
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Crop Detail Modal */}
      {selectedCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Crop Listing Details</h2>
                <button
                  onClick={() => setSelectedCrop(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Product Images</h3>
                  <div className="space-y-4">
                    {selectedCrop.images.map((image, index) => (
                      <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`${selectedCrop.cropName} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Product Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Crop:</strong> {selectedCrop.cropName} - {selectedCrop.variety}</p>
                      <p><strong>Price:</strong> ₱{selectedCrop.price} per {selectedCrop.unit}</p>
                      <p><strong>Quantity:</strong> {selectedCrop.quantity} {selectedCrop.unit}</p>
                      <p><strong>Location:</strong> {selectedCrop.location}</p>
                      <p><strong>Description:</strong> {selectedCrop.description}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Farmer Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {selectedCrop.farmerName}</p>
                      <p><strong>Farmer ID:</strong> {selectedCrop.farmerId}</p>
                      <p><strong>Submission Date:</strong> {selectedCrop.submissionDate.toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCrop.status)}`}>
                      {getStatusIcon(selectedCrop.status)}
                      <span className="capitalize">{selectedCrop.status}</span>
                    </span>
                    
                    {selectedCrop.isSuspicious && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-2 text-red-800">
                          <AlertTriangle size={16} />
                          <span className="font-medium">Suspicious Activity Detected</span>
                        </div>
                        {selectedCrop.flagReason && (
                          <p className="text-sm text-red-700 mt-1">{selectedCrop.flagReason}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedCrop.status === 'pending' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      handleApproveCrop(selectedCrop.id);
                      setSelectedCrop(null);
                    }}
                    className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    Approve Listing
                  </button>
                  <button
                    onClick={() => {
                      handleRejectCrop(selectedCrop.id);
                      setSelectedCrop(null);
                    }}
                    className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    Reject Listing
                  </button>
                  <button
                    onClick={() => {
                      handleFlagCrop(selectedCrop.id, 'Requires further review');
                      setSelectedCrop(null);
                    }}
                    className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                  >
                    Flag as Suspicious
                  </button>
                </div>
              )}
              
              <button
                onClick={() => setSelectedCrop(null)}
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};