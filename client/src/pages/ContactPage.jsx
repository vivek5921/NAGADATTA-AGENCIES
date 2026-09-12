import React from 'react';
import ContactSection from '../components/ContactSection';
import GoogleMapsCard from '../components/GoogleMapsCard';
import InstagramBanner from '../components/InstagramBanner';
import ProductDetailModal from '../components/ProductDetailModal';
import SearchModal from '../components/SearchModal';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <ContactSection />
      <GoogleMapsCard />
      <InstagramBanner />
      <ProductDetailModal />
      <SearchModal />
    </main>
  );
}
