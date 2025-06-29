import React, { useState } from 'react';
import { Plus, Package, TrendingUp, MessageSquare, Star, Lock } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useProductStore } from '../../stores/productStore';
import { ProductCard } from '../common/ProductCard';
import { ProductModal } from '../common/ProductModal';
import { AddCropForm } from './AddCropForm';
import { Product } from '../../types';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const SellerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { products, deleteProduct, updateProduct } = useProductStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  
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

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    if (!isVerified) {
      toast.error('You must be verified to edit products');
      return;
    }
    
    // For now, show a toast. In a real app, this would open an edit form
    toast.success(`Edit functionality for ${product.name} coming soon!`);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!isVerified) {
      toast.error('You must be verified to manage products');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Failed to delete product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleAddProductSuccess = () => {
    toast.success('Product added successfully!');
    setShowAddForm(false);
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
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2 bg-green-500 text-white hover:bg-green-600 shadow-lg"
            >
              <Plus size={20} />
              <span>Add Product</span>
            </button>
          </div>
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
                to="/seller/shopfront"
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
                  Start by adding your first product to the marketplace.
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors inline-flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Add Your First Product</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProducts.slice(0, 6).map((product) => (
                  <div key={product.id} className="relative group">
                    <ProductCard
                      product={product}
                      onView={handleViewProduct}
                      showActions={false}
                    />
                    
                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="bg-white text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          title="View Details"
                        >
                          <Package size={16} />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                          title="Edit Product"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                          title="Delete Product"
                        >
                          <Package size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Stock Warning */}
                    {product.stock < 10 && product.stock > 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          Low Stock
                        </span>
                      </div>
                    )}

                    {product.stock === 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Form Modal */}
      {showAddForm && (
        <AddCropForm
          onClose={() => setShowAddForm(false)}
          onSuccess={handleAddProductSuccess}
        />
      )}

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
          showOwnerActions={true}
        />
      )}
    </div>
  );
};