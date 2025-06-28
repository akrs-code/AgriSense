import React, { useState } from 'react';
import { Minus, Plus, Trash2, MapPin, Calendar, ShoppingCart as ShoppingCartIcon, ArrowRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface CartItem {
  id: string;
  productId: string;
  cropName: string;
  farmerName: string;
  farmerId: string;
  image: string;
  location: string;
  distance?: string;
  harvestDate: Date;
  pricePerUnit: number;
  unit: string;
  quantity: number;
  subtotal: number;
}

const ShoppingCart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'cart-1',
      productId: '1',
      cropName: 'Premium Rice',
      farmerName: 'Juan Dela Cruz Farm',
      farmerId: 'farmer-1',
      image: 'https://images.pexels.com/photos/164504/pexels-photo-164504.jpeg',
      location: 'Cabanatuan, Nueva Ecija',
      distance: '25 km away',
      harvestDate: new Date('2024-01-15'),
      pricePerUnit: 45,
      unit: 'kg',
      quantity: 10,
      subtotal: 450
    },
    {
      id: 'cart-2',
      productId: '2',
      cropName: 'Sweet Corn',
      farmerName: 'Maria Santos Farm',
      farmerId: 'farmer-2',
      image: 'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg',
      location: 'Quezon, Nueva Ecija',
      distance: '18 km away',
      harvestDate: new Date('2024-01-20'),
      pricePerUnit: 35,
      unit: 'kg',
      quantity: 5,
      subtotal: 175
    }
  ]);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(items =>
      items.map(item =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: newQuantity * item.pricePerUnit
            }
          : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
    toast.success('Item removed from cart');
  };

  const handlePlaceOrder = () => {
    setShowOrderModal(true);
  };

  const confirmOrder = async () => {
    setIsPlacingOrder(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart and show success
      setCartItems([]);
      setShowOrderModal(false);
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-gray-600 mt-1">Review your items and place your order</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <ShoppingCartIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">
              Browse our marketplace to find fresh crops from local farmers.
            </p>
            <Link
              to="/marketplace"
              className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors inline-flex items-center space-x-2"
            >
              <Package size={20} />
              <span>Browse Products</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.cropName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{item.cropName}</h3>
                          <Link
                            to={`/farmer/${item.farmerId}`}
                            className="text-green-600 hover:text-green-700 font-medium text-sm"
                          >
                            {item.farmerName}
                          </Link>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove from cart"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-1">
                          <MapPin size={14} />
                          <span>{item.location}</span>
                          {item.distance && (
                            <span className="text-blue-600">({item.distance})</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>Harvested {item.harvestDate.toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-700">Quantity:</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-12 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <span className="text-sm text-gray-600">{item.unit}</span>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            ₱{item.pricePerUnit} per {item.unit}
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            ₱{item.subtotal.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-medium">{totalItems} items</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₱{totalAmount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Delivery Fee:</span>
                    <span>Calculated at checkout</span>
                  </div>
                  
                  <hr className="my-4" />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">₱{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Delivery Estimation:</strong> 2-3 business days
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Based on your location and farmer proximity
                    </p>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    className="w-full bg-green-500 text-white py-4 px-6 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <span>Place Order</span>
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Confirmation Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Confirm Your Order</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.cropName} x{item.quantity}</span>
                      <span>₱{item.subtotal.toLocaleString()}</span>
                    </div>
                  ))}
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>₱{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Delivery Information</h3>
                <p className="text-sm text-gray-600">
                  Items will be delivered to your registered address within 2-3 business days.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                <p className="text-sm text-gray-600">
                  Farmers will contact you via your registered phone number for delivery coordination.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={confirmOrder}
                  disabled={isPlacingOrder}
                  className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPlacingOrder ? 'Placing Order...' : 'Confirm Order'}
                </button>
                <button
                  onClick={() => setShowOrderModal(false)}
                  disabled={isPlacingOrder}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;