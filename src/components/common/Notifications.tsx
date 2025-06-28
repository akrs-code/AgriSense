import React, { useState } from 'react';
import { Bell, MessageSquare, Package, TrendingUp, CheckCircle, Trash2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'order' | 'message' | 'verification' | 'market' | 'review';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  link?: string;
  actionData?: any;
}

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-1',
      type: 'order',
      title: 'Order Confirmed',
      message: 'Your order for Premium Rice has been confirmed by Juan Dela Cruz Farm',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      isRead: false,
      link: '/orders'
    },
    {
      id: 'notif-2',
      type: 'message',
      title: 'New Message',
      message: 'Maria Santos Farm sent you a message about Sweet Corn availability',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      isRead: false,
      link: '/messages'
    },
    {
      id: 'notif-3',
      type: 'verification',
      title: 'Verification Approved',
      message: 'Congratulations! Your farmer verification has been approved',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      isRead: true,
      link: '/seller/dashboard'
    },
    {
      id: 'notif-4',
      type: 'market',
      title: 'Price Alert',
      message: 'Rice prices are rising in Central Luzon (+5% this week)',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      isRead: true,
      link: '/buyer/market-intelligence'
    },
    {
      id: 'notif-5',
      type: 'order',
      title: 'Order Delivered',
      message: 'Your Sweet Corn order has been delivered successfully',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      isRead: true,
      link: '/orders'
    },
    {
      id: 'notif-6',
      type: 'review',
      title: 'Review Request',
      message: 'Please rate your experience with Rodriguez Organic Farm',
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      isRead: false,
      link: '/reviews'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package size={20} className="text-blue-600" />;
      case 'message':
        return <MessageSquare size={20} className="text-green-600" />;
      case 'verification':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'market':
        return <TrendingUp size={20} className="text-purple-600" />;
      case 'review':
        return <Eye size={20} className="text-yellow-600" />;
      default:
        return <Bell size={20} className="text-gray-600" />;
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications =>
      notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications =>
      notifications.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(notifications =>
      notifications.filter(notification => notification.id !== notificationId)
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-1">
                Stay updated with your orders, messages, and market insights
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                Mark All as Read
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Notifications</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{notifications.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Bell size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Unread</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{unreadCount}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <Bell size={24} className="text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">This Week</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {notifications.filter(n => 
                    Date.now() - n.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000
                  ).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp size={24} className="text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Notifications</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-600">You're all caught up! New notifications will appear here.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Unread Indicator */}
                    <div className="flex-shrink-0 mt-1">
                      {!notification.isRead && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      )}
                    </div>

                    {/* Notification Icon */}
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatDistanceToNow(notification.timestamp)} ago
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {notification.link && (
                            <Link
                              to={notification.link}
                              onClick={() => handleNotificationClick(notification)}
                              className="text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              View
                            </Link>
                          )}
                          
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Mark as Read
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Delete notification"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notification Types Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-4">Notification Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">For Buyers:</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• Order confirmations and delivery updates</li>
                <li>• New messages from farmers</li>
                <li>• Product availability alerts</li>
                <li>• Market price changes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">For Farmers:</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• New buyer messages and orders</li>
                <li>• Verification status updates</li>
                <li>• Market intelligence alerts</li>
                <li>• Review requests</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};