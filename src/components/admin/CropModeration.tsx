import React, { useEffect, useState } from 'react';
import {
  Package,
  Eye,
  CheckCircle,
  XCircle,
  Flag,
  Search,
  Filter,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useCropModerationStore, CropListing } from '../../stores/cropModerationStore';

export const CropModeration: React.FC = () => {
  const { 
    cropListings, 
    isLoading, 
    approveCrop, 
    rejectCrop, 
    flagCrop, 
    getCropsByStatus 
  } = useCropModerationStore();
  
  const [activeTab, setActiveTab] = useState<CropListing['status']>('pending');
  const [selectedCrop, setSelectedCrop] = useState<CropListing | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFarmer, setFilterFarmer] = useState('all');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [actioningCropId, setActioningCropId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCrop) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedCrop]);

  const getStatusColor = (status: CropListing['status']) => {
    return {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      flagged: 'bg-orange-100 text-orange-800'
    }[status];
  };

  const getStatusIcon = (status: CropListing['status']) => {
    return {
      pending: <Eye size={16} className="text-yellow-600" />,
      approved: <CheckCircle size={16} className="text-green-600" />,
      rejected: <XCircle size={16} className="text-red-600" />,
      flagged: <Flag size={16} className="text-orange-600" />
    }[status];
  };

  const filteredCrops = getCropsByStatus(activeTab).filter((crop) => {
    const matchesSearch =
      searchQuery === '' ||
      crop.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFarmer = filterFarmer === 'all' || crop.farmerId === filterFarmer;
    return matchesSearch && matchesFarmer;
  });

  const handleApproveCrop = async (id: string) => {
    setActioningCropId(id);
    try {
      await approveCrop(id);
    } finally {
      setActioningCropId(null);
    }
  };

  const handleRejectCrop = async () => {
    if (!selectedCrop) return;
    
    setActioningCropId(selectedCrop.id);
    try {
      await rejectCrop(selectedCrop.id, rejectReason);
      setShowRejectModal(false);
      setSelectedCrop(null);
      setRejectReason('');
    } finally {
      setActioningCropId(null);
    }
  };

  const handleFlagCrop = async () => {
    if (!selectedCrop || !flagReason) return;
    
    setActioningCropId(selectedCrop.id);
    try {
      await flagCrop(selectedCrop.id, flagReason);
      setShowFlagModal(false);
      setSelectedCrop(null);
      setFlagReason('');
    } finally {
      setActioningCropId(null);
    }
  };

  const farmers = Array.from(new Set(cropListings.map(c => JSON.stringify({ id: c.farmerId, name: c.farmerName })))).map(item => JSON.parse(item));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b px-4 py-6">
        <h1 className="text-3xl font-bold">Crop Listing Moderation</h1>
        <p className="text-gray-600">Review and moderate crop listings from farmers</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <nav className="flex space-x-8 border-b px-6">
            {(['pending', 'approved', 'flagged', 'rejected'] as CropListing['status'][]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} (
                {getCropsByStatus(tab).length})
              </button>
            ))}
          </nav>

          {/* Filters */}
          <div className="p-6 flex flex-col md:flex-row gap-4">
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search crops or farmers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterFarmer}
                onChange={(e) => setFilterFarmer(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Farmers</option>
                {farmers.map((f: any) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="bg-white shadow-sm border rounded-xl">
          {filteredCrops.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Package className="mx-auto mb-4" size={40} />
              <p className="text-lg font-medium">No {activeTab} listings found</p>
            </div>
          ) : (
            filteredCrops.map((crop) => (
              <div key={crop.id} className="p-6 border-b last:border-b-0 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  <img
                    src={crop.images[0]}
                    alt={crop.cropName}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <div>
                        <h3 className="text-lg font-bold flex items-center space-x-2">
                          <span>{crop.cropName} - {crop.variety}</span>
                          {crop.isSuspicious && <AlertTriangle size={16} className="text-red-500" />}
                        </h3>
                        <p className="text-sm text-gray-500">by {crop.farmerName}</p>
                      </div>
                      <span className={`text-xs font-medium inline-flex items-center px-2 py-1 rounded-full ${getStatusColor(crop.status)}`}>
                        {getStatusIcon(crop.status)}
                        <span className="ml-1 capitalize">{crop.status}</span>
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      <p>Price: ₱{crop.price}/{crop.unit} • Qty: {crop.quantity} {crop.unit}</p>
                      <p>Location: {crop.location}</p>
                      <p>Submitted: {formatDistanceToNow(crop.submissionDate, { addSuffix: true })}</p>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setSelectedCrop(crop)}
                        className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm"
                      >
                        View
                      </button>
                      {crop.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveCrop(crop.id)}
                            disabled={isLoading || actioningCropId === crop.id}
                            className="bg-green-500 text-white hover:bg-green-600 px-3 py-1 rounded text-sm disabled:opacity-50"
                          >
                            {actioningCropId === crop.id ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCrop(crop);
                              setShowRejectModal(true);
                            }}
                            disabled={isLoading || actioningCropId === crop.id}
                            className="bg-red-500 text-white hover:bg-red-600 px-3 py-1 rounded text-sm disabled:opacity-50"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCrop(crop);
                              setShowFlagModal(true);
                            }}
                            disabled={isLoading || actioningCropId === crop.id}
                            className="bg-orange-500 text-white hover:bg-orange-600 px-3 py-1 rounded text-sm disabled:opacity-50"
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

      {/* View Modal */}
      {selectedCrop && !showRejectModal && !showFlagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Crop Details</h2>
              <button onClick={() => setSelectedCrop(null)} aria-label="Close modal">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <p><strong>Crop:</strong> {selectedCrop.cropName} - {selectedCrop.variety}</p>
              <p><strong>Farmer:</strong> {selectedCrop.farmerName}</p>
              <p><strong>Price:</strong> ₱{selectedCrop.price}/{selectedCrop.unit}</p>
              <p><strong>Quantity:</strong> {selectedCrop.quantity} {selectedCrop.unit}</p>
              <p><strong>Description:</strong> {selectedCrop.description}</p>
              <p><strong>Location:</strong> {selectedCrop.location}</p>
              <p><strong>Submitted:</strong> {selectedCrop.submissionDate.toDateString()}</p>
              {selectedCrop.flagReason && (
                <p><strong>Flag Reason:</strong> {selectedCrop.flagReason}</p>
              )}
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button onClick={() => setSelectedCrop(null)} className="border px-4 py-2 rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">Reject Crop Listing</h2>
            </div>
            <div className="p-4 space-y-4">
              <p>Are you sure you want to reject "{selectedCrop.cropName}"?</p>
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
                onClick={handleRejectCrop}
                disabled={isLoading}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
              >
                {isLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag Modal */}
      {showFlagModal && selectedCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">Flag Crop Listing</h2>
            </div>
            <div className="p-4 space-y-4">
              <p>Why are you flagging "{selectedCrop.cropName}"?</p>
              <select
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Select a reason</option>
                <option value="Suspicious location">Suspicious location</option>
                <option value="Fake images">Fake images</option>
                <option value="Unrealistic pricing">Unrealistic pricing</option>
                <option value="Duplicate listing">Duplicate listing</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button 
                onClick={() => {
                  setShowFlagModal(false);
                  setFlagReason('');
                }}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handleFlagCrop}
                disabled={isLoading || !flagReason}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
              >
                {isLoading ? 'Flagging...' : 'Flag'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};