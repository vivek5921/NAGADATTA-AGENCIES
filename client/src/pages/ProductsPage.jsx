import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import SearchModal from '../components/SearchModal';
import { Search, Filter, AlertCircle, Package } from 'lucide-react';

export default function ProductsPage() {
  const { products, categories, loading } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [mostSellingOnly, setMostSellingOnly] = useState(searchParams.get('most_selling') === 'true');

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get('search');
    if (q) setSearchQuery(q);
    if (searchParams.get('most_selling') === 'true') setMostSellingOnly(true);
  }, [searchParams]);

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'all' || p.category_name === selectedCategory || String(p.category_id) === selectedCategory;
    const matchAvailability = availabilityFilter === 'all' || p.availability === availabilityFilter;
    const matchMostSelling = !mostSellingOnly || p.is_most_selling === 1;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category_name.toLowerCase().includes(q) ||
      (p.model_number && p.model_number.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );

    return matchCat && matchAvailability && matchMostSelling && matchSearch;
  });

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Page Header */}
        <div className="mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Showroom Catalogue
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            All Products Catalogue
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Browse our full range of electrical and home appliances. Contact shop for live price, models, and availability.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Search Input */}
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, brands, model #..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Category Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div className="md:col-span-3">
              <select
                value={availabilityFilter}
                onChange={e => setAvailabilityFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">All Availability Status</option>
                <option value="available">🟢 Available Only</option>
                <option value="limited">🟡 Limited Availability</option>
                <option value="out_of_stock">🔴 Out of Stock</option>
              </select>
            </div>

            {/* Most Selling Toggle */}
            <div className="md:col-span-2 flex items-center justify-end">
              <button
                onClick={() => setMostSellingOnly(!mostSellingOnly)}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all ${
                  mostSellingOnly
                    ? 'bg-amber-500 text-white border-amber-600 shadow'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🔥 Most Selling
              </button>
            </div>

          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6 text-xs text-slate-500 font-semibold">
          <p>Showing <strong>{filteredProducts.length}</strong> products</p>
          {(selectedCategory !== 'all' || searchQuery || availabilityFilter !== 'all' || mostSellingOnly) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setAvailabilityFilter('all');
                setMostSellingOnly(false);
                setSearchParams({});
              }}
              className="text-brand-600 hover:underline font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-slate-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 max-w-lg mx-auto my-12 space-y-4">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-xl font-extrabold text-slate-900">No products match your filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try changing category or clearing search terms to view products in our catalogue.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>

      <ProductDetailModal />
      <SearchModal />
    </main>
  );
}
