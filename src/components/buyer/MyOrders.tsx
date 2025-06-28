import React, { useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, RotateCcw, Eye, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BuyerOrder {
  id: string;
  cropName: string;
  sellerName: string;
  sellerPhone: string;
  orderDate: Date;
  quantity: number;
  unit: string;
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  estimatedArrival: Date;
  trackingNumber?: string;
  canReorder: boolean;
  canReview: boolean;
}

export const MyOrders: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<BuyerOrder | null>(null);

  // Mock orders data
  const orders: BuyerOrder[] = [
    {
      id: 'ORD-001',
      cropName: 'Premium Rice',
      sellerName: 'Juan Dela Cruz Farm',
      sellerPhone: '+63 912 345 6789',
      orderDate: new Date('2024-01-20'),
      quantity: 50,
      unit: 'kg',
      totalPrice: 2250,
      status: 'shipped',
      estimatedArrival: new Date('2024-01-25'),
      trackingNumber: 'TRK123456789',
      canReorder: true,
      canReview: false
    },
    {
      id: 'ORD-002',
      cropName: 'Sweet Corn',
      sellerName: 'Maria Santos Farm',
      sellerPhone: '+63 923 456 7890',
      orderDate: new Date('2024-01-15'),
      quantity: 25,
      unit: 'kg',
      totalPrice: 875,
      status: 'delivered',
      estimatedArrival: new Date('2024-01-20'),
      canReorder: true,
      canReview: true
    },
    {
      id: 'ORD-003',
      cropName: 'Fresh Tomatoes',
      sellerName: 'Rodriguez Organic Farm',
      sellerPhone: '+63 934 567 8901',
      orderDate: new Date('2024-01-18'),
      quantity: 10,
      unit: 'kg',
      totalPrice: 800,
      status: 'processing',
      estimatedArrival: new Date('2024-01-23'),
      canReorder: true,
      canReview: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'processing':
        return <Package size={16} className="text-blue-600" />;
      case 'shipped':
        return <Package size={16} className="text-purple-600" />;
      case 'delivered':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    return selectedStatus === 'all' || order.status === selectedStatus;
  });

  const handleReorder = (order: BuyerOrder) => {
    console.log('Reordering:', order.cropName);
    // In a real app, this would add the item to cart or create a new order
  };

  const stats = [
    {
      title: 'Total Orders',
      value: orders.length,
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'In Transit',
      value: orders.filter(o => o.status === 'shipped').length,
      icon: Package,
      color: 'bg-purple-500'
    },
    {
      title: 'Delivered',
      value: orders.filter(o => o.status === 'delivered').length,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Total Spent',
      value: `₱${orders.reduce((sum, o) => sum + o.totalPrice, 0).toLocaleString()}`,
      icon: Package,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">Track your purchases and order history</p>
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

        {/* Status Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedStatus === status
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {selectedStatus === 'all' 
                  ? 'You haven\'t placed any orders yet'
                  : `No ${selectedStatus} orders found`
                }
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.cropName}
                      </h3>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Order ID:</strong> {order.id}</p>
                        <p><strong>Seller:</strong> {order.sellerName}</p>
                      </div>
                      <div>
                        <p><strong>Quantity:</strong> {order.quantity} {order.unit}</p>
                        <p><strong>Total:</strong> ₱{order.totalPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p><strong>Order Date:</strong> {order.orderDate.toLocaleDateString()}</p>
                        <p><strong>Est. Arrival:</strong> {order.estimatedArrival.toLocaleDateString()}</p>
                      </div>
                    </div>

                    {order.trackingNumber && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Tracking Number:</strong> {order.trackingNumber}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye size={16} />
                      <span>View Details</span>
                    </button>
                    
                    {order.canReorder && (
                      <button
                        onClick={() => handleReorder(order)}
                        className="flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <RotateCcw size={16} />
                        <span>Reorder</span>
                      </button>
                    )}
                    
                    {order.canReview && (
                      <button className="flex items-center space-x-1 bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg hover:bg-yellow-200 transition-colors">
                        <Star size={16} />
                        <span>Review</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                    <p><strong>Product:</strong> {selectedOrder.cropName}</p>
                    <p><strong>Quantity:</strong> {selectedOrder.quantity} {selectedOrder.unit}</p>
                    <p><strong>Total Price:</strong> ₱{selectedOrder.totalPrice.toLocaleString()}</p>
                    <p><strong>Order Date:</strong> {selectedOrder.orderDate.toLocaleDateString()}</p>
                    <p><strong>Est. Arrival:</strong> {selectedOrder.estimatedArrival.toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Seller Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Seller:</strong> {selectedOrder.sellerName}</p>
                    <p><strong>Phone:</strong> {selectedOrder.sellerPhone}</p>
                    {selectedOrder.trackingNumber && (
                      <p><strong>Tracking:</strong> {selectedOrder.trackingNumber}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                  <span className="capitalize">{selectedOrder.status}</span>
                </span>
              </div>

              <div className="flex space-x-3">
                {selectedOrder.canReorder && (
                  <button
                    onClick={() => {
                      handleReorder(selectedOrder);
                      setSelectedOrder(null);
                    }}
                    className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    Reorder
                  </button>
                )}
                
                <button
                  onClick={() => setSelectedOrder(null)}
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