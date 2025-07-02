import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import { Layout } from './components/common/Layout';

// Splash and Auth Components
import { SplashScreen } from './components/auth/SplashScreen';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';

// Seller Components
import { SellerDashboard } from './components/seller/Dashboard';
import { VerificationForm } from './components/seller/VerificationForm';
import { VerificationStatus } from './components/seller/VerificationStatus';
import { MyShopfront } from './components/farmer/MyShopfront';
import { MarketIntelligence } from './components/farmer/MarketIntelligence';
import { FarmerMessages } from './components/farmer/FarmerMessages';
import { UpdateLocation } from './components/farmer/UpdateLocation';
import { MyOrders as FarmerOrders } from './components/farmer/MyOrders';
import { RatingsReviews } from './components/farmer/RatingsReviews';

// Buyer Components
import { BuyerDashboard } from './components/buyer/Dashboard';
import { BrowseProduct } from './components/buyer/BrowseProduct';
import { MyOrders as BuyerOrders } from './components/buyer/MyOrders';
import { BuyerMessages } from './components/buyer/BuyerMessages';
import { Reviews } from './components/buyer/Reviews';
import { MarketIntelligence as BuyerMarketIntelligence } from './components/buyer/MarketIntelligence';
import ShoppingCart from './components/buyer/ShoppingCart';
import MapComponent from './components/buyer/Map';

// Admin Components
import { AdminDashboard } from './components/admin/Dashboard';
import { FarmerProfiles } from './components/admin/FarmerProfiles';
import { CropModeration } from './components/admin/CropModeration';
import { ReportsDisputes } from './components/admin/ReportsDisputes';
import { MarketIntelligence as AdminMarketIntelligence } from './components/admin/MarketIntelligence';

// Shared Components
import { Settings } from './components/shared/Settings';
import { Notifications } from './components/common/Notifications';

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;

  if (!isAuthenticated) {
    return (
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignupPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    );
  }

  const getDashboardRoute = () => {
    switch (user?.role) {
      case 'seller':
        const seller = user as any;
        return !seller.verificationStatus ? '/seller/verification' : '/seller/dashboard';
      case 'buyer':
        return '/buyer/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/dashboard';
    }
  };

  const getDashboardComponent = () => {
    switch (user?.role) {
      case 'seller':
        return <SellerDashboard />;
      case 'buyer':
        return <BuyerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <div className="p-8 text-center">Dashboard not found</div>;
    }
  };

  const seller = user?.role === 'seller' ? user as any : null;

  const sampleMarkers = [
    { lat: 10.3157, lng: 123.8854, label: "Cebu City" },
    { lat: 10.3111, lng: 123.8917, label: "Carbon Market" },
  ];

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Common Routes */}
          <Route path="/dashboard" element={getDashboardComponent()} />
          <Route path="/notifications" element={<Notifications />} />

          {/* Seller Routes */}
          {user?.role === 'seller' && (
            <>
              <Route path="/seller/dashboard" element={<SellerDashboard />} />
              <Route path="/seller/verification" element={
                seller?.verificationStatus ? <VerificationStatus /> : <VerificationForm />
              } />
              <Route path="/seller/shopfront" element={<MyShopfront />} />
              <Route path="/seller/products" element={<MyShopfront />} />
              <Route path="/seller/orders" element={<FarmerOrders />} />
              <Route path="/seller/analytics" element={<div className="p-8">Analytics Coming Soon</div>} />
              <Route path="/seller/reviews" element={<RatingsReviews />} />
              <Route path="/seller/market-intelligence" element={<MarketIntelligence />} />
              <Route path="/seller/messages" element={<FarmerMessages />} />
              <Route path="/seller/location" element={<UpdateLocation />} />
            </>
          )}

          {/* Buyer Routes */}
          {user?.role === 'buyer' && (
            <>
              <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
              <Route path="/marketplace" element={<BrowseProduct />} />
              <Route path="/buyer/market-intelligence" element={<BuyerMarketIntelligence />} />
              <Route path="/buyer/cart" element={<ShoppingCart />} />
              <Route path="/orders" element={<BuyerOrders />} />
              <Route path="/messages" element={<BuyerMessages />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/cart" element={<ShoppingCart />} />
            </>
          )}

          {/* Admin Routes */}
          {user?.role === 'admin' && (
            <>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<FarmerProfiles />} />
              <Route path="/admin/verifications" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<CropModeration />} />
              <Route path="/admin/reports" element={<ReportsDisputes />} />
              <Route path="/admin/market-intelligence" element={<AdminMarketIntelligence />} />
              <Route path="/admin/analytics" element={<div className="p-8">Analytics Coming Soon</div>} />
            </>
          )}

          {/* Common Routes */}
          <Route path="/messages" element={user?.role === 'seller' ? <FarmerMessages /> : <BuyerMessages />} />
          <Route path="/profile" element={<Settings />} />
          <Route path="/settings" element={<Settings />} />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to={getDashboardRoute()} replace />} />
          <Route path="*" element={<Navigate to={getDashboardRoute()} replace />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
