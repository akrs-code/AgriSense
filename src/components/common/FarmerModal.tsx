import React from 'react';
import { Dialog } from '@headlessui/react';
import { SellerMarkerData } from '../buyer/Map';
import { UserIcon, Phone, Mail } from 'lucide-react';
import { Product } from '../../types'; 


interface FarmerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerData: SellerMarkerData & {
    profileImageUrl?: string;
    email?: string;
    phone?: string;
  };
  products: Product[];
  onProductClick: (product: Product) => void;

}

export const FarmerModal: React.FC<FarmerModalProps> = ({
  isOpen,
  onClose,
  sellerData,
  products,
  onProductClick
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-labelledby="farmer-modal-title"
      aria-describedby="farmer-modal-description"
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black opacity-30" />

      {/* Modal Content */}
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-neutral overflow-hidden flex items-center justify-center">
            {sellerData.profileImageUrl ? (
              <img
                src={sellerData.profileImageUrl}
                alt="Farmer Profile"
                className="object-cover w-full h-full"
              />
            ) : (
              <UserIcon className="text-gray-400 w-8 h-8" />
            )}
          </div>
          <div>
            <h2 id="farmer-modal-title" className="text-xl font-semibold text-text">
              {sellerData.businessName || sellerData.sellerName}
            </h2>
            <p className="text-text-muted text-sm">
              {sellerData.sellerName}
            </p>
            <div className="mt-1 text-sm text-text-muted flex flex-col">
              {sellerData.email && (
                <span className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" /> {sellerData.email}
                </span>
              )}
              {sellerData.phone && (
                <span className="flex items-center">
                  <Phone className="w-4 h-4 mr-1" /> {sellerData.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p id="farmer-modal-description" className="mb-4 text-text-muted">
          Products sold by this farmer:
        </p>

        {/* Products List */}
        <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {products.map(product => (
            <div
                key={product.id}
                className="cursor-pointer hover:bg-neutral px-4 py-2 rounded-md"
                onClick={() => onProductClick(product)} 
            >
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted">₱{product.price} / {product.unit}</p>
            </div>
            ))}

        </ul>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Close
        </button>
      </div>
    </Dialog>
  );
};
