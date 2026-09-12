import React from 'react';
import { useShop } from '../context/ShopContext';
import { Instagram, ArrowRight, Sparkles } from 'lucide-react';

export default function InstagramBanner() {
  const { settings } = useShop();

  if (!settings.instagram_url) return null;

  return (
    <section className="py-12 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-700 text-white shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shrink-0 shadow-lg">
              <Instagram className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-extrabold uppercase tracking-wider text-pink-200">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Stay Connected</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                Follow Nagadatta Agencies on Instagram
              </h3>
              <p className="text-xs text-pink-100 mt-1">
                Check out latest arrivals, festive offers, and stock updates on our official Instagram page.
              </p>
            </div>
          </div>

          <a
            href={settings.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-white hover:bg-pink-50 text-pink-700 font-extrabold px-6 py-3.5 rounded-2xl shadow-xl hover:scale-105 transition-all text-sm shrink-0 active:scale-95"
          >
            <Instagram className="w-4 h-4 text-pink-600" />
            <span>Follow Us on Instagram</span>
            <ArrowRight className="w-4 h-4" />
          </a>

        </div>
      </div>
    </section>
  );
}
