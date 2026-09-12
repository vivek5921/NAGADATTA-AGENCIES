import React from 'react';
import CategoriesSection from '../components/CategoriesSection';
import ProductDetailModal from '../components/ProductDetailModal';
import SearchModal from '../components/SearchModal';

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <CategoriesSection />
      <ProductDetailModal />
      <SearchModal />
    </main>
  );
}
