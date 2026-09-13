import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ChevronRight, Grid } from 'lucide-react';

export default function CategoriesSection() {
  const { categories, loading } = useShop();
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  const activeCategories = categories.filter(cat => Boolean(cat.is_active));

  return (
    <section className="py-10 sm:py-14 bg-slate-50 border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 border-b border-slate-200 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Grid className="w-3.5 h-3.5" />
              <span>Browse Catalogue</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Product Categories
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            Explore our curated digital showroom of appliances and genuine spare parts.
          </p>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-36 bg-slate-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {activeCategories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className="group bg-white rounded-xl p-3 sm:p-3.5 shadow-sm border border-slate-200 hover:border-brand-400 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                {/* Category Thumbnail */}
                <div className="w-full h-24 sm:h-28 rounded-lg overflow-hidden bg-slate-100 mb-2 relative">
                  <img
                    src={cat.image_url || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80'}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
                </div>

                {/* Category Title & Icon */}
                <div className="flex items-center justify-between pt-0.5">
                  <h3 className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-brand-600 transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-brand-600 text-slate-500 group-hover:text-white flex items-center justify-center transition-all shrink-0 ml-1">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
