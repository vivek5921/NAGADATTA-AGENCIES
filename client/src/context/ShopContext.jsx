import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [settings, setSettings] = useState({
    shop_name: "Nagadatta Agencies",
    tagline: "Electrical & Home Appliances",
    hero_title: "Nagadatta Agencies",
    hero_subtitle: "Your Trusted Electrical & Home Appliance Store",
    hero_description: "Providing premium air coolers, fans, geysers, cookers, mixer grinders, stoves, spare parts and electrical home appliances.",
    phone_number: "+91 98490 12345",
    whatsapp_number: "919849012345",
    email: "contact@nagadattaagencies.com",
    address: "Karimnagar, Telangana - 505001, India",
    google_maps_url: "https://maps.google.com/?q=Karimnagar+Telangana+505001",
    instagram_url: "https://www.instagram.com/nagadatta_agencies",
    opening_hours: "Mon - Sat: 9:00 AM - 9:00 PM | Sunday: Closed",
    about_us: "Nagadatta Agencies is Karimnagar's premier wholesale and retail distributor of home appliances and genuine spare parts.",
    footer_text: "Nagadatta Agencies - Electrical & Home Appliances Wholesale Karimnagar.",
    hero_image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
    logo_url: ""
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Product Detail Modal
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Admin Auth State
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('nagadatta_admin_token') || null);
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('nagadatta_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data.success && res.data.settings) {
        setSettings(prev => ({ ...prev, ...res.data.settings }));
      }
    } catch (err) {
      console.error('Failed to load shop settings:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories?active_only=true');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchProducts = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const res = await api.get(`/products?${params.toString()}`);
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Unable to load products. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpareParts = async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const res = await api.get(`/spare-parts?${params.toString()}`);
      if (res.data.success) {
        setSpareParts(res.data.spareParts);
      }
    } catch (err) {
      console.error('Failed to load spare parts:', err);
    }
  };

  const refreshAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSettings(),
      fetchCategories(),
      fetchProducts(),
      fetchSpareParts()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const loginAdmin = (token, user) => {
    localStorage.setItem('nagadatta_admin_token', token);
    localStorage.setItem('nagadatta_admin_user', JSON.stringify(user));
    setAdminToken(token);
    setAdminUser(user);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('nagadatta_admin_token');
    localStorage.removeItem('nagadatta_admin_user');
    setAdminToken(null);
    setAdminUser(null);
  };

  const openProductModal = async (product) => {
    setSelectedProduct(product);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        categories,
        spareParts,
        settings,
        loading,
        error,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        selectedProduct,
        openProductModal,
        closeProductModal,
        adminToken,
        adminUser,
        loginAdmin,
        logoutAdmin,
        fetchProducts,
        fetchCategories,
        fetchSpareParts,
        fetchSettings,
        refreshAllData
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
