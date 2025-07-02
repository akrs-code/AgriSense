import React, { useState } from 'react';
import { Search, MapPin, Filter, ShoppingCart, TrendingUp } from 'lucide-react';
import { useProductStore } from '../../stores/productStore';
import { useAuthStore } from '../../stores/authStore';
import { ProductCard } from '../common/ProductCard';
import { ProductModal } from '../common/ProductModal';
import { Product } from '../../types';
import { Link } from 'react-router-dom';

// Map imports
import MapComponent from './Map';
import { useFarmerModerationStore } from '../../stores/farmerModerationStore';
import { SellerMarkerData, ProductMarkerData } from './Map';
import { FarmerModal } from '../common/FarmerModal';


export const BrowseProduct: React.FC = () => {
  


  const { user } = useAuthStore();
  const {
    getFilteredProducts,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    marketPrices,
  } = useProductStore();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = getFilteredProducts();

  // toggle between product and farmer
  const [mapViewMode, setMapViewMode] = useState<'products' | 'sellers'>('products');
  const [selectedSeller, setSelectedSeller] = useState<{ seller: SellerMarkerData; products: Product[] } | null>(null);

  // initialize filter for radius
  React.useEffect(() => {
    if (user?.location?.lat && user?.location?.lng) {
      setFilters({ userLocation: { lat: user.location.lat, lng: user.location.lng } });
    }
  }, [user]);
  // needed to join product and seller
  const { farmerProfiles } = useFarmerModerationStore(); 
  



  //product locations
  const productMarkers: ProductMarkerData[] = filteredProducts
    .filter(product => product.location?.lat && product.location?.lng)
    .map(product => {
      const seller = farmerProfiles.find(farmer => farmer.id === product.sellerId);
      return {
        type: 'product',
        lat: product.location.lat,
        lng: product.location.lng,
        label: product.name,
        price: product.price,
        unit: product.unit,
        category: product.category,
        condition: product.condition,
        productId: product.id,
        sellerName: seller?.name,
        businessName: seller?.businessName,
        address: product.location.address
      };
    });

  const sellerMarkers: SellerMarkerData[] = Object.values(
    filteredProducts.reduce((acc, product) => {
      const seller = farmerProfiles.find(f => f.id === product.sellerId);
      if (!seller) return acc;

      if (!acc[product.sellerId]) {
        acc[product.sellerId] = {
        type: 'seller',
        sellerId: product.sellerId,
        lat: product.location.lat,
        lng: product.location.lng,
        label: seller.businessName || `Seller: ${seller.name}`,
        sellerName: seller.name,
        businessName: seller.businessName,
        profileImageUrl: seller.profileImageUrl,
        email: seller.email,                  
        phone: seller.phone,                     
        products: [],
        address: seller.location.address
      };

      }

      acc[product.sellerId].products.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        category: product.category,
        condition: product.condition,
      });



      return acc;
    }, {} as Record<string, SellerMarkerData>)
  );



  const handleMarkerClick = (productId: string) => {
    if (mapViewMode !== 'products') return;
    const clickedProduct = filteredProducts.find(p => p.id === productId);
    if (clickedProduct) {
      setSelectedProduct(clickedProduct);
    }
  };



  const categories = ['Grains', 'Vegetables', 'Fruits', 'Herbs', 'Livestock'];


  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-neutral-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-text">Marketplace</h1>
              <p className="text-text-muted mt-1 flex items-center">
                <MapPin size={16} className="mr-1" />
                {user?.location.address}
              </p>
            </div>
            <Link
              to="/buyer/market-intelligence"
              className="flex items-center space-x-2 bg-info text-white px-4 py-2 rounded-lg hover:bg-info/90 transition-colors"
            >
              <TrendingUp size={20} />
              <span>Market Intelligence</span>
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="text"
                  placeholder="Search for products, categories, or farmers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-neutral-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-white border border-neutral-border px-6 py-3 rounded-xl hover:bg-neutral transition-colors"
            >
              <Filter size={20} />
              <span>Filters</span>
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-neutral rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ category: e.target.value })}
                    className="w-full border border-neutral-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="Enter location"
                    value={filters.location}
                    onChange={(e) => setFilters({ location: e.target.value })}
                    className="w-full border border-neutral-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Condition</label>
                  <select
                    value={filters.condition}
                    onChange={(e) => setFilters({ condition: e.target.value })}
                    className="w-full border border-neutral-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">All Conditions</option>
                    <option value="fresh">Fresh</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Price Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange[0]}
                      onChange={(e) =>
                        setFilters({ priceRange: [Number(e.target.value), filters.priceRange[1]] })
                      }
                      className="w-full border border-neutral-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange[1]}
                      onChange={(e) =>
                        setFilters({ priceRange: [filters.priceRange[0], Number(e.target.value)] })
                      }
                      className="w-full border border-neutral-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Search Radius (km)</label>
                  <input
                    type="number"
                    placeholder="e.g. 10"
                    value={filters.radiusKm || ''}
                    onChange={(e) => setFilters({ radiusKm: Number(e.target.value) || null })}
                    className="w-full border border-neutral-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

              </div>
            </div>
          )}
        </div>
      </div>


      {/* Map of Farm/Product Locations 
          Show product markers on the map using location data from filteredProducts
      */}
      {/* button to toggle between seller and product for the map */}
      <div className="flex space-x-2 mt-4">
        <button
          onClick={() => setMapViewMode('products')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            mapViewMode === 'products'
              ? 'bg-green-500 text-white'
              : 'bg-white border border-gray-300 text-gray-700'
          }`}
        >
          Show Products
        </button>
        <button
          onClick={() => setMapViewMode('sellers')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            mapViewMode === 'sellers'
              ? 'bg-green-500 text-white'
              : 'bg-white border border-gray-300 text-gray-700'
          }`}
        >
          Show Sellers
        </button>
      </div>
      {/* Actual map */}
      {user?.location?.lat && user?.location?.lng && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-border mb-8">
          <div className="p-6 border-b border-neutral-border">
            <h2 className="text-xl font-semibold text-text">Your Location</h2>
          </div>
          <div className="p-6">
            <div className="relative z-0">
              <MapComponent
                center={[user.location.lat, user.location.lng]}
                markers={[
                  ...(mapViewMode === 'products' ? productMarkers : sellerMarkers),
                  {
                    type: 'user',
                    lat: user.location.lat,
                    lng: user.location.lng,
                    label: user.name || 'Your Farm'
                  }
                ]}
                radiusKm={filters.radiusKm || undefined}
                onProductMarkerClick={handleMarkerClick}
                onSellerMarkerClick={(sellerId) => {
                  const sellerMarker = sellerMarkers.find(s => s.sellerId === sellerId);
                  if (!sellerMarker) return;
                  const productsBySeller = filteredProducts.filter(p => p.sellerId === sellerId);
                  setSelectedSeller({ seller: sellerMarker, products: productsBySeller });
                }}
                viewMode={mapViewMode} 

              />

            </div>
          </div>
        </div>
      )}




      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Market Prices */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-border mb-8">
          <div className="p-6 border-b border-neutral-border">
            <h2 className="text-xl font-semibold text-text">Market Prices Today</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {marketPrices.map((price) => (
                <div key={price.id} className="p-4 bg-neutral rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-text">{price.productName}</h3>
                      <p className="text-sm text-text-muted">{price.region}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-secondary">
                        ₱{price.averagePrice}/{price.unit}
                      </p>
                      <div
                        className={`flex items-center text-xs ${
                          price.trend === 'up'
                            ? 'text-success'
                            : price.trend === 'down'
                            ? 'text-error'
                            : 'text-text-muted'
                        }`}
                      >
                        <span>{price.trend === 'up' ? '↗' : price.trend === 'down' ? '↘' : '→'}</span>
                        <span className="ml-1">{price.trend}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-border">
          <div className="p-6 border-b border-neutral-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text">
                Available Products ({filteredProducts.length})
              </h2>
            </div>
          </div>

          <div className="p-6">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="mx-auto h-12 w-12 text-text-muted mb-4" />
                <h3 className="text-lg font-semibold text-text mb-2">No products found</h3>
                <p className="text-text-muted">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onView={setSelectedProduct}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      {selectedSeller && (
        <FarmerModal
          isOpen={!!selectedSeller}
          onClose={() => setSelectedSeller(null)}
          sellerData={selectedSeller.seller}
          products={selectedSeller.products}
          onProductClick={(product) => {
            setSelectedSeller(null); // close seller modal
            setSelectedProduct(product); // Open product modal
          }}
        />

      )}

    </div>
  );
};
