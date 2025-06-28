import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

export const VerificationPage: React.FC = () => {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState({
    governmentId: null as File | null,
    businessLicense: null as File | null,
    farmCertificate: null as File | null,
    additionalDocs: [] as File[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (type: keyof typeof documents, file: File | File[]) => {
    if (type === 'additionalDocs' && Array.isArray(file)) {
      setDocuments(prev => ({
        ...prev,
        additionalDocs: [...prev.additionalDocs, ...file]
      }));
    } else if (type !== 'additionalDocs' && !Array.isArray(file)) {
      setDocuments(prev => ({
        ...prev,
        [type]: file
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documents.governmentId) {
      toast.error('Government ID is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Verification documents submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit documents. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const FileUploadBox: React.FC<{
    title: string;
    description: string;
    required?: boolean;
    file: File | null;
    onUpload: (file: File) => void;
  }> = ({ title, description, required, file, onUpload }) => (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-400 transition-colors">
      <div className="text-center">
        {file ? (
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <CheckCircle size={24} />
            <span className="font-medium">{file.name}</span>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title} {required && <span className="text-red-500">*</span>}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{description}</p>
          </>
        )}
        
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) onUpload(selectedFile);
          }}
          className="hidden"
          id={`upload-${title.replace(/\s+/g, '-').toLowerCase()}`}
        />
        <label
          htmlFor={`upload-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
        >
          <FileText className="mr-2" size={16} />
          {file ? 'Change File' : 'Choose File'}
        </label>
      </div>
    </div>
  );

  if (user?.role !== 'seller') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to sellers.</p>
        </div>
      </div>
    );
  }

  const seller = user as any; // Type assertion for seller properties

  if (seller.verificationStatus === 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Complete!</h2>
          <p className="text-gray-600 mb-6">
            Your seller account has been verified. You can now start listing your products.
          </p>
          <button
            onClick={() => window.location.href = '/seller/dashboard'}
            className="w-full bg-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (seller.verificationStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin mx-auto h-16 w-16 text-yellow-500 mb-4">
            <Loader2 size={64} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Under Review</h2>
          <p className="text-gray-600 mb-6">
            Your verification documents are being reviewed by our team. This usually takes 1-3 business days.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              We'll notify you via email once the review is complete.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">Seller Verification</h1>
            <p className="text-green-100">
              Upload your documents to verify your seller account and start selling
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="text-blue-500 mt-1 mr-3" size={20} />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Verification Requirements</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Government-issued ID (required)</li>
                      <li>• Business license or permit (if applicable)</li>
                      <li>• Farm certificate or land title (if applicable)</li>
                      <li>• Additional supporting documents</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <FileUploadBox
                title="Government ID"
                description="Upload a clear photo of your government-issued ID"
                required
                file={documents.governmentId}
                onUpload={(file) => handleFileUpload('governmentId', file)}
              />

              <FileUploadBox
                title="Business License"
                description="Upload your business license or permit (if applicable)"
                file={documents.businessLicense}
                onUpload={(file) => handleFileUpload('businessLicense', file)}
              />

              <FileUploadBox
                title="Farm Certificate"
                description="Upload farm certificate or land title (if applicable)"
                file={documents.farmCertificate}
                onUpload={(file) => handleFileUpload('farmCertificate', file)}
              />

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-400 transition-colors">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Documents</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload any additional supporting documents
                  </p>
                  
                  {documents.additionalDocs.length > 0 && (
                    <div className="mb-4">
                      {documents.additionalDocs.map((file, index) => (
                        <div key={index} className="flex items-center justify-center space-x-2 text-green-600 text-sm">
                          <CheckCircle size={16} />
                          <span>{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) handleFileUpload('additionalDocs', files);
                    }}
                    className="hidden"
                    id="upload-additional"
                  />
                  <label
                    htmlFor="upload-additional"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <FileText className="mr-2" size={16} />
                    Choose Files
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">Important Notes:</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• All documents must be clear and readable</li>
                <li>• Accepted formats: JPG, PNG, PDF (max 5MB per file)</li>
                <li>• Verification typically takes 1-3 business days</li>
                <li>• You'll receive an email notification once reviewed</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!documents.governmentId || isSubmitting}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-8 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Submitting...
                  </div>
                ) : (
                  'Submit for Verification'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};