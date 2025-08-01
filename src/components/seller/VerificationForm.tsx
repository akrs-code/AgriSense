import React, { useState } from 'react';
import { MapPin, Navigation, Save, User, Building } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { FileUpload } from '../common/FileUpload';
import { FileUploadResult } from '../../utils/fileUpload';
import toast from 'react-hot-toast';
import { UserRole } from '../../types/enums';
import { Seller } from '../../types/user/user.types';
import { UpdateProfileRequestDTO } from '../../types/user/user.request';
import { LocationUpdateRequestDTO } from '../../types/location';

export const VerificationForm: React.FC = () => {
  const { user, submitSellerVerification } = useAuthStore();

  const seller = user?.role === UserRole.Seller ? (user as Seller) : null;

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    businessName: seller?.businessName || '',
    location: {
      lat: user?.location.lat || 0,
      lng: user?.location.lng || 0,
      address: user?.location.address || '',
    },
  });

  const [documents, setDocuments] = useState<FileUploadResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFilesUploaded = (files: FileUploadResult[]) => {
    setDocuments(files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'fullName') {
      setFormData((prev) => ({ ...prev, fullName: value }));
    } else if (name === 'businessName') {
      setFormData((prev) => ({ ...prev, businessName: value }));
    } else if (name === 'farmAddress') {
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, address: value },
      }));
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          location: {
            lat: latitude,
            lng: longitude,
            address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
          },
        }));
        toast.success('Location detected successfully!');
      },
      (error) => {
        toast.error('Failed to get location. Please enter manually.');
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (documents.length === 0) {
      toast.error('Please upload at least one document');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitSellerVerification(formData.businessName, documents);
      toast.success('Verification documents and profile submitted successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit documents. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">Farmer Verification</h1>
            <p className="text-green-100">Complete your verification to start selling on AgriSense</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Legal Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Farm Name (Optional)</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="e.g., Dela Cruz Farm"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Farm Location</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Navigation size={20} />
                    <span>Get Current Location</span>
                  </button>
                  <span className="text-sm text-gray-600">or enter manually below</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Farm Address *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        name="farmAddress"
                        value={formData.location.address}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter full address"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.location.lat}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.location.lng}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <FileUpload
                title="Verification Documents"
                description="Upload your government ID, proof of ownership, and farm photos"
                onFilesUploaded={handleFilesUploaded}
              />

              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Required Documents:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Government-issued ID (required)</li>
                  <li>• Proof of farm ownership or lease agreement</li>
                  <li>• Recent photos of your farm or crops</li>
                  <li>• Business permit (if applicable)</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={documents.length === 0 || isSubmitting}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-8 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center space-x-2"
              >
                <Save size={20} />
                <span>{isSubmitting ? 'Submitting...' : 'Submit for Verification'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};