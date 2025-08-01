import React, { useEffect, useState } from 'react';
import { Search, MapPin, Filter, ShoppingCart, TrendingUp, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useProductStore } from '../../stores/productStore';
import { useAuthStore } from '../../stores/authStore';
import { ProductCard } from '../common/ProductCard';
import { ProductModal } from '../common/ProductModal';
import { Product } from '../../types/product.types';
import { Link } from 'react-router-dom';

export const BrowseProduct: React.FC = () => {
  const { user } = useAuthStore();
  const {
    getFilteredProducts,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    marketPrices,
    fetchProducts,
    fetchMarketPrices, 
    isLoading
  } = useProductStore();

  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showMarketPrices, setShowMarketPrices] = useState(true); // New state for collapsable market prices



  const filteredProducts = getFilteredProducts();
  const categories = ['Grains', 'Vegetables', 'Fruits', 'Herbs', 'Livestock'];

  if (isLoading && filteredProducts.length === 0) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="ml-2 text-lg text-text">Loading products...</p>
      </div>
    );
  }
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
                {user?.location?.address || 'Loading location...'} {/* Handle potential null location */}
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
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Market Prices */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-border mb-8">
          <div className="p-6 border-b border-neutral-border flex justify-between items-center">
            <h2 className="text-xl font-semibold text-text">Market Prices Today</h2>
            <button
              onClick={() => setShowMarketPrices(!showMarketPrices)}
              className="text-text-muted hover:text-text transition-colors"
              aria-expanded={showMarketPrices}
              aria-controls="market-prices-content"
            >
              {showMarketPrices ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
          {showMarketPrices && (
            <div id="market-prices-content" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {marketPrices.map((price) => (
                  <div key={price.id} className="p-4 bg-neutral rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-text">{price.crop_name}</h3>
                        {price.specification && (
                          <p className="text-sm text-text-muted">{price.specification}</p>
                        )}
                        <p className="text-sm text-text-muted">{price.region}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-secondary">
                          ₱{price.price}/{price.unit}
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
          )}
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
            {filteredProducts.length === 0 && !isLoading ? ( // Show "No products found" only if not loading and no products
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
    </div>
  );
};