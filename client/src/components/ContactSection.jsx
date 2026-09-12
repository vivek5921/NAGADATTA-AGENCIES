import React from 'react';
import { useShop } from '../context/ShopContext';
import { Phone, MessageCircle, MapPin, Instagram, Compass } from 'lucide-react';

export default function ContactSection() {
  const { settings } = useShop();

  const cleanPhone = settings.phone_number?.replace(/[^0-9+]/g, '') || '';
  const cleanWhatsapp = settings.whatsapp_number?.replace(/[^0-9]/g, '') || '';

  return (
    <section id="contact" className="py-10 sm:py-14 bg-slate-50 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Get In Touch
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            Contact Nagadatta Agencies
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Questions about product availability or spare parts? Reach out directly via Phone, WhatsApp, Instagram, or visit our showroom.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Call Shop */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Call Shop</h3>
              <p className="text-[11px] text-slate-500">Call us for direct product availability and inquiries.</p>
              <p className="font-bold text-slate-800 text-xs truncate">{settings.phone_number}</p>
            </div>
            <a
              href={`tel:${cleanPhone}`}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-sm transition-colors min-h-[40px]"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Shop</span>
            </a>
          </div>

          {/* Card 2: WhatsApp */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">WhatsApp</h3>
              <p className="text-[11px] text-slate-500">Message on WhatsApp for photos, specs, and parts.</p>
              <p className="font-bold text-emerald-700 text-xs">Direct Chat Support</p>
            </div>
            <a
              href={`https://wa.me/${cleanWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-sm transition-colors min-h-[40px]"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Card 3: Google Maps */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Showroom Address</h3>
              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{settings.address}</p>
            </div>
            {settings.google_maps_url ? (
              <a
                href={settings.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-sm transition-colors min-h-[40px]"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Get Directions</span>
              </a>
            ) : null}
          </div>

          {/* Card 4: Instagram */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
                <Instagram className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Instagram</h3>
              <p className="text-[11px] text-slate-500">Follow our official Instagram profile for updates.</p>
              <p className="font-bold text-pink-700 text-xs">@nagadatta_agencies</p>
            </div>
            {settings.instagram_url ? (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-sm transition-colors min-h-[40px]"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Follow us on Instagram</span>
              </a>
            ) : null}
          </div>

        </div>

      </div>
    </section>
  );
}
