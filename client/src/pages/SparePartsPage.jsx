import React from 'react';
import SparePartsSection from '../components/SparePartsSection';
import ProductDetailModal from '../components/ProductDetailModal';
import SearchModal from '../components/SearchModal';

export default function SparePartsPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <SparePartsSection showHeader={true} isPage={true} />
      <ProductDetailModal />
      <SearchModal />
    </main>
  );
}
