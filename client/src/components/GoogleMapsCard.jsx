import React from 'react';
import { useShop } from '../context/ShopContext';
import { MapPin, Navigation, ExternalLink, Clock, Phone } from 'lucide-react';

export default function GoogleMapsCard() {
  const { settings } = useShop();

  const cleanPhone = settings.phone_number?.replace(/[^0-9+]/g, '') || '';

  return (
    <section className="py-10 sm:py-14 bg-gradient-to-b from-slate-900 to-slate-950 text-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        <div className="bg-slate-800/90 rounded-2xl p-6 sm:p-8 border border-slate-700/80 shadow-xl backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold text-xs uppercase tracking-wider border border-blue-500/20">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>Showroom Location</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                📍 Visit Nagadatta Agencies
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {settings.address || 'Near Tower Circle, Main Road, Karimnagar, Telangana - 505001, India'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block text-xs">Opening Hours</span>
                    <span className="text-[11px] text-slate-300">{settings.opening_hours || 'Mon - Sat: 9 AM - 9 PM'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block text-xs">Phone Call</span>
                    <a href={`tel:${cleanPhone}`} className="text-[11px] text-emerald-300 hover:underline">{settings.phone_number}</a>
                  </div>
                </div>
              </div>

              {/* Get Directions Button */}
              <div className="pt-2">
                {settings.google_maps_url ? (
                  <a
                    href={settings.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-5 py-3 rounded-xl shadow-md transition-all active:scale-95 text-xs sm:text-sm min-h-[44px]"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Get Directions</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
                  </a>
                ) : null}
              </div>

            </div>

            {/* Right Map Visual Badge */}
            <div className="lg:col-span-5">
              <div className="relative rounded-xl overflow-hidden border border-slate-700 shadow-xl bg-slate-900 aspect-16/10 sm:aspect-16/9 lg:aspect-4/3">
                <img
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80"
                  alt="Google Maps Location Karimnagar"
                  className="w-full h-full object-cover opacity-80"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-slate-950/50 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg mb-2">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Nagadatta Agencies</h4>
                  <p className="text-[11px] text-slate-300">Karimnagar, Telangana</p>
                  
                  {settings.google_maps_url && (
                    <a
                      href={settings.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 px-3 py-1.5 bg-white text-slate-900 hover:bg-blue-50 text-xs font-bold rounded-lg shadow transition-colors"
                    >
                      Open in Maps
                    </a>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
