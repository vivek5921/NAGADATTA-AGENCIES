import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Phone, MessageCircle, CheckCircle2, ShieldCheck, Tag, Wrench, PackageCheck, Layers } from 'lucide-react';
import api from '../services/api';

export default function ProductDetailModal() {
  const { selectedProduct, closeProductModal, settings, openProductModal } = useShop();
  const [activeImage, setActiveImage] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedSpareParts, setRelatedSpareParts] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      setActiveImage(selectedProduct.main_image);
      fetchExtraDetails(selectedProduct.id);
    }
  }, [selectedProduct]);

  const fetchExtraDetails = async (id) => {
    try {
      setLoadingDetails(true);
      const res = await api.get(`/products/${id}`);
      if (res.data.success) {
        setRelatedProducts(res.data.relatedProducts || []);
        setRelatedSpareParts(res.data.relatedSpareParts || []);
      }
    } catch (err) {
      console.error('Error loading extra product details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (!selectedProduct) return null;

  const cleanPhone = settings.phone_number?.replace(/[^0-9+]/g, '') || '';
  const cleanWhatsapp = settings.whatsapp_number?.replace(/[^0-9]/g, '') || '';
  const message = `Hello Nagadatta Agencies, I would like to inquire about "${selectedProduct.name}" (Model: ${selectedProduct.model_number || 'N/A'}, Brand: ${selectedProduct.brand}). Please share current pricing and availability.`;
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(message)}`;

  const allImages = [
    selectedProduct.main_image,
    ...(Array.isArray(selectedProduct.additional_images) ? selectedProduct.additional_images : [])
  ].filter(Boolean);

  const getAvailabilityBadge = (status) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            🟢 Available in Store
          </span>
        );
      case 'limited':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
            🟡 Limited Stock Available
          </span>
        );
      case 'out_of_stock':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
            🔴 Currently Out of Stock
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
            🟢 Available
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              {selectedProduct.category_name}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Brand: <strong className="text-slate-800">{selectedProduct.brand}</strong>
            </span>
          </div>

          <button
            onClick={closeProductModal}
            className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left: Product Gallery */}
            <div className="space-y-4">
              <div className="aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                <img
                  src={activeImage || selectedProduct.main_image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        activeImage === img ? 'border-brand-600 ring-2 ring-brand-300' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between text-xs text-blue-900 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Genuine Brand Warranty
                </span>
                <span className="font-semibold text-slate-700">Trusted Local Store</span>
              </div>
            </div>

            {/* Right: Product Meta & Specifications */}
            <div className="space-y-6 flex flex-col justify-between">
              
              <div className="space-y-3">
                
                <div>
                  <div className="mb-2">{getAvailabilityBadge(selectedProduct.availability)}</div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {selectedProduct.name}
                  </h2>
                  {selectedProduct.model_number && (
                    <p className="text-xs font-mono text-slate-500 mt-1">
                      Model Number: <span className="font-bold text-slate-700">{selectedProduct.model_number}</span>
                    </p>
                  )}
                </div>

                {/* Price Notice Card */}
                <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow">
                  <div>
                    <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Pricing Info</span>
                    <span className="text-base font-extrabold text-amber-300">
                      {selectedProduct.price_text || 'Contact shop for best price & deals'}
                    </span>
                  </div>
                  <Tag className="w-6 h-6 text-amber-400 opacity-80" />
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedProduct.description}
                </p>

                {/* Key Features Bulleted List */}
                {Array.isArray(selectedProduct.features) && selectedProduct.features.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Key Features:</h4>
                    <ul className="grid grid-cols-1 gap-1.5 text-xs text-slate-700">
                      {selectedProduct.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>

              {/* Action Contact Buttons (No Checkout) */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition-all active:scale-95 text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Shop ({settings.phone_number})</span>
                  </a>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition-all active:scale-95 text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Enquiry</span>
                  </a>
                </div>
                <p className="text-[11px] text-center text-slate-400 italic">
                  Note: Visit our shop in Karimnagar for live demo & wholesale discounts.
                </p>
              </div>

            </div>

          </div>

          {/* Specifications Table */}
          {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600" />
                <span>Technical Specifications</span>
              </h3>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
                  {Object.entries(selectedProduct.specifications).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1.5 border-b border-slate-200/60 last:border-0">
                      <span className="font-semibold text-slate-600">{key}:</span>
                      <span className="font-bold text-slate-900 text-right">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-brand-600" />
                <span>Related Products in {selectedProduct.category_name}</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedProducts.map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => openProductModal(rel)}
                    className="p-3 bg-white rounded-xl border border-slate-200 hover:border-brand-500 cursor-pointer text-xs space-y-1.5 transition-all shadow-sm hover:shadow"
                  >
                    <img src={rel.main_image} alt={rel.name} className="w-full h-20 object-cover rounded-lg bg-slate-100" />
                    <p className="font-bold text-slate-900 line-clamp-1">{rel.name}</p>
                    <p className="text-[10px] text-slate-500">{rel.brand}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compatible Spare Parts */}
          {relatedSpareParts.length > 0 && (
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600" />
                <span>Compatible Spare Parts Available</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedSpareParts.map(sp => (
                  <div key={sp.id} className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center gap-3">
                    <img src={sp.image_url} alt={sp.name} className="w-12 h-12 object-cover rounded-lg shrink-0 bg-white" />
                    <div className="text-xs">
                      <p className="font-bold text-slate-900">{sp.name}</p>
                      <p className="text-[11px] text-amber-800">{sp.compatible_with}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
