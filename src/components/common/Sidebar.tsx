import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  MessageSquare,
  Users,
  Settings,
  Search,
  FileText,
  Star,
  Store as Storefront,
  BarChart3,
  MapPin,
  Smartphone,
  AlertTriangle,
  Lock,
  Bell,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  const seller = user.role === 'seller' ? user : null;
  const isVerified = seller?.verificationStatus === 'approved';

  const getNavItems = () => {
    const commonItems = [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ];

    if (user.role === 'seller') {
      return [
        ...commonItems,
        {
          to: '/seller/shopfront',
          icon: Storefront,
          label: 'My Crops',
          restricted: !isVerified,
        },
        {
          to: '/seller/orders',
          icon: ShoppingCart,
          label: 'Orders',
          restricted: !isVerified,
        },
        {
          to: '/seller/market-intelligence',
          icon: BarChart3,
          label: 'Market Intelligence',
        },
        {
          to: '/seller/messages',
          icon: MessageSquare,
          label: 'Messages',
        },
        {
          to: '/seller/location',
          icon: MapPin,
          label: 'Farm Location',
        },
        {
          to: '/seller/reviews',
          icon: Star,
          label: 'Ratings & Reviews',
        },
        {
          to: '/notifications',
          icon: Bell,
          label: 'Notifications',
        },
        ...(seller?.verificationStatus !== 'approved'
          ? [
              {
                to: '/seller/verification',
                icon: Lock,
                label: 'Verification',
                highlight: true,
              },
            ]
          : []),
      ];
    }

    if (user.role === 'buyer') {
      return [
        ...commonItems,
        {
          to: '/marketplace',
          icon: Search,
          label: 'Browse Products',
        },
        {
          to: '/buyer/market-intelligence',
          icon: BarChart3,
          label: 'Market Intelligence',
        },
        {
          to: '/buyer/cart',
          icon: ShoppingCart,
          label: 'Cart',
        },
        {
          to: '/orders',
          icon: Package,
          label: 'My Orders',
        },
        {
          to: '/messages',
          icon: MessageSquare,
          label: 'Messages',
        },
        {
          to: '/reviews',
          icon: Star,
          label: 'Reviews',
        },
        {
          to: '/notifications',
          icon: Bell,
          label: 'Notifications',
        },
      ];
    }

    if (user.role === 'admin') {
      return [
        ...commonItems,
        {
          to: '/admin/users',
          icon: Users,
          label: 'Farmer Profiles',
        },
        {
          to: '/admin/verifications',
          icon: FileText,
          label: 'Pending Applications',
        },
        {
          to: '/admin/products',
          icon: Package,
          label: 'Crop Listings',
        },
        {
          to: '/admin/reports',
          icon: AlertTriangle,
          label: 'Disputes / Reports',
        },
        {
          to: '/admin/market-intelligence',
          icon: BarChart3,
          label: 'Market Intelligence',
        },
        {
          to: '/notifications',
          icon: Bell,
          label: 'Notifications',
        },
      ];
    }

    return commonItems;
  };

  const navItems = getNavItems();

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-sm border-r border-neutral-border hidden lg:block overflow-y-auto">
      <nav className="p-4">
        {/* Verification banner for sellers */}
        {user.role === 'seller' && !isVerified && (
          <div className="mb-4 p-3 bg-secondary-light border border-secondary rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Lock size={16} className="text-secondary-dark" />
              <span className="text-sm font-medium text-secondary-dark">
                Verification Required
              </span>
            </div>
            <p className="text-xs text-secondary-dark">
              Complete verification to unlock all selling features.
            </p>
          </div>
        )}

        {/* Navigation items */}
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                title={item.restricted ? 'Verification required' : ''}
                className={({ isActive }) => {
                  const baseClasses =
                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors';

                  if (item.restricted) {
                    return `${baseClasses} text-text-muted cursor-not-allowed bg-neutral`;
                  }

                  if (item.highlight) {
                    return `${baseClasses} bg-secondary-light text-secondary-dark border border-secondary`;
                  }

                  return `${baseClasses} ${
                    isActive
                      ? 'bg-primary-light text-primary border-r-2 border-primary'
                      : 'text-text-muted hover:bg-neutral hover:text-text'
                  }`;
                }}
                onClick={(e) => {
                  if (item.restricted) {
                    e.preventDefault();
                    toast.error(
                      'You must be verified to access this feature.'
                    );
                  }
                }}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
                {item.restricted && <Lock size={14} className="ml-auto" />}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* SMS Info for Sellers */}
        {user.role === 'seller' && (
          <div className="mt-8 pt-8 border-t border-neutral-border">
            <div className="px-4 mb-4">
              <h3 className="text-sm font-semibold text-text mb-2">
                SMS Features
              </h3>
              <div className="bg-info-bg border border-info rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Smartphone size={16} className="text-info" />
                  <span className="text-sm font-medium text-info">
                    Offline Support
                  </span>
                </div>
                <p className="text-xs text-info">
                  Access AgriSense features via SMS when offline
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="mt-8 pt-8 border-t border-neutral-border">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-light text-primary border-r-2 border-primary'
                  : 'text-text-muted hover:bg-neutral hover:text-text'
              }`
            }
          >
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};
