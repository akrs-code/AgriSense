import React from 'react';
import { Package, Star, Loader2, MapPin, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Order {
  id: string;
  cropName: string;
  sellerName: string;
  location: string;
  quantity: number;
  unit: string;
  price: number;
  status: 'Delivered' | 'Pending' | 'Cancelled';
  reviewed: boolean;
}

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    cropName: 'Premium Rice',
    sellerName: 'Juan Dela Cruz Farm',
    location: 'Cabanatuan, Nueva Ecija',
    quantity: 10,
    unit: 'kg',
    price: 450,
    status: 'Delivered',
    reviewed: false,
  },
  {
    id: 'ORD-002',
    cropName: 'Sweet Corn',
    sellerName: 'Maria Santos Farm',
    location: 'Quezon, Nueva Ecija',
    quantity: 5,
    unit: 'kg',
    price: 175,
    status: 'Pending',
    reviewed: false,
  },
  {
    id: 'ORD-003',
    cropName: 'Tomatoes',
    sellerName: 'Rodriguez Organic Farm',
    location: 'San Jose City',
    quantity: 3,
    unit: 'kg',
    price: 180,
    status: 'Delivered',
    reviewed: true,
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  const colorMap: Record<string, string> = {
    Delivered: 'bg-green-100 text-green-700',
    Pending: 'bg-yellow-100 text-yellow-800',
    Cancelled: 'bg-red-100 text-red-600',
  };
  return (
    <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${colorMap[status] || ''}`}>
      {status}
    </span>
  );
};

export const BuyerDashboard: React.FC = () => {
  const totalOrders = mockOrders.length;
  const pending = mockOrders.filter((o) => o.status === 'Pending').length;
  const reviewsGiven = mockOrders.filter((o) => o.reviewed).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back, Buyer</h1>
          <p className="text-gray-600 mt-1">Track your orders, leave reviews, and explore fresh crops.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
          </div>
          <div className="bg-blue-500 text-white p-3 rounded-lg">
            <Package size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Reviews Given</p>
            <p className="text-3xl font-bold text-gray-900">{reviewsGiven}</p>
          </div>
          <div className="bg-yellow-500 text-white p-3 rounded-lg">
            <Star size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Pending Deliveries</p>
            <p className="text-3xl font-bold text-gray-900">{pending}</p>
          </div>
          <div className="bg-purple-500 text-white p-3 rounded-lg">
            <Loader2 size={24} />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Recent Orders</h2>
        {mockOrders.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <Package className="mx-auto mb-2" size={40} />
            <p>No recent orders found.</p>
          </div>
        ) : (
          mockOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center"
            >
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">{order.cropName}</h3>
                <p className="text-sm text-gray-700">
                  From <span className="font-medium text-green-700">{order.sellerName}</span>
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin size={14} className="text-gray-400" />
                  {order.location}
                </p>
                <p className="text-sm text-gray-600">
                  Quantity: {order.quantity} {order.unit} • ₱{order.price.toLocaleString()}
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col md:items-end space-y-2">
                <StatusBadge status={order.status} />
                {order.status === 'Delivered' && !order.reviewed && (
                  <Link
                    to={`/reviews/new?orderId=${order.id}`}
                    className="inline-flex items-center text-sm text-green-600 hover:text-green-800"
                  >
                    <Star size={16} className="mr-1" /> Leave Review
                  </Link>
                )}
                <Link
                  to={`/cart?reorder=${order.id}`}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <ShoppingCart size={16} className="mr-1" /> Reorder
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};