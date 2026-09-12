import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Wrench, Search, MessageCircle, AlertCircle, X } from 'lucide-react';

export default function SparePartsSection({ showHeader = true, isPage = false }) {
  const { spareParts, settings } = useShop();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { label: 'All Spare Parts', value: 'all' },
    { label: 'Cooler Parts', value: 'Cooler' },
    { label: 'Fan Parts', value: 'Fan' },
    { label: 'Grinder Parts', value: 'Grinder' },
    { label: 'Geyser / Water Heater Parts', value: 'Water Heater' },
  ];

  const filteredParts = spareParts.filter(part => {
    const matchCat = selectedCategory === 'all' || part.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || (
      part.name.toLowerCase().includes(q) ||
      (part.compatible_with && part.compatible_with.toLowerCase().includes(q)) ||
      (part.model_number && part.model_number.toLowerCase().includes(q)) ||
      (part.description && part.description.toLowerCase().includes(q))
    );
    return matchCat && matchSearch;
  });

  const cleanWhatsapp = settings.whatsapp_number?.replace(/[^0-9]/g, '') || '';

  return (
    <section className={`py-10 sm:py-14 ${isPage ? 'bg-slate-50' : 'bg-slate-100/70 border-b border-slate-200'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {showHeader && (
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white font-bold text-xs uppercase tracking-wider mb-2">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Replacement Components</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Genuine Spare Parts Catalogue
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Find authentic replacement pumps, motors, capacitors, regulators, jars, couplers, heating elements, and thermostats.
            </p>
          </div>
        )}

        {/* Filters & Search Bar */}
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200 mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
            
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input with Clear Button */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search spare parts (e.g. pump)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Spare Parts Grid */}
        {filteredParts.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200 max-w-sm mx-auto my-6">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">No spare parts found</h3>
            <p className="text-xs text-slate-500 mt-1">Try searching with another keyword or selecting All Spare Parts.</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParts.map(sp => {
              const waMsg = `Hello Nagadatta Agencies, I need spare part: "${sp.name}" (${sp.compatible_with}). Please confirm availability.`;
              const waUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(waMsg)}`;

              return (
                <div
                  key={sp.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    
                    <div className="flex gap-3 items-start">
                      <img
                        src={sp.image_url || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80'}
                        alt={sp.name}
                        className="w-16 h-16 object-cover rounded-lg bg-slate-100 border border-slate-200 shrink-0"
                        loading="lazy"
                      />
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                          {sp.category}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug truncate">{sp.name}</h4>
                        {sp.model_number && (
                          <p className="text-[10px] font-mono text-slate-400">Mod: {sp.model_number}</p>
                        )}
                      </div>
                    </div>

                    {/* Compatibility Info */}
                    {sp.compatible_with && (
                      <div className="bg-amber-50/80 rounded-lg p-2 border border-amber-200/60 text-[11px] text-amber-900">
                        <span className="font-bold text-[10px] uppercase tracking-wider text-amber-800 block">
                          Compatibility:
                        </span>
                        <span className="line-clamp-2">{sp.compatible_with}</span>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                      {sp.description}
                    </p>

                  </div>

                  {/* Footer Status & Enquiry */}
                  <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                    <div>
                      {sp.availability === 'available' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg shadow-sm transition-colors min-h-[34px]"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Enquire</span>
                    </a>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
