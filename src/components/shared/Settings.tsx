import React, { useState } from 'react';
import { User, Globe, Bell, LogOut, Save, Camera, MapPin, Phone, Mail, Wallet, Upload, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Seller } from '../../types';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const { user, logout, updateProfile, updateEWalletDetails } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.location.address || ''
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    marketingEmails: false
  });

  const [eWalletData, setEWalletData] = useState({
    provider: (user as Seller)?.eWalletDetails?.provider || '',
    accountNumber: (user as Seller)?.eWalletDetails?.accountNumber || '',
    accountName: (user as Seller)?.eWalletDetails?.accountName || '',
    qrCodeImage: (user as Seller)?.eWalletDetails?.qrCodeImage || ''
  });

  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [qrCodePreview, setQrCodePreview] = useState<string>('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await updateProfile({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        location: {
          ...user!.location,
          address: profileData.address
        }
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = () => {
    // In a real app, this would save to backend
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    toast.success('Preferences saved!');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      toast.success('Logged out successfully');
    }
  };

  const handleQrCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      setQrCodeFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setQrCodePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let qrCodeUrl = eWalletData.qrCodeImage;
      
      if (qrCodeFile) {
        // In a real app, upload to cloud storage
        // For now, use the preview URL
        qrCodeUrl = qrCodePreview;
      }

      const updatedEWalletDetails = {
        provider: eWalletData.provider,
        accountNumber: eWalletData.accountNumber,
        accountName: eWalletData.accountName,
        qrCodeImage: qrCodeUrl
      };

      // Update the e-wallet details
      await updateEWalletDetails(updatedEWalletDetails);

      // Update local state to reflect the saved data
      setEWalletData(updatedEWalletDetails);
      setQrCodeFile(null);
      setQrCodePreview('');

      toast.success('E-wallet settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save e-wallet settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveQrCode = () => {
    setQrCodeFile(null);
    setQrCodePreview('');
    setEWalletData(prev => ({ ...prev, qrCodeImage: '' }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    ...(user?.role === 'seller' ? [{ id: 'ewallet', label: 'E-wallet Settings', icon: Wallet }] : []),
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
                
                <hr className="my-4" />
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              {activeTab === 'profile' && (
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <User size={32} className="text-green-600" />
                      </div>
                      <button className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors">
                        <Camera size={16} />
                      </button>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                      <p className="text-gray-600">Update your personal information</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="text"
                           value={typeof user?.role === 'string' ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
                            disabled
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                        <textarea
                          value={profileData.address}
                          onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                          rows={3}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      <Save size={20} />
                      <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'language' && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Language Settings</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Language
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="language"
                            value="en"
                            checked={preferences.language === 'en'}
                            onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <span className="text-gray-900">English</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="language"
                            value="fil"
                            checked={preferences.language === 'fil'}
                            onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <span className="text-gray-900">Filipino</span>
                        </label>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">SMS Commands</h3>
                      <p className="text-sm text-blue-800 mb-2">
                        Language setting also applies to SMS commands:
                      </p>
                      <div className="text-xs text-blue-700 space-y-1">
                        <p><strong>English:</strong> "FIND RICE", "PRICES", "HELP"</p>
                        <p><strong>Filipino:</strong> "FIND BIGAS", "PRESYO", "TULONG"</p>
                      </div>
                    </div>

                    <button
                      onClick={handleSavePreferences}
                      className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center space-x-2"
                    >
                      <Save size={20} />
                      <span>Save Language</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication</h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-900 font-medium">Email Notifications</span>
                            <p className="text-sm text-gray-600">Receive updates about orders and messages</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences.emailNotifications}
                            onChange={(e) => setPreferences(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                            className="text-green-600 focus:ring-green-500 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-900 font-medium">SMS Notifications</span>
                            <p className="text-sm text-gray-600">Get text messages for important updates</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences.smsNotifications}
                            onChange={(e) => setPreferences(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                            className="text-green-600 focus:ring-green-500 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-900 font-medium">Push Notifications</span>
                            <p className="text-sm text-gray-600">Receive notifications in the app</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences.pushNotifications}
                            onChange={(e) => setPreferences(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                            className="text-green-600 focus:ring-green-500 rounded"
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketing</h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-900 font-medium">Marketing Emails</span>
                            <p className="text-sm text-gray-600">Receive promotional offers and updates</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences.marketingEmails}
                            onChange={(e) => setPreferences(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                            className="text-green-600 focus:ring-green-500 rounded"
                          />
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={handleSavePreferences}
                      className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center space-x-2"
                    >
                      <Save size={20} />
                      <span>Save Preferences</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'ewallet' && user?.role === 'seller' && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Wallet size={24} className="text-green-600" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">E-wallet Settings</h2>
                      <p className="text-gray-600">Set up your e-wallet for receiving payments</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveEWallet} className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 rounded-full p-2">
                          <Wallet size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-900 mb-1">Why set up e-wallet?</h3>
                          <p className="text-sm text-blue-800">
                            When buyers choose e-wallet payment, they'll see your QR code and account details 
                            to send payment directly to you. This makes transactions faster and more convenient.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          E-wallet Provider *
                        </label>
                        <select
                          value={eWalletData.provider}
                          onChange={(e) => setEWalletData(prev => ({ ...prev, provider: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select Provider</option>
                          <option value="GCash">GCash</option>
                          <option value="Maya">Maya (PayMaya)</option>
                          <option value="PayPal">PayPal</option>
                          <option value="GrabPay">GrabPay</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Holder Name *
                        </label>
                        <input
                          type="text"
                          value={eWalletData.accountName}
                          onChange={(e) => setEWalletData(prev => ({ ...prev, accountName: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Full name as registered"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Number/Mobile Number *
                        </label>
                        <input
                          type="text"
                          value={eWalletData.accountNumber}
                          onChange={(e) => setEWalletData(prev => ({ ...prev, accountNumber: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="e.g., 09123456789"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        QR Code Image
                      </label>
                      <p className="text-sm text-gray-600 mb-4">
                        Upload your e-wallet QR code so buyers can easily scan and pay you.
                      </p>

                      {(qrCodePreview || eWalletData.qrCodeImage) ? (
                        <div className="space-y-4">
                          <div className="relative inline-block">
                            <img
                              src={qrCodePreview || eWalletData.qrCodeImage}
                              alt="QR Code Preview"
                              className="w-48 h-48 object-contain border-2 border-dashed border-gray-300 rounded-lg p-4"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveQrCode}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <div>
                            <label className="bg-gray-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors inline-flex items-center space-x-2">
                              <Camera size={16} />
                              <span>Change QR Code</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleQrCodeUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <Upload size={32} className="mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-600 mb-4">
                            Drag and drop your QR code image, or click to browse
                          </p>
                          <label className="bg-green-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-green-600 transition-colors inline-flex items-center space-x-2">
                            <Upload size={16} />
                            <span>Upload QR Code</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleQrCodeUpload}
                              className="hidden"
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-2">
                            Supports JPG, PNG, GIF up to 5MB
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-900 mb-2">Important Notes:</h4>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        <li>• Make sure your QR code is clear and scannable</li>
                        <li>• Double-check your account details for accuracy</li>
                        <li>• Keep your e-wallet account active to receive payments</li>
                        <li>• You can update these details anytime</li>
                      </ul>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      <Save size={20} />
                      <span>{isLoading ? 'Saving...' : 'Save E-wallet Settings'}</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};