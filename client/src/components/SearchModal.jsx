import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Search, X, Package, Wrench, ChevronRight, AlertCircle } from 'lucide-react';

export default function SearchModal() {
  const { isSearchOpen, setIsSearchOpen, products, spareParts, openProductModal, settings } = useShop();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isSearchOpen) {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedProducts = q ? products.filter(p => (
    p.name.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q) ||
    p.category_name.toLowerCase().includes(q) ||
    (p.model_number && p.model_number.toLowerCase().includes(q)) ||
    (p.description && p.description.toLowerCase().includes(q))
  )) : [];

  const matchedSpareParts = q ? spareParts.filter(sp => (
    sp.name.toLowerCase().includes(q) ||
    sp.category.toLowerCase().includes(q) ||
    sp.compatible_with.toLowerCase().includes(q) ||
    (sp.model_number && sp.model_number.toLowerCase().includes(q))
  )) : [];

  const totalResults = matchedProducts.length + matchedSpareParts.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Input Bar */}
        <div className="relative p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
          <Search className="w-6 h-6 text-brand-600 shrink-0 ml-2" />
          <input
            type="text"
            placeholder="Search products, brands, model #, spare parts (e.g. pump, V-Guard, cooler)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-slate-900 font-semibold text-base sm:text-lg focus:outline-none placeholder:text-slate-400"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 overflow-y-auto space-y-6 flex-1">
          
          {!q ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Search className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-sm font-medium">Type a search term to find products and spare parts.</p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {['Air Cooler', 'V-Guard', 'Capacitor', 'Pump', 'Mixer Grinder', 'Geyser'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 rounded-full text-xs font-semibold text-slate-600 transition-colors"
                  >
                    "{tag}"
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto opacity-80" />
              <h3 className="font-extrabold text-slate-900 text-lg">No products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn't find any results matching <strong className="text-slate-800">"{query}"</strong>. Please check your spelling or try searching for another term.
              </p>
              <button
                onClick={() => setQuery('')}
                className="inline-block px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <>
              {/* Product Results */}
              {matchedProducts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Package className="w-4 h-4 text-brand-600" />
                    <span>Products ({matchedProducts.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {matchedProducts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          openProductModal(p);
                        }}
                        className="p-3 rounded-2xl border border-slate-100 hover:border-brand-300 hover:bg-brand-50/50 cursor-pointer flex items-center justify-between transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={p.main_image}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
                              {p.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="font-semibold text-brand-600">{p.brand}</span>
                              <span>•</span>
                              <span>{p.category_name}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Spare Parts Results */}
              {matchedSpareParts.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Wrench className="w-4 h-4 text-amber-600" />
                    <span>Spare Parts ({matchedSpareParts.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {matchedSpareParts.map(sp => (
                      <div
                        key={sp.id}
                        className="p-3 rounded-2xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50/40 flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={sp.image_url}
                            alt={sp.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{sp.name}</p>
                            <p className="text-xs text-amber-800">{sp.compatible_with}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 px-2 py-1 rounded-md">
                          Spare Part
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        <div className="p-3 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-500">
          Showing results for Nagadatta Agencies Digital Catalogue
        </div>

      </div>

    </div>
  );
}
