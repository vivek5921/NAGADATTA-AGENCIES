import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Phone, ArrowRight, ShieldCheck, Wrench, Store, Sparkles } from 'lucide-react';

export default function Hero() {
  const { settings } = useShop();

  const heroImageSrc = settings.hero_image || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80';

  return (
    <section className="relative overflow-hidden bg-slate-900 text-white py-8 sm:py-12 lg:py-16">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand-500 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          
          {/* Hero Content (Mobile Stack: Badge -> Heading -> Description -> Buttons) */}
          <div className="lg:col-span-7 space-y-4 text-center lg:text-left flex flex-col items-center lg:items-start">
            
            {/* Location / Business Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-900/80 border border-brand-700/60 text-brand-300 text-xs font-semibold tracking-wide shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Digital Product Showcase • Karimnagar</span>
            </div>

            {/* Heading & Subtitle */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
                {settings.hero_title || 'Nagadatta Agencies'}
              </h1>
              <p className="text-brand-400 font-semibold text-base sm:text-lg">
                {settings.hero_subtitle || 'Your Trusted Electrical & Home Appliance Store'}
              </p>
            </div>

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {settings.hero_description ||
                'Explore air coolers, ceiling & pedestal fans, water heaters, geysers, electric cookers, mixer grinders, stoves, and genuine spare parts available at our Karimnagar showroom.'}
            </p>

            {/* Action Buttons (Tap-friendly, side-by-side or stacked on tiny screens) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link
                to="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all text-sm active:scale-95 min-h-[44px]"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold px-6 py-3 rounded-xl border border-slate-700 transition-all text-sm active:scale-95 min-h-[44px]"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Contact Us</span>
              </Link>
            </div>

            {/* Trust Features (NO "Wholesale Pricing" - Only Truthful Badges) */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-slate-300 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Genuine Brands</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Genuine Spare Parts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Store className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Trusted Local Store</span>
              </div>
            </div>

          </div>

          {/* Hero Right / Mobile Stack Bottom Image */}
          <div className="lg:col-span-5 w-full">
            <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
              
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-700/80 bg-slate-800 group aspect-4/3 sm:aspect-16/10 lg:aspect-4/3">
                <img
                  src={heroImageSrc}
                  alt={settings.shop_name || 'Nagadatta Agencies Showroom'}
                  className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-500"
                  loading="eager"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                
                {/* Overlay Badge */}
                <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 flex items-center justify-between">
                  <div className="truncate pr-2">
                    <h4 className="font-bold text-white text-xs truncate">Nagadatta Agencies</h4>
                    <p className="text-[10px] text-brand-400 font-medium truncate">Digital Product Showcase</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                    🟢 Open Today
                  </span>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
