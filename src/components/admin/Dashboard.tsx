import React, { useState } from 'react';
import { Users, FileText, CheckCircle, XCircle, Eye, Download } from 'lucide-react';
import { useAdminStore } from '../../stores/adminStore';
import { VerificationApplication } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { applications, approveApplication, rejectApplication, isLoading } = useAdminStore();
  const [selectedApplication, setSelectedApplication] = useState<VerificationApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const approvedApplications = applications.filter(app => app.status === 'approved');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  const handleApprove = async (applicationId: string) => {
    try {
      await approveApplication(applicationId, reviewNotes);
      setSelectedApplication(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Failed to approve application:', error);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!reviewNotes.trim()) {
      alert('Please provide rejection notes');
      return;
    }
    
    try {
      await rejectApplication(applicationId, reviewNotes);
      setSelectedApplication(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Failed to reject application:', error);
    }
  };

  const stats = [
    {
      title: 'Pending Applications',
      value: pendingApplications.length,
      icon: FileText,
      color: 'bg-yellow-500'
    },
    {
      title: 'Approved Sellers',
      value: approvedApplications.length,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Rejected Applications',
      value: rejectedApplications.length,
      icon: XCircle,
      color: 'bg-red-500'
    },
    {
      title: 'Total Users',
      value: '1,234',
      icon: Users,
      color: 'bg-blue-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage seller verifications and platform oversight</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Pending Applications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Pending Verification Applications</h2>
          </div>

          <div className="p-6">
            {pendingApplications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending applications</h3>
                <p className="text-gray-600">All verification applications have been reviewed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApplications.map((application) => (
                  <div key={application.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">Application #{application.id}</h3>
                        <p className="text-sm text-gray-600">
                          Submitted: {application.submittedAt.toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        Pending Review
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Submitted Documents:</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li className="flex items-center">
                            <CheckCircle size={16} className="text-green-500 mr-2" />
                            Government ID
                          </li>
                          {application.documents.businessLicense && (
                            <li className="flex items-center">
                              <CheckCircle size={16} className="text-green-500 mr-2" />
                              Business License
                            </li>
                          )}
                          {application.documents.farmCertificate && (
                            <li className="flex items-center">
                              <CheckCircle size={16} className="text-green-500 mr-2" />
                              Farm Certificate
                            </li>
                          )}
                          {application.documents.additionalDocs.length > 0 && (
                            <li className="flex items-center">
                              <CheckCircle size={16} className="text-green-500 mr-2" />
                              {application.documents.additionalDocs.length} Additional Documents
                            </li>
                          )}
                        </ul>
                      </div>

                      <div className='flex flex-col items-end'>
                        <h4 className="font-medium text-gray-900 mb-2">Actions:</h4>
                        <div className="space-y-2">
                          <button
                            onClick={() => setSelectedApplication(application)}
                            className="inline-flex items-center justify-end space-x-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            <Eye size={16} />
                            <span>Review Documents</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Review Application #{selectedApplication.id}
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Documents */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Submitted Documents</h3>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Government ID</span>
                        <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
                          <Download size={16} />
                          <span>Download</span>
                        </button>
                      </div>
                      <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                        <span className="text-gray-500">Document Preview</span>
                      </div>
                    </div>

                    {selectedApplication.documents.businessLicense && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">Business License</span>
                          <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
                            <Download size={16} />
                            <span>Download</span>
                          </button>
                        </div>
                        <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                          <span className="text-gray-500">Document Preview</span>
                        </div>
                      </div>
                    )}

                    {selectedApplication.documents.farmCertificate && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">Farm Certificate</span>
                          <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
                            <Download size={16} />
                            <span>Download</span>
                          </button>
                        </div>
                        <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                          <span className="text-gray-500">Document Preview</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Form */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Decision</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Notes
                      </label>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows={6}
                        placeholder="Add notes about your decision..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApprove(selectedApplication.id)}
                        disabled={isLoading}
                        className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors"
                      >
                        Approve Application
                      </button>
                      <button
                        onClick={() => handleReject(selectedApplication.id)}
                        disabled={isLoading || !reviewNotes.trim()}
                        className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
                      >
                        Reject Application
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedApplication(null);
                        setReviewNotes('');
                      }}
                      className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};