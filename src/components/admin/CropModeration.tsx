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

type CropStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

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
  status: CropStatus;
  images: string[];
  description: string;
  location: string;
  isSuspicious: boolean;
  flagReason?: string;
}

export const CropModeration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CropStatus>('pending');
  const [selectedCrop, setSelectedCrop] = useState<CropListing | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFarmer, setFilterFarmer] = useState('all');

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

  const getStatusColor = (status: CropStatus) => {
    return {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      flagged: 'bg-orange-100 text-orange-800'
    }[status];
  };

  const getStatusIcon = (status: CropStatus) => {
    return {
      pending: <Eye size={16} className="text-yellow-600" />,
      approved: <CheckCircle size={16} className="text-green-600" />,
      rejected: <XCircle size={16} className="text-red-600" />,
      flagged: <Flag size={16} className="text-orange-600" />
    }[status];
  };

  const filteredCrops = cropListings.filter((crop) => {
    const matchesTab = crop.status === activeTab;
    const matchesSearch =
      searchQuery === '' ||
      crop.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFarmer = filterFarmer === 'all' || crop.farmerId === filterFarmer;
    return matchesTab && matchesSearch && matchesFarmer;
  });

  const handleApproveCrop = (id: string) => console.log('✅ Approve:', id);
  const handleRejectCrop = (id: string) => console.log('❌ Reject:', id);
  const handleFlagCrop = (id: string, reason: string) => console.log('🚩 Flag:', id, reason);

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
            {(['pending', 'approved', 'flagged', 'rejected'] as CropStatus[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} (
                {cropListings.filter((c) => c.status === tab).length})
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
                            className="bg-green-500 text-white hover:bg-green-600 px-3 py-1 rounded text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectCrop(crop.id)}
                            className="bg-red-500 text-white hover:bg-red-600 px-3 py-1 rounded text-sm"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleFlagCrop(crop.id, 'Suspicious listing')}
                            className="bg-orange-500 text-white hover:bg-orange-600 px-3 py-1 rounded text-sm"
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

      {/* Modal */}
      {selectedCrop && (
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
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button onClick={() => setSelectedCrop(null)} className="border px-4 py-2 rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
