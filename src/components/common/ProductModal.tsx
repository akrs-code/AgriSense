import React, { useState } from 'react';
import { X, MapPin, Calendar, Star, MessageSquare, Phone, ShoppingCart, Edit, Trash2 } from 'lucide-react';
import { Product } from '../../types/product.types';
import { formatDistanceToNow } from 'date-fns';
import { useMessageStore } from '../../stores/messageStore';
import { useAuthStore } from '../../stores/authStore';
import { useProductStore } from '../../stores/productStore';
import { useCartStore } from '../../stores/cartStore';
import toast from 'react-hot-toast';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  showOwnerActions?: boolean;
}

interface AddToCartConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
}

const AddToCartConfirmationModal: React.FC<AddToCartConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Already in Cart</h3>
        <p className="text-gray-600 mb-6">
          "{productName}" is already in your cart. Do you want to add it again?
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            Add Again
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  showOwnerActions = false
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const { createConversation, sendMessage } = useMessageStore();
  const { user } = useAuthStore();
  const { deleteProduct, updateProduct } = useProductStore();
  const { addToCart, forceAddToCart } = useCartStore();

  if (!isOpen || !product) return null;

  const isOwner = user?.id === product.seller_id;
  const canShowOwnerActions = showOwnerActions && isOwner;
  const isBuyer = user?.role === 'buyer';

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to contact seller');
      return;
    }

    try {
      
      const conversationId = await createConversation(product.seller_id, product.id);
      console.log('Message: ' + message);
      await sendMessage(conversationId, message, product.seller_id);
      toast.success('Message sent to seller!');
      setShowContactForm(false);
      setMessage('');
      
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (!isBuyer) {
      toast.error('Only buyers can add items to cart');
      return;
    }

    if (!product.is_active || product.quantity === 0) {
      toast.error('Product is currently unavailable');
      return;
    }

    if (quantity > product.quantity) {
      toast.error(`Only ${product.quantity} ${product.unit} available`);
      return;
    }

    try {
      const added = await addToCart(product, quantity);

      if (!added) {
        // Product already in cart, show confirmation modal
        setShowAddToCartModal(true);
      } else {
        toast.success(`${product.name} added to cart!`);
      }
    } catch (error) {
      toast.error('Failed to add product to cart');
    }
  };

  const handleConfirmAddToCart = async () => {
    try {
      await forceAddToCart(product, quantity);
      toast.success(`${product.name} added to cart again!`);
      setShowAddToCartModal(false);
    } catch (error) {
      toast.error('Failed to add product to cart');
      setShowAddToCartModal(false);
    }
  };

  const handleEditProduct = () => {
    // In a real app, this would open an edit form
    toast('Edit functionality coming soon!');
  };

  const handleDeleteProduct = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await deleteProduct(product.id);
      toast.success('Product deleted successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleToggleActive = async () => {
    try {
      await updateProduct(product.id, { is_active: !product.is_active });
      toast.success(`Product ${product.is_active ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      toast.error('Failed to update product status');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">{product.name} - {product.variety}</h2>
            <div className="flex items-center space-x-2">
              {canShowOwnerActions && (
                <>
                  <button
                    onClick={handleEditProduct}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Product"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={handleDeleteProduct}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 size={20} />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Images */}
              <div>
                <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-gray-100">
                  {product.images && product.images.length > 0 && (
                    <img
                      src={product.images[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {product.images && product.images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? 'border-green-500' : 'border-gray-200'
                        }`}
                      >
                        <img src={image} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-6">
                {/* Price and Availability */}
                <div className="bg-green-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-bold text-green-600">₱{product.price}</span>
                    <span className="text-sm text-gray-600">per {product.unit}</span>
                  </div>
                  <p className="text-sm text-green-700 font-medium">
                    {product.quantity} {product.unit} available
                  </p>
                  <div className="mt-3 flex items-center space-x-2">
                    {product.condition && (
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        product.condition === 'fresh' ? 'bg-green-100 text-green-800' :
                        product.condition === 'good' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)} Quality
                      </span>
                    )}
                    {!product.is_active && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <MapPin size={16} className="mr-2 flex-shrink-0" />
                    <span>{product.location ? product.location.address : 'N/A'}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Calendar size={16} className="mr-2 flex-shrink-0" />
                    <span>Harvested {formatDistanceToNow(product.harvest_date)} ago</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Star size={16} className="text-yellow-400 fill-current" />
                    <span className="font-medium">4.8</span>
                    <span className="text-gray-600">(23 reviews)</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{product.description}</p>
                </div>

                {/* Owner Actions */}
                {canShowOwnerActions ? (
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Product Management</h4>
                      <div className="space-y-2">
                        <button
                          onClick={handleToggleActive}
                          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                            product.is_active
                              ? 'bg-orange-500 text-white hover:bg-orange-600'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          {product.is_active ? 'Deactivate Listing' : 'Activate Listing'}
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={handleEditProduct}
                            className="flex items-center justify-center space-x-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            <Edit size={16} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={handleDeleteProduct}
                            className="flex items-center justify-center space-x-2 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Quantity Selector - Only for buyers */}
                    {isBuyer && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Quantity</h3>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                          >
                            -
                          </button>
                          <span className="text-lg font-semibold w-16 text-center">{quantity}</span>
                          <button
                            onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                            className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                          >
                            +
                          </button>
                          <span className="text-sm text-gray-600">
                            Total: ₱{(product.price * quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {!showContactForm ? (
                      <div className="space-y-3">
                        {isBuyer && (
                          <button
                            onClick={handleAddToCart}
                            disabled={!product.is_active || product.quantity === 0}
                            className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ShoppingCart size={18} />
                            <span>Add to Cart</span>
                          </button>
                        )}

                        <button
                          onClick={() => setShowContactForm(true)}
                          className="w-full flex items-center justify-center space-x-2 border border-green-500 text-green-600 py-3 px-4 rounded-xl font-semibold hover:bg-green-50 transition-colors"
                        >
                          <MessageSquare size={18} />
                          <span>Contact Seller</span>
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message to Seller
                          </label>
                          <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            placeholder={`Hi! I'm interested in your ${product.name}. Is it still available?`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
                          >
                            Send Message
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowContactForm(false)}
                            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add to Cart Confirmation Modal */}
      <AddToCartConfirmationModal
        isOpen={showAddToCartModal}
        onClose={() => setShowAddToCartModal(false)}
        onConfirm={handleConfirmAddToCart}
        productName={product.name}
      />
    </>
  );
};