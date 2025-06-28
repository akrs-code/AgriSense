import React, { useState } from 'react';
import { X, MapPin, Calendar, Star, MessageSquare, Phone } from 'lucide-react';
import { Crop } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface CropModalProps {
  crop: Crop | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CropModal: React.FC<CropModalProps> = ({ crop, isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !crop) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle contact form submission
    alert('Message sent to farmer!');
    setShowContactForm(false);
    setMessage('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{crop.name} - {crop.variety}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <div className="aspect-square rounded-xl overflow-hidden mb-4">
                <img
                  src={crop.images[selectedImage]}
                  alt={crop.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {crop.images.length > 1 && (
                <div className="flex space-x-2">
                  {crop.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
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
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-green-600">₱{crop.pricePerUnit}</span>
                  <span className="text-sm text-gray-600">per {crop.unit}</span>
                </div>
                <p className="text-sm text-green-700">
                  {crop.quantity} {crop.unit} available
                </p>
              </div>

              {/* Basic Info */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <MapPin size={16} className="mr-2" />
                  <span>{crop.location.address}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Calendar size={16} className="mr-2" />
                  <span>Harvested {formatDistanceToNow(crop.harvestDate)} ago</span>
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
                <p className="text-gray-700">{crop.description}</p>
              </div>

              {/* Condition */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Condition</h3>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {crop.condition.charAt(0).toUpperCase() + crop.condition.slice(1)}
                </span>
              </div>

              {/* Contact Section */}
              {!showContactForm ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    <MessageSquare size={18} />
                    <span>Contact Farmer</span>
                  </button>
                  
                  <button className="w-full flex items-center justify-center space-x-2 border border-green-500 text-green-600 py-3 px-4 rounded-lg font-medium hover:bg-green-50 transition-colors">
                    <Phone size={18} />
                    <span>Call Now</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity Needed
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      min="1"
                      max={crop.quantity}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      placeholder="Hi! I'm interested in your crops..."
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};