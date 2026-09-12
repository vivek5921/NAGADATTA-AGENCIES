import React from 'react';
import Hero from '../components/Hero';
import CategoriesSection from '../components/CategoriesSection';
import MostSellingSection from '../components/MostSellingSection';
import SparePartsSection from '../components/SparePartsSection';
import AboutSection from '../components/AboutSection';
import GoogleMapsCard from '../components/GoogleMapsCard';
import InstagramBanner from '../components/InstagramBanner';
import ContactSection from '../components/ContactSection';
import ProductDetailModal from '../components/ProductDetailModal';
import SearchModal from '../components/SearchModal';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Hero />
      <CategoriesSection />
      <MostSellingSection />
      <SparePartsSection />
      <AboutSection />
      <GoogleMapsCard />
      <InstagramBanner />
      <ContactSection />
      
      {/* Modals */}
      <ProductDetailModal />
      <SearchModal />
    </main>
  );
}
