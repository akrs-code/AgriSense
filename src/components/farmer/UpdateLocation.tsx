import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

export const UpdateLocation: React.FC = () => {
  const { user, updateLocation } = useAuthStore();
  const [location, setLocation] = useState({
    lat: user?.location.lat || 0,
    lng: user?.location.lng || 0,
    address: user?.location.address || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasGPS, setHasGPS] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  useEffect(() => {
    setHasGPS('geolocation' in navigator);
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // In a real app, you'd use a geocoding service to get the address
          const address = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
          
          setLocation({
            lat: latitude,
            lng: longitude,
            address: address
          });
          
          toast.success('Location detected successfully!');
        } catch (error) {
          toast.error('Failed to get address for location');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location access denied. Please enable location permissions.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out.');
            break;
          default:
            toast.error('An unknown error occurred while retrieving location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAddress.trim()) {
      toast.error('Please enter your address');
      return;
    }

    // For demo purposes, set approximate coordinates for Philippines
    setLocation({
      lat: 14.5995,
      lng: 120.9842,
      address: manualAddress
    });
    
    toast.success('Location set manually');
  };

  const handleSaveLocation = async () => {
    if (!location.address) {
      toast.error('Please set your location first');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      updateLocation(location);
      toast.success('Farm location updated successfully!');
    } catch (error) {
      toast.error('Failed to update location');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Update Farm Location</h1>
          <p className="text-gray-600 mt-1">Set your farm's location to help buyers find you</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Location Methods */}
          <div className="space-y-6">
            {/* GPS Location */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Navigation className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Use GPS Location</h3>
                  <p className="text-sm text-gray-600">Get your exact coordinates automatically</p>
                </div>
              </div>

              {hasGPS ? (
                <button
                  onClick={getCurrentLocation}
                  disabled={isLoading}
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Getting Location...</span>
                    </>
                  ) : (
                    <>
                      <MapPin size={20} />
                      <span>Get Current Location</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-red-700">
                    <AlertCircle size={20} />
                    <span className="font-medium">GPS not available</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    Your device doesn't support GPS or location services are disabled.
                  </p>
                </div>
              )}
            </div>

            {/* Manual Location */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Manual Entry</h3>
                  <p className="text-sm text-gray-600">Enter your address manually</p>
                </div>
              </div>

              <form onSubmit={handleManualLocationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farm Address
                  </label>
                  <textarea
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="Enter your complete farm address (Barangay, Municipality, Province)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Set Manual Location
                </button>
              </form>
            </div>

            {/* Offline Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="text-yellow-600 mt-1" size={20} />
                <div>
                  <h4 className="font-medium text-yellow-900">Offline Support</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    If you're offline, your location will be saved locally and synced when you reconnect.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Location Display */}
          <div className="space-y-6">
            {/* Map Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Location Preview</h3>
              
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <MapPin className="mx-auto text-gray-400 mb-2" size={48} />
                  <p className="text-gray-600">Map preview</p>
                  <p className="text-sm text-gray-500">
                    {location.lat && location.lng 
                      ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                      : 'No coordinates set'
                    }
                  </p>
                </div>
              </div>

              {location.address && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-green-600 mt-1" size={20} />
                    <div>
                      <h4 className="font-medium text-green-900">Current Location</h4>
                      <p className="text-sm text-green-800 mt-1">{location.address}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Location Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    value={location.lat}
                    onChange={(e) => setLocation(prev => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
                    step="0.000001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    value={location.lng}
                    onChange={(e) => setLocation(prev => ({ ...prev, lng: parseFloat(e.target.value) || 0 }))}
                    step="0.000001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={location.address}
                    onChange={(e) => setLocation(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveLocation}
                disabled={isLoading || !location.address}
                className="w-full mt-6 bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Save size={20} />
                <span>{isLoading ? 'Saving...' : 'Save Location'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};