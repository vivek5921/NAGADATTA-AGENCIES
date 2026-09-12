import React from 'react';
import AboutSection from '../components/AboutSection';
import GoogleMapsCard from '../components/GoogleMapsCard';
import ProductDetailModal from '../components/ProductDetailModal';
import SearchModal from '../components/SearchModal';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <AboutSection />
      <GoogleMapsCard />
      <ProductDetailModal />
      <SearchModal />
    </main>
  );
}
