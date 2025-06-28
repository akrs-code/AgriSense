import React from 'react';
import { CheckCircle, Clock, XCircle, FileText, MapPin, Phone } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export const VerificationStatus: React.FC = () => {
  const { user } = useAuthStore();
  const seller = user as any;

  const getStatusIcon = () => {
    switch (seller?.verificationStatus) {
      case 'approved':
        return <CheckCircle className="text-green-500" size={64} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={64} />;
      default:
        return <Clock className="text-yellow-500" size={64} />;
    }
  };

  const getStatusMessage = () => {
    switch (seller?.verificationStatus) {
      case 'approved':
        return {
          title: 'Verification Complete!',
          message: 'Your farmer account has been verified. You can now start listing your products.',
          color: 'text-green-900'
        };
      case 'rejected':
        return {
          title: 'Verification Rejected',
          message: 'Your verification was rejected. Please review the feedback and resubmit.',
          color: 'text-red-900'
        };
      default:
        return {
          title: 'Verification Under Review',
          message: 'Your verification documents are being reviewed by our team. This usually takes 1-3 business days.',
          color: 'text-yellow-900'
        };
    }
  };

  const status = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          {getStatusIcon()}
          <h2 className={`text-2xl font-bold ${status.color} mt-4 mb-2`}>{status.title}</h2>
          <p className="text-gray-600">{status.message}</p>
        </div>

        {/* Document Preview */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Submitted Documents</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <FileText className="text-green-500" size={20} />
              <span className="text-gray-700">Government ID</span>
              <span className="text-green-600 text-sm">✓ Uploaded</span>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="text-green-500" size={20} />
              <span className="text-gray-700">Proof of Ownership</span>
              <span className="text-green-600 text-sm">✓ Uploaded</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="text-green-500" size={20} />
              <span className="text-gray-700">Farm Location</span>
              <span className="text-green-600 text-sm">✓ Verified</span>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Farm Location</h3>
          <p className="text-blue-800">{user?.location.address}</p>
          <p className="text-blue-600 text-sm">
            Coordinates: {user?.location.lat.toFixed(4)}, {user?.location.lng.toFixed(4)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {seller?.verificationStatus === 'approved' && (
            <button
              onClick={() => window.location.href = '/seller/dashboard'}
              className="w-full bg-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-colors"
            >
              Go to Dashboard
            </button>
          )}

          {seller?.verificationStatus === 'rejected' && (
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/seller/verification'}
                className="w-full bg-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-colors"
              >
                Re-submit Documents
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                <Phone size={20} />
                <span>Contact Support</span>
              </button>
            </div>
          )}

          {seller?.verificationStatus === 'pending' && (
            <div className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  We'll notify you via email and SMS once the review is complete.
                </p>
              </div>
              <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                <Phone size={20} />
                <span>Contact Support</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};