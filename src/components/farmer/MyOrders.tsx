import React, { useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, Eye, Filter, Search, Lock, Wallet, CreditCard, Settings, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';
import { useOrderStore, Order } from '../../stores/orderStore';
import { Seller } from '../../types';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const MyOrders: React.FC = () => {
  const { user } = useAuthStore();
  const { orders, getOrdersBySeller, updateOrderStatus, isLoading } = useOrderStore();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const seller = user as any;
  const isVerified = seller?.verificationStatus === 'approved';

  // If not verified, show access denied page
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-yellow-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Required</h2>
          <p className="text-gray-600 mb-6">
            You need to complete seller verification before accessing order management features.
          </p>
          <div className="space-y-3">
            <Link
              to="/seller/verification"
              className="w-full bg-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-colors inline-block"
            >
              Complete Verification
            </Link>
            <Link
              to="/seller/dashboard"
              className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-colors inline-block"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sellerOrders = user ? getOrdersBySeller(user.id) : [];

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

  const getPaymentMethodIcon = (paymentMethod: string) => {
    switch (paymentMethod) {
      case 'e-wallet':
        return <Wallet size={16} className="text-blue-600" />;
      case 'cod':
        return <CreditCard size={16} className="text-green-600" />;
      default:
        return <CreditCard size={16} className="text-gray-600" />;
    }
  };

  const getPaymentMethodColor = (paymentMethod: string) => {
    switch (paymentMethod) {
      case 'e-wallet':
        return 'bg-blue-100 text-blue-800';
      case 'cod':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = sellerOrders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      
      const statusMessages = {
        processing: 'Order marked as Processing',
        shipped: 'Order marked as Shipped',
        delivered: 'Order marked as Delivered'
      };
      
      toast.success(statusMessages[newStatus] || 'Order status updated');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const stats = [
    {
      title: 'Total Orders',
      value: sellerOrders.length,
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Pending',
      value: sellerOrders.filter(o => o.status === 'pending').length,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Processing',
      value: sellerOrders.filter(o => o.status === 'processing').length,
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Completed',
      value: sellerOrders.filter(o => o.status === 'delivered').length,
      icon: CheckCircle,
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-1">Manage your crop orders and deliveries</p>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-green-600 text-sm font-medium">Verified Seller</span>
              </div>
            </div>
          </div>
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

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Orders ({filteredOrders.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600">
                  {searchQuery || selectedStatus !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Orders from buyers will appear here'
                  }
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <img
                        src={order.productImage}
                        alt={order.productName}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {order.productName}
                          </h3>
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="capitalize">{order.status}</span>
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>Order ID:</strong> {order.id}</p>
                            <p><strong>Buyer:</strong> Buyer #{order.buyerId.slice(-4)}</p>
                          </div>
                          <div>
                            <p><strong>Quantity:</strong> {order.quantity} {order.unit}</p>
                            <p><strong>Total:</strong> ₱{order.totalPrice.toLocaleString()}</p>
                          </div>
                          <div>
                            <p><strong>Order Date:</strong> {order.orderDate.toLocaleDateString()}</p>
                            <p><strong>Delivery:</strong> {order.deliveryAddress}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center space-x-2">
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(order.paymentMethod)}`}>
                            {getPaymentMethodIcon(order.paymentMethod)}
                            <span>{order.paymentMethod === 'e-wallet' ? 'E-wallet Payment' : 'Cash on Delivery'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </button>
                      
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                          disabled={isLoading}
                          className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                          Start Processing
                        </button>
                      )}
                      
                      {order.status === 'processing' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                          disabled={isLoading}
                          className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          Mark as Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
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
              <div className="flex items-start space-x-4">
                <img
                  src={selectedOrder.productImage}
                  alt={selectedOrder.productName}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedOrder.productName}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                      <p><strong>Quantity:</strong> {selectedOrder.quantity} {selectedOrder.unit}</p>
                      <p><strong>Price per unit:</strong> ₱{selectedOrder.pricePerUnit}</p>
                      <p><strong>Total Price:</strong> ₱{selectedOrder.totalPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p><strong>Buyer:</strong> Buyer #{selectedOrder.buyerId.slice(-4)}</p>
                      <p><strong>Order Date:</strong> {selectedOrder.orderDate.toLocaleDateString()}</p>
                      {selectedOrder.estimatedDelivery && (
                        <p><strong>Est. Delivery:</strong> {selectedOrder.estimatedDelivery.toLocaleDateString()}</p>
                      )}
                      <p><strong>Delivery Address:</strong> {selectedOrder.deliveryAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Order Status</h3>
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="capitalize">{selectedOrder.status}</span>
                  </span>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Payment Method</h3>
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getPaymentMethodColor(selectedOrder.paymentMethod)}`}>
                    {getPaymentMethodIcon(selectedOrder.paymentMethod)}
                    <span>{selectedOrder.paymentMethod === 'e-wallet' ? 'E-wallet Payment' : 'Cash on Delivery'}</span>
                  </span>
                  {selectedOrder.paymentMethod === 'e-wallet' && (
                    <div className="mt-2">
                      {(user as Seller)?.eWalletDetails?.provider ? (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <Wallet size={16} className="text-green-600 mt-0.5" />
                            <div>
                              <p className="text-sm text-green-800 font-medium">E-wallet Details Configured</p>
                              <p className="text-xs text-green-700 mt-1">
                                Your {(user as Seller).eWalletDetails.provider} details are visible to the buyer.
                                They can scan your QR code or use your account details to send payment.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm text-yellow-800 font-medium">E-wallet Details Missing</p>
                              <p className="text-xs text-yellow-700 mt-1">
                                Set up your e-wallet details so buyers can easily pay you.
                              </p>
                              <Link
                                to="/profile"
                                className="inline-flex items-center space-x-1 text-xs text-yellow-800 hover:text-yellow-900 underline mt-2"
                              >
                                <Settings size={12} />
                                <span>Set up e-wallet details</span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleUpdateOrderStatus(selectedOrder.id, 'processing');
                      setSelectedOrder(null);
                    }}
                    disabled={isLoading}
                    className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    Start Processing
                  </button>
                )}
                
                {selectedOrder.status === 'processing' && (
                  <button
                    onClick={() => {
                      handleUpdateOrderStatus(selectedOrder.id, 'delivered');
                      setSelectedOrder(null);
                    }}
                    disabled={isLoading}
                    className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    Mark as Delivered
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