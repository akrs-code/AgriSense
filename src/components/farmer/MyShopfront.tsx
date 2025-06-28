import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, MapPin, Calendar, Package, TrendingUp, Lock } from 'lucide-react';
import { useProductStore } from '../../stores/productStore';
import { useAuthStore } from '../../stores/authStore';
import { ProductCard } from '../common/ProductCard';
import { ProductModal } from '../common/ProductModal';
import { Product } from '../../types';
import { Link } from 'react-router-dom';
import { AddCropForm } from '../seller/AddCropForm';
import toast from 'react-hot-toast';

export const MyShopfront: React.FC = () => {
  const { user } = useAuthStore();
  const { products, deleteProduct, updateProduct } = useProductStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const seller = user as any;
  const isVerified = seller?.verificationStatus === 'approved';
  const myProducts = products.filter(p => p.sellerId === user?.id);
  const activeProducts = myProducts.filter(p => p.isActive);
  const totalStock = myProducts.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = myProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);

  // Listen for add crop form trigger from sidebar
  useEffect(() => {
    const handleOpenAddCropForm = () => {
      if (isVerified) {
        setShowAddForm(true);
      } else {
        handleRestrictedAction();
      }
    };

    window.addEventListener('openAddCropForm', handleOpenAddCropForm);
    return () => window.removeEventListener('openAddCropForm', handleOpenAddCropForm);
  }, [isVerified]);

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

  const handleEditProduct = (product: Product) => {
    if (!isVerified) {
      toast.error('You must be verified to edit products');
      return;
    }
    
    // In a real app, this would open an edit form
    toast.info('Edit functionality coming soon!');
  };

  const handleToggleProductStatus = async (productId: string, currentStatus: boolean) => {
    if (!isVerified) {
      toast.error('You must be verified to manage products');
      return;
    }

    try {
      await updateProduct(productId, { isActive: !currentStatus });
      toast.success(`Product ${currentStatus ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      toast.error('Failed to update product status');
    }
  };

  const handleRestrictedAction = () => {
    toast.error('You must be verified to sell crops. Please complete your verification.');
    // Redirect to verification page
    window.location.href = '/seller/verification';
  };

  const handleAddCropSuccess = () => {
    toast.success('Crop added successfully!');
    // Refresh the page or update the products list
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Crops</h1>
              <p className="text-gray-600 mt-1">Manage your crop listings and inventory</p>
              {isVerified ? (
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 text-sm font-medium">Verified Seller</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 mt-2">
                  <Lock size={16} className="text-yellow-600" />
                  <span className="text-yellow-600 text-sm font-medium">Verification Required</span>
                </div>
              )}
            </div>
            <button
              onClick={isVerified ? () => setShowAddForm(true) : handleRestrictedAction}
              className={`px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2 shadow-lg ${
                isVerified 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={!isVerified ? 'Verification required to add products' : ''}
            >
              {!isVerified && <Lock size={20} />}
              <Plus size={20} />
              <span>Add Crop</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Verification Banner */}
        {!isVerified && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <Lock className="text-yellow-600" size={24} />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">🔒 Verification Required to Sell</h3>
                <p className="text-yellow-800 text-sm mt-1">
                  Complete verification to unlock selling features and start listing your crops.
                </p>
              </div>
              <Link
                to="/seller/verification"
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
              >
                Complete Verification
              </Link>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{activeProducts.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Package size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Stock</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalStock}</p>
                <p className="text-xs text-gray-500">kg available</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₱{totalValue.toLocaleString()}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">This Month</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₱45,200</p>
                <p className="text-xs text-green-600 font-medium">+12% from last month</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <TrendingUp size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Your Crop Listings</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{myProducts.length} total products</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {myProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No crops listed yet</h3>
                <p className="text-gray-600 mb-6">
                  {isVerified 
                    ? 'Start by adding your first crop to reach potential buyers.'
                    : 'Complete verification to start adding crops.'
                  }
                </p>
                <button
                  onClick={isVerified ? () => setShowAddForm(true) : handleRestrictedAction}
                  className={`px-6 py-3 rounded-xl font-semibold transition-colors inline-flex items-center space-x-2 ${
                    isVerified 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-yellow-500 text-white hover:bg-yellow-600'
                  }`}
                >
                  {isVerified ? <Plus size={20} /> : <Lock size={20} />}
                  <span>{isVerified ? 'Add Your First Crop' : 'Complete Verification'}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProducts.map((product) => (
                  <div key={product.id} className="relative group">
                    <ProductCard
                      product={product}
                      onView={setSelectedProduct}
                      showActions={false}
                    />
                    
                    {/* Verification Lock Overlay */}
                    {!isVerified && (
                      <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl flex items-center justify-center">
                        <div className="bg-white rounded-lg p-4 text-center">
                          <Lock className="mx-auto text-yellow-600 mb-2" size={24} />
                          <p className="text-sm font-medium text-gray-900">Verification Required</p>
                          <p className="text-xs text-gray-600">Complete verification to manage</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Action Overlay (only for verified) */}
                    {isVerified && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="bg-white text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                            title="Edit Product"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}

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

      {/* Add Crop Form Modal */}
      {showAddForm && (
        <AddCropForm
          onClose={() => setShowAddForm(false)}
          onSuccess={handleAddCropSuccess}
        />
      )}

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        showOwnerActions={true}
      />
    </div>
  );
};