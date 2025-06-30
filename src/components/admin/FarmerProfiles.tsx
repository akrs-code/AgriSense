import React, { useState } from 'react';
import { Users, MapPin, Calendar, Eye, CheckCircle, XCircle, Filter, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useFarmerModerationStore, FarmerProfile } from '../../stores/farmerModerationStore';

export const FarmerProfiles: React.FC = () => {
  const { 
    farmerProfiles, 
    isLoading, 
    approveFarmer, 
    rejectFarmer, 
    getFarmersByStatus 
  } = useFarmerModerationStore();
  
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actioningFarmerId, setActioningFarmerId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
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
      default:
        return <Eye size={16} className="text-gray-600" />;
    }
  };

  const filteredFarmers = getFarmersByStatus(activeTab).filter(farmer => {
    const matchesSearch = searchQuery === '' || 
      farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleApproveFarmer = async (farmerId: string) => {
    setActioningFarmerId(farmerId);
    try {
      await approveFarmer(farmerId);
    } finally {
      setActioningFarmerId(null);
    }
  };

  const handleRejectFarmer = async () => {
    if (!selectedFarmer) return;
    
    setActioningFarmerId(selectedFarmer.id);
    try {
      await rejectFarmer(selectedFarmer.id, rejectReason);
      setShowRejectModal(false);
      setSelectedFarmer(null);
      setRejectReason('');
    } finally {
      setActioningFarmerId(null);
    }
  };

  const openMapModal = (farmer: FarmerProfile) => {
    setSelectedFarmer(farmer);
    setShowMapModal(true);
  };

  const stats = [
    {
      title: 'Total Farmers',
      value: farmerProfiles.length,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Pending Review',
      value: getFarmersByStatus('pending').length,
      icon: Eye,
      color: 'bg-yellow-500'
    },
    {
      title: 'Approved',
      value: getFarmersByStatus('approved').length,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Rejected',
      value: getFarmersByStatus('rejected').length,
      icon: XCircle,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Farmer Profiles</h1>
              <p className="text-gray-600 mt-1">Review and manage farmer registrations</p>
            </div>
            <button
              onClick={() => setShowMapModal(true)}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <MapPin size={20} />
              <span>View All on Map</span>
            </button>
          </div>
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

        {/* Tabs and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['pending', 'approved', 'rejected'].map((tab) => (
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
                  ({getFarmersByStatus(tab as any).length})
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
                    placeholder="Search farmers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Farmers List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Farmers ({filteredFarmers.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredFarmers.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No farmers found</h3>
                <p className="text-gray-600">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : `No ${activeTab} farmers at the moment`
                  }
                </p>
              </div>
            ) : (
              filteredFarmers.map((farmer) => (
                <div key={farmer.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex md:items-center md:flex-row flex-col justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-1- mb-2">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Users size={20} className="text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{farmer.name}</h3>
                          <p className="text-sm text-gray-600">{farmer.businessName}</p>
                        </div>
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(farmer.status)}`}>
                          {getStatusIcon(farmer.status)}
                          <span className="capitalize">{farmer.status}</span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 md:grid-cols-3 md:gap-10 text-sm text-gray-600">
                        <div>
                          <p><strong>Email:</strong> {farmer.email}</p>
                          <p><strong>Phone:</strong> {farmer.phone}</p>
                        </div>
                        <div>
                          <p><strong>Location:</strong> {farmer.location.address}</p>
                          <p><strong>Coordinates:</strong> {farmer.location.lat.toFixed(4)}, {farmer.location.lng.toFixed(4)}</p>
                        </div>
                        <div>
                          <p><strong>Registered:</strong> {farmer.registrationDate.toLocaleDateString()}</p>
                          <p><strong>Documents:</strong> {farmer.documentsSubmitted ? 'Submitted' : 'Pending'}</p>
                        </div>
                      </div>

                      {farmer.verificationNotes && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Notes:</strong> {farmer.verificationNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center mt-10 space-x-2 md:ml-4">
                      <button
                        onClick={() => setSelectedFarmer(farmer)}
                        className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye size={16}/>
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={() => openMapModal(farmer)}
                        className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <MapPin size={16} />
                        <span>View on Map</span>
                      </button>
                      
                      {farmer.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveFarmer(farmer.id)}
                            disabled={isLoading || actioningFarmerId === farmer.id}
                            className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                          >
                            {actioningFarmerId === farmer.id ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFarmer(farmer);
                              setShowRejectModal(true);
                            }}
                            disabled={isLoading || actioningFarmerId === farmer.id}
                            className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Farmer Detail Modal */}
      {selectedFarmer && !showMapModal && !showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Farmer Profile</h2>
                <button
                  onClick={() => setSelectedFarmer(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedFarmer.name}</p>
                    <p><strong>Email:</strong> {selectedFarmer.email}</p>
                    <p><strong>Phone:</strong> {selectedFarmer.phone}</p>
                    <p><strong>Business:</strong> {selectedFarmer.businessName}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Location & Status</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Address:</strong> {selectedFarmer.location.address}</p>
                    <p><strong>Coordinates:</strong> {selectedFarmer.location.lat.toFixed(4)}, {selectedFarmer.location.lng.toFixed(4)}</p>
                    <p><strong>Registered:</strong> {selectedFarmer.registrationDate.toLocaleDateString()}</p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedFarmer.status)}`}>
                        {selectedFarmer.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {selectedFarmer.status === 'pending' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      handleApproveFarmer(selectedFarmer.id);
                      setSelectedFarmer(null);
                    }}
                    disabled={isLoading}
                    className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Approving...' : 'Approve Farmer'}
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectModal(true);
                    }}
                    disabled={isLoading}
                    className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    Reject Application
                  </button>
                </div>
              )}
              
              <button
                onClick={() => setSelectedFarmer(null)}
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedFarmer ? `${selectedFarmer.name}'s Location` : 'Farmer Locations'}
                </h2>
                <button
                  onClick={() => {
                    setShowMapModal(false);
                    setSelectedFarmer(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="mx-auto text-gray-400 mb-4" size={64} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Map</h3>
                  {selectedFarmer ? (
                    <div className="space-y-2">
                      <p className="text-gray-600">{selectedFarmer.location.address}</p>
                      <p className="text-sm text-gray-500">
                        Coordinates: {selectedFarmer.location.lat.toFixed(6)}, {selectedFarmer.location.lng.toFixed(6)}
                      </p>
                      <a
                        href={`https://www.google.com/maps?q=${selectedFarmer.location.lat},${selectedFarmer.location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Open in Google Maps
                      </a>
                    </div>
                  ) : (
                    <p className="text-gray-600 mb-4">
                      View all farmer locations and clusters
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedFarmer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">Reject Farmer Application</h2>
            </div>
            <div className="p-4 space-y-4">
              <p>Are you sure you want to reject {selectedFarmer.name}'s application?</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection (optional)"
                rows={3}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button 
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handleRejectFarmer}
                disabled={isLoading}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
              >
                {isLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};