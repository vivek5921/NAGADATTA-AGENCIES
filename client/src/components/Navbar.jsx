import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Search, Phone, Instagram, Menu, X, Flame, Wrench } from 'lucide-react';

export default function Navbar() {
  const { settings, setIsSearchOpen } = useShop();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Categories', path: '/categories' },
    { name: 'Spare Parts', path: '/spare-parts' },
    { name: 'Most Selling', path: '/#most-selling' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const cleanPhone = settings.phone_number?.replace(/[^0-9+]/g, '') || '';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      {/* Top Announcement / Contact Bar */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <p className="font-medium truncate flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>📍 Showroom & Digital Showcase • Karimnagar, Telangana</span>
          </p>
          <div className="hidden md:flex items-center gap-6 text-slate-200 text-xs">
            <span>🕒 {settings.opening_hours || 'Mon - Sat: 9 AM - 9 PM'}</span>
            <a
              href={`tel:${cleanPhone}`}
              className="hover:text-white font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{settings.phone_number}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-2.5 group">
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.shop_name || 'Nagadatta Agencies'}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-transform">
                N
              </div>
            )}
            <div className="min-w-0">
              <span className="block font-extrabold text-base sm:text-xl text-slate-900 tracking-tight leading-tight group-hover:text-brand-600 transition-colors truncate">
                {settings.shop_name || 'Nagadatta Agencies'}
              </span>
              <span className="block text-[10px] sm:text-xs font-semibold text-brand-600 tracking-wider uppercase truncate">
                {settings.tagline || 'Electrical & Home Appliances'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path.includes('#') && location.hash === link.path.substring(1));
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    isActive
                      ? 'text-brand-600 bg-brand-50'
                      : 'text-slate-700 hover:text-brand-600 hover:bg-slate-50'
                  }`}
                >
                  {link.name === 'Most Selling' && <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                  {link.name === 'Spare Parts' && <Wrench className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons (Search, Instagram, Call) - NO Admin button here */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Search Trigger Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:text-brand-600 hover:bg-brand-50 border border-slate-200 transition-colors"
              title="Search catalogue"
              aria-label="Search product catalogue"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Instagram Profile Link */}
            {settings.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl text-slate-600 hover:text-pink-600 hover:bg-pink-50 border border-slate-200 transition-colors"
                title="Follow us on Instagram"
                aria-label="Follow Nagadatta Agencies on Instagram"
              >
                <Instagram className="w-4 h-4 text-pink-600" />
              </a>
            )}

            {/* Call Button */}
            <a
              href={`tel:${cleanPhone}`}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow hover:from-brand-700 hover:to-brand-800 transition-all active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Shop</span>
            </a>
          </div>

          {/* Mobile Search & Hamburger */}
          <div className="flex sm:hidden items-center gap-1.5">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-slate-800" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1 shadow-xl animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-brand-50 hover:text-brand-600 transition-colors"
            >
              {link.name === 'Most Selling' && <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />}
              {link.name === 'Spare Parts' && <Wrench className="w-4 h-4 text-slate-500" />}
              <span>{link.name}</span>
            </Link>
          ))}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            {settings.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-pink-50 text-pink-700 font-bold py-2.5 rounded-xl text-xs border border-pink-200 transition-colors"
              >
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>Instagram</span>
              </a>
            )}

            <a
              href={`tel:${cleanPhone}`}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white font-bold py-2.5 rounded-xl text-xs text-center shadow transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call Shop ({settings.phone_number})</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
