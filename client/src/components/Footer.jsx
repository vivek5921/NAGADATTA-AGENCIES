import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Phone, MapPin, Instagram, MessageCircle, Clock, ExternalLink, Lock } from 'lucide-react';

export default function Footer() {
  const { settings } = useShop();

  const cleanPhone = settings.phone_number?.replace(/[^0-9+]/g, '') || '';
  const cleanWhatsapp = settings.whatsapp_number?.replace(/[^0-9]/g, '') || '';

  return (
    <footer className="bg-slate-900 text-slate-300 pt-10 pb-6 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="" className="w-8 h-8 rounded-lg object-contain" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                  N
                </div>
              )}
              <div>
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  {settings.shop_name || 'Nagadatta Agencies'}
                </h3>
                <p className="text-[10px] text-brand-400 font-semibold tracking-wider uppercase">
                  {settings.tagline || 'Electrical & Home Appliances'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {settings.footer_text || 'Karimnagar’s digital product showroom for air coolers, ceiling fans, geysers, mixer grinders, and genuine spare parts.'}
            </p>

            <div className="pt-1 flex items-center gap-2">
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-800 text-pink-400 hover:bg-pink-600 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.google_maps_url && (
                <a
                  href={settings.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-800 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                  aria-label="Google Maps"
                >
                  <MapPin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 border-l-2 border-brand-500 pl-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-brand-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-brand-400 transition-colors">Products</Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-brand-400 transition-colors">Categories</Link>
              </li>
              <li>
                <Link to="/spare-parts" className="hover:text-brand-400 transition-colors">Spare Parts</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-400 transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-400 transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 border-l-2 border-brand-500 pl-2">
              Contact Shop
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{settings.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <a href={`tel:${cleanPhone}`} className="hover:text-white font-semibold">
                  {settings.phone_number}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${cleanWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 font-semibold"
                >
                  WhatsApp Enquiry
                </a>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                <span>{settings.opening_hours}</span>
              </li>
            </ul>
          </div>

          {/* Location & Directions */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 border-l-2 border-brand-500 pl-2">
              Get Directions
            </h4>
            <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
              Open the official Google Maps location of our Karimnagar showroom for instant GPS directions.
            </p>
            {settings.google_maps_url ? (
              <a
                href={settings.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 px-3 rounded-xl shadow-sm transition-colors text-xs"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Get Directions</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
              </a>
            ) : null}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} {settings.shop_name || 'Nagadatta Agencies'}. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span>Digital Product Showcase • Karimnagar, Telangana</span>
            {/* Discreet admin link in footer */}
            <Link
              to="/admin/login"
              className="text-slate-600 hover:text-slate-400 transition-colors p-1"
              title="Portal"
              aria-label="Portal Login"
            >
              <Lock className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
