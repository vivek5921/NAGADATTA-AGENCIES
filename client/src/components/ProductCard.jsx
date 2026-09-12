import React from 'react';
import { useShop } from '../context/ShopContext';
import { MessageCircle, Flame, Eye } from 'lucide-react';

export default function ProductCard({ product }) {
  const { openProductModal, settings } = useShop();

  const getAvailabilityBadge = (status) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Available</span>
          </span>
        );
      case 'limited':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Limited</span>
          </span>
        );
      case 'out_of_stock':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>Out of Stock</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-100 text-emerald-800 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Available</span>
          </span>
        );
    }
  };

  const cleanWhatsapp = settings.whatsapp_number?.replace(/[^0-9]/g, '') || '';
  const message = `Hello Nagadatta Agencies, I would like to inquire about "${product.name}" (Model: ${product.model_number || 'N/A'}, Brand: ${product.brand}). Please share availability and details.`;
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(message)}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col justify-between overflow-hidden group">
      
      {/* Product Image & Badges Container */}
      <div
        className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer"
        onClick={() => openProductModal(product)}
      >
        <img
          src={product.main_image || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.is_most_selling === 1 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
              <Flame className="w-3 h-3 fill-white" />
              <span>Most Selling</span>
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-sm self-start">
            {product.brand}
          </span>
        </div>

        {/* Availability Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          {getAvailabilityBadge(product.availability)}
        </div>
      </div>

      {/* Product Information Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-brand-600 truncate">
              {product.category_name}
            </span>
            {product.model_number && (
              <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[10px] shrink-0 ml-1">
                Mod: {product.model_number}
              </span>
            )}
          </div>

          <h3
            onClick={() => openProductModal(product)}
            className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {product.name}
          </h3>

          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
            {product.description || 'High-performance appliance with genuine manufacturer warranty.'}
          </p>

        </div>

        {/* Pricing / Details Notice & Action Buttons */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          
          <div className="bg-slate-50 rounded-lg py-1.5 px-2 text-center border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-700 block truncate">
              {product.price_text || 'Contact shop for price/details'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => openProductModal(product)}
              className="w-full inline-flex items-center justify-center gap-1 bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold py-2 px-2.5 rounded-xl transition-colors min-h-[38px]"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-xs font-bold py-2 px-2.5 rounded-xl transition-all min-h-[38px]"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>

        </div>

      </div>

    </div>
  );
}
