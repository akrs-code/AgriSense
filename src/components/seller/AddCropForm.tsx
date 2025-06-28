import React, { useState } from 'react';
import { Save, X, MapPin, Calendar, Package, DollarSign, FileText, Navigation } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useProductStore } from '../../stores/productStore';
import { FileUpload } from '../common/FileUpload';
import { FileUploadResult } from '../../utils/fileUpload';
import toast from 'react-hot-toast';

interface AddCropFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddCropForm: React.FC<AddCropFormProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuthStore();
  const { addProduct } = useProductStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    quantity: '',
    unit: 'kg',
    price: '',
    description: '',
    harvestDate: '',
    location: {
      lat: user?.location.lat || 0,
      lng: user?.location.lng || 0,
      address: user?.location.address || ''
    }
  });
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResult[]>([]);

  const seller = user as any;
  const isVerified = seller?.verificationStatus === 'approved';

  const units = ['kg', 'lbs', 'pieces', 'bundles', 'sacks'];
  const categories = ['Grains', 'Vegetables', 'Fruits', 'Herbs', 'Livestock'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilesUploaded = (files: FileUploadResult[]) => {
    setUploadedFiles(files);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          location: {
            lat: latitude,
            lng: longitude,
            address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
          }
        }));
        toast.success('Location updated!');
      },
      () => {
        toast.error('Failed to get location');
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isVerified) {
      toast.error('You must be verified to add crops');
      return;
    }

    if (!formData.name || !formData.variety || !formData.quantity || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert uploaded files to image URLs
      const imageUrls = uploadedFiles
        .filter(file => file.type.startsWith('image/'))
        .map(file => file.url);

      if (imageUrls.length === 0) {
        toast.error('Please upload at least one image file');
        setIsSubmitting(false);
        return;
      }

      await addProduct({
        sellerId: user!.id,
        name: formData.name,
        category: 'Grains', // Default category - could be made selectable
        variety: formData.variety,
        description: formData.description,
        price: parseFloat(formData.price),
        unit: formData.unit,
        stock: parseInt(formData.quantity),
        images: imageUrls,
        location: formData.location,
        harvestDate: new Date(formData.harvestDate),
        condition: 'fresh' as const,
        isActive: true
      });

      toast.success('Crop added successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to add crop');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVerified) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="text-yellow-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Required</h2>
          <p className="text-gray-600 mb-6">
            You must be verified to sell crops. Please complete your verification first.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/seller/verification'}
              className="w-full bg-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-colors"
            >
              Go to Verification
            </button>
            <button
              onClick={onClose}
              className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary to-primary-dark">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Add New Crop</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 p-2 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-primary-light mt-1">List your fresh crops for buyers to discover</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-text mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Crop Name *
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Rice, Corn, Tomatoes"
                    className="w-full pl-10 pr-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Variety *
                </label>
                <input
                  type="text"
                  name="variety"
                  value={formData.variety}
                  onChange={handleInputChange}
                  placeholder="e.g., Jasmine, Sweet, Cherry"
                  className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Quantity *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="100"
                    min="1"
                    className="flex-1 px-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="px-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Price per Unit *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="45.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted text-sm">
                    ₱
                  </span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text mb-2">
                  Harvest Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                  <input
                    type="date"
                    name="harvestDate"
                    value={formData.harvestDate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold text-text mb-4">Location</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="flex items-center space-x-2 bg-info text-white px-4 py-2 rounded-lg hover:bg-info/90 transition-colors"
                >
                  <Navigation size={20} />
                  <span>Use Current Location</span>
                </button>
                <span className="text-sm text-text-muted">or enter manually below</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.location.lat}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, lat: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.location.lng}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, lng: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                    <input
                      type="text"
                      value={formData.location.address}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        location: { ...prev.location, address: e.target.value }
                      }))}
                      placeholder="Barangay, Municipality, Province"
                      className="w-full pl-10 pr-4 py-2 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-text-muted" size={20} />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe your crop quality, growing methods, and any special features..."
                className="w-full pl-10 pr-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <h3 className="text-lg font-semibold text-text mb-4">Upload Photos</h3>
            <FileUpload
              onFilesUploaded={handleFilesUploaded}
              maxFiles={5}
              acceptedTypes={['image/*']}
              title="Upload Crop Photos"
              description="Add photos of your crops to attract buyers"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-neutral-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-neutral-border text-text py-3 px-6 rounded-xl font-semibold hover:bg-neutral transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploadedFiles.length === 0}
              className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white py-3 px-6 rounded-xl font-semibold hover:from-primary-dark hover:to-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
            >
              <Save size={20} />
              <span>{isSubmitting ? 'Adding Crop...' : 'Add Crop'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};