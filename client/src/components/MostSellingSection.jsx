import React from 'react';
import { useShop } from '../context/ShopContext';
import ProductCard from './ProductCard';
import { Flame, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MostSellingSection() {
  const { products, loading } = useShop();

  const mostSellingProducts = products.filter(p => Boolean(p.is_most_selling));

  if (!loading && mostSellingProducts.length === 0) return null;

  return (
    <section id="most-selling" className="py-10 sm:py-14 bg-gradient-to-b from-amber-50/40 via-white to-slate-50 border-b border-amber-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 border-b border-amber-100 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs uppercase tracking-wider mb-1.5 border border-amber-200">
              <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
              <span>Customer In-Demand</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              🔥 Most Selling Products
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Top requested appliances loved by customers visiting our Karimnagar showroom.
            </p>
          </div>

          <Link
            to="/products?most_selling=true"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline shrink-0"
          >
            <span>View All Most Selling</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-72 bg-slate-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mostSellingProducts.slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
