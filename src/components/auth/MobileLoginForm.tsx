import React, { useState } from 'react';
import { Phone, User, Mail, ArrowRight, ArrowLeft, Shield, MapPin, AlertCircle, Sprout } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

type Step = 'phone' | 'role' | 'otp' | 'geofence' | 'blocked';

export const MobileLoginForm: React.FC = () => {
  const [step, setStep] = useState<Step>('phone');
  const [formData, setFormData] = useState({
    phone: '',
    role: '' as 'buyer' | 'farmer' | '',
    email: '',
    otp: '',
    name: ''
  });
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isInSupportedRegion, setIsInSupportedRegion] = useState<boolean | null>(null);

  const { login } = useAuthStore();

  // Supported regions (Philippines bounds)
  const SUPPORTED_REGIONS = {
    minLat: 4.5,
    maxLat: 21.0,
    minLng: 116.0,
    maxLng: 127.0
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length >= 10) {
      setStep('role');
    }
  };

  const handleRoleSelect = (role: 'buyer' | 'farmer') => {
    setFormData(prev => ({ ...prev, role }));
    if (role === 'farmer') {
      // For farmers, we might want to collect email
      setStep('otp'); // Skip email for now, go directly to OTP
    } else {
      setStep('otp');
    }
  };

  const handleSendOTP = async () => {
    setIsLoading(true);
    try {
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('OTP sent successfully!');
      
      // Start countdown
      setOtpTimer(60);
      setCanResend(false);
      const countdown = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.otp.length === 6) {
      setIsLoading(true);
      try {
        // Simulate OTP verification
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setLocation({ lat: latitude, lng: longitude });
              
              // Check if in supported region
              const inRegion = latitude >= SUPPORTED_REGIONS.minLat &&
                             latitude <= SUPPORTED_REGIONS.maxLat &&
                             longitude >= SUPPORTED_REGIONS.minLng &&
                             longitude <= SUPPORTED_REGIONS.maxLng;
              
              setIsInSupportedRegion(inRegion);
              setStep('geofence');
              setIsLoading(false);
            },
            (error) => {
              console.error('Geolocation error:', error);
              
              // Handle specific geolocation errors
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  toast.error('Location access denied. You can still continue, but some features may be limited.');
                  break;
                case error.POSITION_UNAVAILABLE:
                  toast.error('Location information unavailable. Continuing without location.');
                  break;
                case error.TIMEOUT:
                  toast.error('Location request timed out. Continuing without location.');
                  break;
                default:
                  toast.error('Unable to retrieve location. Continuing without location.');
                  break;
              }
              
              // Proceed without location
              setLocation(null);
              setIsInSupportedRegion(null);
              setStep('geofence');
              setIsLoading(false);
            }
          );
        } else {
          toast.error('Geolocation is not supported by this browser.');
          setStep('geofence');
          setIsLoading(false);
        }
      } catch (error) {
        toast.error('Invalid OTP');
        setIsLoading(false);
      }
    }
  };

  const handleProceedToDashboard = async () => {
    if (isInSupportedRegion === false) {
      setStep('blocked');
      return;
    }

    try {
      // Create mock email for login
      const email = formData.role === 'farmer' ? 'seller@agrimarket.com' : 'buyer@agrimarket.com';
      await login(email, 'password');
      toast.success('Welcome to AgriSense!');
    } catch (error) {
      toast.error('Login failed');
    }
  };

  const renderPhoneStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to AgriSense</h2>
        <p className="text-gray-600">Enter your mobile number to get started</p>
      </div>

      <form onSubmit={handlePhoneSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+63 9XX XXX XXXX"
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={formData.phone.length < 10}
          className="w-full bg-green-500 text-white py-4 px-6 rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
        >
          <span>Continue</span>
          <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );

  const renderRoleStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <button
          onClick={() => setStep('phone')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Role</h2>
        <p className="text-gray-600">How would you like to use AgriSense?</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => handleRoleSelect('farmer')}
          className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <span className="text-3xl">🌾</span>
            </div>
            <div className="text-left flex-1">
              <h3 className="text-xl font-semibold text-gray-900">I'm a Farmer</h3>
              <p className="text-gray-600">Sell your crops and connect with buyers</p>
            </div>
            <ArrowRight className="text-gray-400 group-hover:text-green-500" size={24} />
          </div>
        </button>

        <button
          onClick={() => handleRoleSelect('buyer')}
          className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <span className="text-3xl">🛒</span>
            </div>
            <div className="text-left flex-1">
              <h3 className="text-xl font-semibold text-gray-900">I'm a Buyer</h3>
              <p className="text-gray-600">Find fresh crops from local farmers</p>
            </div>
            <ArrowRight className="text-gray-400 group-hover:text-green-500" size={24} />
          </div>
        </button>
      </div>
    </div>
  );

  const renderOTPStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <button
          onClick={() => setStep('role')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Number</h2>
        <p className="text-gray-600">
          We've sent a 6-digit code to<br />
          <span className="font-semibold">{formData.phone}</span>
        </p>
      </div>

      <form onSubmit={handleOTPVerify} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter OTP Code
          </label>
          <div className="relative">
            <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={formData.otp}
              onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
              placeholder="000000"
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
              maxLength={6}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={formData.otp.length !== 6 || isLoading}
          className="w-full bg-green-500 text-white py-4 px-6 rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <div className="text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleSendOTP}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Resend OTP
            </button>
          ) : (
            <p className="text-gray-500">
              Resend OTP in {otpTimer}s
            </p>
          )}
        </div>
      </form>

      {/* SMS Fallback Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-500 mt-1">📱</div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">SMS Alternative</h4>
            <p className="text-sm text-blue-800">
              No internet? You can also use AgriSense via SMS commands. 
              Text "HELP" to get started.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGeofenceStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Location Check</h2>
        <p className="text-gray-600">
          {location ? 'Checking your location...' : 'Unable to detect location'}
        </p>
      </div>

      {isInSupportedRegion === null && (
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your region...</p>
        </div>
      )}

      {isInSupportedRegion === true && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <div className="text-green-600 mb-4">✅</div>
          <h3 className="font-semibold text-green-900 mb-2">You're in a supported region!</h3>
          <p className="text-green-800 mb-4">
            AgriSense is available in your area. You can access all features.
          </p>
          <button
            onClick={handleProceedToDashboard}
            className="w-full bg-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-all"
          >
            Continue to Dashboard
          </button>
        </div>
      )}

      {isInSupportedRegion === false && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <div className="text-yellow-600 mb-4">⚠️</div>
          <h3 className="font-semibold text-yellow-900 mb-2">Limited Service Area</h3>
          <p className="text-yellow-800 mb-4">
            AgriSense is not fully available in your region yet, but you can still use SMS features.
          </p>
          <button
            onClick={() => setStep('blocked')}
            className="w-full bg-yellow-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-yellow-600 transition-all"
          >
            View SMS Options
          </button>
        </div>
      )}

      {location === null && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
          <p className="text-gray-600 mb-4">
            We couldn't detect your location. You can still proceed, but some features may be limited.
          </p>
          <button
            onClick={handleProceedToDashboard}
            className="w-full bg-gray-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-600 transition-all"
          >
            Continue Anyway
          </button>
        </div>
      )}
    </div>
  );

  const renderBlockedStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={40} className="text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Available</h2>
        <p className="text-gray-600">
          AgriSense web app is not available in your region yet.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-4">📱 SMS Alternative Available</h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <strong>Find Crops:</strong> Text "FIND RICE" or "FIND MAIS"
          </div>
          <div>
            <strong>Market Prices:</strong> Text "PRICES"
          </div>
          <div>
            <strong>Get Help:</strong> Text "HELP"
          </div>
          <div>
            <strong>Insights:</strong> Text "INSIGHTS"
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>SMS Number:</strong> +63 XXX XXX XXXX<br />
            Standard SMS rates apply
          </p>
        </div>
      </div>

      <button
        onClick={() => setStep('phone')}
        className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-all"
      >
        Try Different Number
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sprout className="text-white" size={32} />
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {step === 'phone' && renderPhoneStep()}
          {step === 'role' && renderRoleStep()}
          {step === 'otp' && renderOTPStep()}
          {step === 'geofence' && renderGeofenceStep()}
          {step === 'blocked' && renderBlockedStep()}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};