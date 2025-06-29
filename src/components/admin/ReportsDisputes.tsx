import React, { useState } from 'react';
import { AlertTriangle, User, Package, MessageSquare, Eye, CheckCircle, Flag, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useReportModerationStore, Report } from '../../stores/reportModerationStore';

export const ReportsDisputes: React.FC = () => {
  const { 
    reports, 
    isLoading, 
    warnUser, 
    suspendUser, 
    dismissReport, 
    getReportsByStatus 
  } = useReportModerationStore();
  
  const [activeTab, setActiveTab] = useState<'pending' | 'investigating' | 'resolved' | 'dismissed'>('pending');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [actionNotes, setActionNotes] = useState('');
  const [actioningReportId, setActioningReportId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'investigating':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case 'farmer':
        return <User size={16} className="text-blue-600" />;
      case 'crop':
        return <Package size={16} className="text-green-600" />;
      case 'message':
        return <MessageSquare size={16} className="text-purple-600" />;
      default:
        return <AlertTriangle size={16} className="text-gray-600" />;
    }
  };

  const filteredReports = getReportsByStatus(activeTab).filter(report => {
    const matchesSearch = searchQuery === '' || 
      report.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || report.targetType === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleWarnUser = async (reportId: string) => {
    setActioningReportId(reportId);
    try {
      await warnUser(reportId, actionNotes);
      setSelectedReport(null);
      setActionNotes('');
    } finally {
      setActioningReportId(null);
    }
  };

  const handleSuspendUser = async (reportId: string) => {
    setActioningReportId(reportId);
    try {
      await suspendUser(reportId, actionNotes);
      setSelectedReport(null);
      setActionNotes('');
    } finally {
      setActioningReportId(null);
    }
  };

  const handleDismissReport = async (reportId: string) => {
    setActioningReportId(reportId);
    try {
      await dismissReport(reportId, actionNotes);
      setSelectedReport(null);
      setActionNotes('');
    } finally {
      setActioningReportId(null);
    }
  };

  const stats = [
    {
      title: 'Total Reports',
      value: reports.length,
      icon: AlertTriangle,
      color: 'bg-blue-500'
    },
    {
      title: 'Pending',
      value: getReportsByStatus('pending').length,
      icon: Eye,
      color: 'bg-yellow-500'
    },
    {
      title: 'High Priority',
      value: reports.filter(r => r.priority === 'high').length,
      icon: Flag,
      color: 'bg-red-500'
    },
    {
      title: 'Resolved',
      value: getReportsByStatus('resolved').length,
      icon: CheckCircle,
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Disputes</h1>
          <p className="text-gray-600 mt-1">Handle user reports and resolve disputes</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

        {/* Tabs and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['pending', 'investigating', 'resolved', 'dismissed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} 
                  ({getReportsByStatus(tab as any).length})
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="farmer">Farmer Reports</option>
                <option value="crop">Crop Reports</option>
                <option value="message">Message Reports</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Reports ({filteredReports.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredReports.length === 0 ? (
              <div className="p-12 text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports found</h3>
                <p className="text-gray-600">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : `No ${activeTab} reports at the moment`
                  }
                </p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          {getTargetIcon(report.targetType)}
                          <h3 className="text-lg font-semibold text-gray-900">{report.targetName}</h3>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                          {report.priority} priority
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <p><strong>Report ID:</strong> {report.id}</p>
                          <p><strong>Type:</strong> {report.reportType}</p>
                        </div>
                        <div>
                          <p><strong>Reporter:</strong> {report.reporterName}</p>
                          <p><strong>Target Type:</strong> {report.targetType}</p>
                        </div>
                        <div>
                          <p><strong>Date:</strong> {report.reportDate.toLocaleDateString()}</p>
                          <p><strong>Time:</strong> {formatDistanceToNow(report.reportDate)} ago</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">{report.description}</p>

                      {report.adminNotes && (
                        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Admin Notes:</strong> {report.adminNotes}
                          </p>
                        </div>
                      )}

                      {report.actionTaken && (
                        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>Action Taken:</strong> {report.actionTaken}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye size={16} />
                        <span>Review</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Report Details</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Report Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Report ID:</strong> {selectedReport.id}</p>
                    <p><strong>Type:</strong> {selectedReport.reportType}</p>
                    <p><strong>Priority:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedReport.priority)}`}>
                        {selectedReport.priority}
                      </span>
                    </p>
                    <p><strong>Date:</strong> {selectedReport.reportDate.toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Involved Parties</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Reporter:</strong> {selectedReport.reporterName}</p>
                    <p><strong>Target:</strong> {selectedReport.targetName}</p>
                    <p><strong>Target Type:</strong> {selectedReport.targetType}</p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReport.status)}`}>
                        {selectedReport.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedReport.description}</p>
              </div>

              {selectedReport.status === 'pending' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Admin Action</h3>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Add notes about the action taken..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="flex space-x-3">
                {selectedReport.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleWarnUser(selectedReport.id)}
                      disabled={isLoading || actioningReportId === selectedReport.id}
                      className="flex-1 bg-yellow-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50"
                    >
                      {actioningReportId === selectedReport.id ? 'Warning...' : 'Warn User'}
                    </button>
                    <button
                      onClick={() => handleSuspendUser(selectedReport.id)}
                      disabled={isLoading || actioningReportId === selectedReport.id}
                      className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {actioningReportId === selectedReport.id ? 'Suspending...' : 'Suspend User'}
                    </button>
                    <button
                      onClick={() => handleDismissReport(selectedReport.id)}
                      disabled={isLoading || actioningReportId === selectedReport.id}
                      className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      {actioningReportId === selectedReport.id ? 'Dismissing...' : 'Dismiss'}
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setSelectedReport(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};