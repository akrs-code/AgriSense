import React, { useState, useEffect } from 'react';
import {
  Bell,
  Menu,
  User,
  MessageSquare,
  ShoppingCart,
  Search,
  Sprout
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { totalItems } = useCartStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
  }, [isMenuOpen]);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Logo and Menu */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>

            <Link to="/" className="flex items-center ml-2 lg:ml-0">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center mr-3">
                <Sprout className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-semibold text-gray-800">AgriSense</h1>
            </Link>
          </div>

          {/* Middle: Search Bar (hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Right: Icons and User */}
          <div className="flex items-center space-x-4">
            <Link to="/messages" className="p-2 rounded-md text-gray-600 hover:bg-gray-100 relative">
              <MessageSquare size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">2</span>
            </Link>

            {user?.role === 'buyer' && (
              <Link to="/buyer/cart" className="p-2 rounded-md text-gray-600 hover:bg-gray-100 relative">
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
            )}

            <Link to="/notifications" className="p-2 rounded-md text-gray-600 hover:bg-gray-100 relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">5</span>
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-md text-gray-600 hover:bg-gray-100 transition"
              >
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-800">{user?.name}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Profile Settings
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    My Orders
                  </Link>
                  {user?.role === 'buyer' && (
                    <Link
                      to="/buyer/cart"
                      className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Cart ({totalItems})
                    </Link>
                  )}
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow fixed top-[64px] left-0 w-full z-40">
          <nav className="flex flex-col px-4 py-4 divide-y divide-gray-100">
            <Link
              to="/profile"
              className="py-2 text-sm text-gray-800 hover:bg-gray-100 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Profile Settings
            </Link>
            <Link
              to="/orders"
              className="py-2 text-sm text-gray-800 hover:bg-gray-100 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              My Orders
            </Link>
            <Link
              to="/messages"
              className="py-2 text-sm text-gray-800 hover:bg-gray-100 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Messages
            </Link>
            {user?.role === 'buyer' && (
              <Link
                to="/buyer/cart"
                className="py-2 text-sm text-gray-800 hover:bg-gray-100 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Cart ({totalItems})
              </Link>
            )}
            <Link
              to="/notifications"
              className="py-2 text-sm text-gray-800 hover:bg-gray-100 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Notifications
            </Link>
            <button
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              className="py-2 text-left text-sm text-red-600 hover:bg-gray-100"
            >
              Sign Out
            </button>
          </nav>
        </div>
      )}
    </>
  );
};