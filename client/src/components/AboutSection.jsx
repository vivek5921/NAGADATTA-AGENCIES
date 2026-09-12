import React from 'react';
import { useShop } from '../context/ShopContext';
import { ShieldCheck, ThumbsUp, Store, Clock } from 'lucide-react';

export default function AboutSection() {
  const { settings } = useShop();

  return (
    <section className="py-10 sm:py-14 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold text-xs uppercase tracking-wider mb-2 border border-brand-200">
                <Store className="w-3.5 h-3.5 text-brand-600" />
                <span>About Nagadatta Agencies</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Your Trusted Appliance Showcase in Karimnagar
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {settings.about_us ||
                'Nagadatta Agencies is Karimnagar’s trusted showroom for high-performance electrical home appliances and genuine replacement spare parts. We display a wide selection of top brands in coolers, ceiling & pedestal fans, geysers, mixer grinders, and kitchen appliances, offering reliable service and original brand warranty support.'}
            </p>

            {/* Why Choose Us Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Genuine Brand Products</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Authorised products from top brands like V-Guard, Symphony, Bajaj, Havells, Crompton, and Sujata.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <Store className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Trusted Local Store</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Physical store located in Karimnagar for direct inspection and hands-on demonstrations.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <ThumbsUp className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Genuine Spare Parts</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Dedicated inventory of authentic replacement motors, pumps, capacitors, and jars.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Prompt Assistance</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Direct phone and WhatsApp support for product specifications and availability.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Visual Image */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-slate-100 bg-slate-100 aspect-4/3 sm:aspect-16/10 lg:aspect-4/3">
              <img
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80"
                alt="Nagadatta Agencies Karimnagar Showroom"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-3 left-3 right-3 text-white p-3 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/60">
                <h4 className="font-bold text-xs">Nagadatta Agencies</h4>
                <p className="text-[10px] text-slate-300">Tower Circle, Karimnagar, Telangana</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
