import React from 'react';
import { Plus, Package, TrendingUp, MessageSquare, Star, Eye, Edit, Trash2, Lock } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useProductStore } from '../../stores/productStore';
import { Link } from 'react-router-dom';

export const SellerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { products, deleteProduct } = useProductStore();
  
  const seller = user as any;
  const myProducts = products.filter(p => p.sellerId === user?.id);
  const activeProducts = myProducts.filter(p => p.isActive);
  const totalRevenue = myProducts.reduce((sum, p) => sum + (p.price * (1000 - p.stock)), 0);
  const isVerified = seller?.verificationStatus === 'approved';

  const stats = [
    {
      title: 'Active Products',
      value: activeProducts.length,
      icon: Package,
      color: 'bg-blue-500',
      change: '+2 this week'
    },
    {
      title: 'Total Revenue',
      value: `₱${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-green-500',
      change: '+15% this month'
    },
    {
      title: 'Messages',
      value: '12',
      icon: MessageSquare,
      color: 'bg-purple-500',
      change: '3 unread'
    },
    {
      title: 'Rating',
      value: seller?.rating || '4.8',
      icon: Star,
      color: 'bg-yellow-500',
      change: `${seller?.reviewCount || 156} reviews`
    }
  ];

  const handleDeleteProduct = async (productId: string) => {
    if (!isVerified) {
      alert('You must be verified to manage products');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  if (seller?.verificationStatus !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="text-yellow-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Required</h2>
          <p className="text-gray-600 mb-6">
            You need to complete seller verification before accessing selling features.
          </p>
          <Link
            to="/seller/verification"
            className="w-full bg-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-colors inline-block"
          >
            Complete Verification
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
              {isVerified && (
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 text-sm font-medium">Verified Seller</span>
                </div>
              )}
            </div>
            <Link
              to="/seller/products/add"
              className={`px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2 ${
                isVerified 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={(e) => {
                if (!isVerified) {
                  e.preventDefault();
                  alert('You must be verified to add products');
                }
              }}
            >
              {!isVerified && <Lock size={20} />}
              <Plus size={20} />
              <span>Add Product</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Verification Banner */}
        {!isVerified && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <Lock className="text-yellow-600" size={24} />
              <div>
                <h3 className="font-semibold text-yellow-900">🔒 Verification Required to Sell</h3>
                <p className="text-yellow-800 text-sm mt-1">
                  Complete verification to unlock selling features. You can still access market intelligence and messaging.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-green-600 text-xs mt-1 font-medium">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">My Products</h2>
              <Link
                to="/seller/products"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                View All
              </Link>
            </div>
          </div>

          <div className="p-6">
            {myProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
                <p className="text-gray-600 mb-6">
                  {isVerified 
                    ? 'Start by adding your first product to the marketplace.'
                    : 'Complete verification to start adding products.'
                  }
                </p>
                {isVerified ? (
                  <Link
                    to="/seller/products/add"
                    className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors inline-flex items-center space-x-2"
                  >
                    <Plus size={20} />
                    <span>Add Your First Product</span>
                  </Link>
                ) : (
                  <Link
                    to="/seller/verification"
                    className="bg-yellow-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-yellow-600 transition-colors inline-flex items-center space-x-2"
                  >
                    <Lock size={20} />
                    <span>Complete Verification</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProducts.slice(0, 6).map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-48">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {!isVerified && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center space-x-1">
                            <Lock size={12} />
                            <span>Locked</span>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{product.variety}</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-green-600">₱{product.price}/{product.unit}</span>
                        <span className="text-sm text-gray-500">{product.stock} in stock</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button 
                          className="flex-1 flex items-center justify-center space-x-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                        <button 
                          className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            isVerified 
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                          disabled={!isVerified}
                          title={!isVerified ? 'Verification required' : ''}
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            isVerified 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                          disabled={!isVerified}
                          title={!isVerified ? 'Verification required' : ''}
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};