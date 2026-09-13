import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import api from '../services/api';
import {
  Package, Wrench, Grid, Settings, Plus, Edit, Trash2, CheckCircle2,
  AlertTriangle, Flame, Shield, LogOut, Upload, Save, X, Eye, Phone,
  MapPin, Instagram, RefreshCw, LayoutDashboard, Check, Image as ImageIcon
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { adminUser, logoutAdmin, products, categories, spareParts, settings, refreshAllData } = useShop();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState(null);

  // Modals & Form State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [spareModalOpen, setSpareModalOpen] = useState(false);
  const [editingSpare, setEditingSpare] = useState(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    open: false,
    type: '',
    id: null,
    title: '',
    linkedCount: 0
  });

  // Form inputs
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    category_name: '',
    description: '',
    featuresStr: '',
    specificationsStr: '',
    model_number: '',
    availability: 'available',
    price_text: 'Contact shop for price/details',
    is_most_selling: false,
    is_active: true,
    main_image: '',
    additional_images: []
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [spareForm, setSpareForm] = useState({
    name: '',
    category: 'Cooler Spare Parts',
    compatible_with: '',
    model_number: '',
    availability: 'available',
    description: '',
    image_url: '',
    is_active: true
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    image_url: '',
    display_order: 0,
    is_active: true
  });

  const [settingsForm, setSettingsForm] = useState({
    shop_name: '',
    tagline: '',
    phone_number: '',
    whatsapp_number: '',
    email: '',
    address: '',
    opening_hours: '',
    google_maps_url: '',
    instagram_url: '',
    about_us: '',
    hero_title: '',
    hero_subtitle: '',
    hero_description: '',
    hero_image: '',
    logo_url: '',
    ...settings
  });

  useEffect(() => {
    if (!adminUser) {
      navigate('/admin/login');
    }
  }, [adminUser, navigate]);

  useEffect(() => {
    setSettingsForm(prev => ({ ...prev, ...settings }));
  }, [settings]);

  const showNotify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Image Upload Handler Helper
  const handleFileUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      showNotify('Uploading image...', 'info');
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        callback(res.data.imageUrl);
        showNotify('Image uploaded successfully!');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      showNotify(err.response?.data?.message || 'Failed to upload image.', 'error');
    }
  };

  // --- PRODUCT HANDLERS ---
  const handleOpenProductModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setProductForm({
        name: prod.name,
        brand: prod.brand,
        category_name: prod.category_name,
        description: prod.description || '',
        featuresStr: Array.isArray(prod.features) ? prod.features.join('\n') : '',
        specificationsStr: typeof prod.specifications === 'object' ? JSON.stringify(prod.specifications, null, 2) : '',
        model_number: prod.model_number || '',
        availability: prod.availability || 'available',
        price_text: prod.price_text || 'Contact shop for price/details',
        is_most_selling: prod.is_most_selling === 1 || prod.is_most_selling === true,
        is_active: prod.is_active === 1 || prod.is_active === true,
        main_image: prod.main_image || '',
        additional_images: Array.isArray(prod.additional_images) ? prod.additional_images : []
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        brand: '',
        category_name: categories[0]?.name || 'Air Coolers',
        description: '',
        featuresStr: '',
        specificationsStr: '',
        model_number: '',
        availability: 'available',
        price_text: 'Contact shop for price/details',
        is_most_selling: false,
        is_active: true,
        main_image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
        additional_images: []
      });
    }
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const featuresArray = productForm.featuresStr.split('\n').map(s => s.trim()).filter(Boolean);
      let specsObj = {};
      try {
        if (productForm.specificationsStr.trim()) {
          specsObj = JSON.parse(productForm.specificationsStr);
        }
      } catch (err) {
        showNotify('Specifications must be valid JSON syntax or left empty.', 'error');
        return;
      }

      const payload = {
        name: productForm.name,
        brand: productForm.brand,
        category_name: productForm.category_name,
        description: productForm.description,
        features: featuresArray,
        specifications: specsObj,
        model_number: productForm.model_number,
        availability: productForm.availability,
        price_text: productForm.price_text,
        is_most_selling: productForm.is_most_selling,
        is_active: productForm.is_active,
        main_image: productForm.main_image,
        additional_images: productForm.additional_images
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        showNotify('Product updated successfully!');
      } else {
        await api.post('/products', payload);
        showNotify('New Product added successfully!');
      }
      setProductModalOpen(false);
      refreshAllData();
    } catch (err) {
      showNotify('Failed to save product.', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      showNotify('All password fields are required.', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotify('New password and confirm password do not match.', 'error');
      return;
    }
    try {
      setPasswordLoading(true);
      const res = await api.post('/admin/change-password', passwordForm);
      if (res.data.success) {
        showNotify('Admin password updated successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showNotify(res.data.message || 'Failed to update password.', 'error');
      }
    } catch (err) {
      showNotify(err.response?.data?.message || 'Failed to update password.', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Quick Status Control
  const handleUpdateAvailability = async (prod, status) => {
    try {
      await api.put(`/products/${prod.id}`, { availability: status });
      showNotify(`Status changed to ${status === 'available' ? 'Available 🟢' : status === 'limited' ? 'Limited 🟡' : 'Out of Stock 🔴'}`);
      refreshAllData();
    } catch (err) {
      showNotify('Failed to update availability.', 'error');
    }
  };

  // Quick Most Selling Control
  const handleToggleMostSelling = async (prod) => {
    try {
      const newStatus = prod.is_most_selling === 1 ? false : true;
      await api.put(`/products/${prod.id}`, { is_most_selling: newStatus });
      showNotify(`Most Selling ${newStatus ? 'Activated ⭐' : 'Deactivated'}`);
      refreshAllData();
    } catch (err) {
      showNotify('Failed to update status.', 'error');
    }
  };

  // Quick Active/Inactive toggle
  const handleToggleActiveProduct = async (prod) => {
    try {
      const newActive = prod.is_active === 1 ? 0 : 1;
      await api.put(`/products/${prod.id}`, { is_active: newActive });
      showNotify(`Product ${newActive === 1 ? 'Activated' : 'Deactivated'}`);
      refreshAllData();
    } catch (err) {
      showNotify('Failed to update active state.', 'error');
    }
  };

  // --- SPARE PART HANDLERS ---
  const handleOpenSpareModal = (sp = null) => {
    if (sp) {
      setEditingSpare(sp);
      setSpareForm({
        name: sp.name,
        category: sp.category,
        compatible_with: sp.compatible_with || '',
        model_number: sp.model_number || '',
        availability: sp.availability || 'available',
        description: sp.description || '',
        image_url: sp.image_url || '',
        is_active: sp.is_active === 1 || sp.is_active === true
      });
    } else {
      setEditingSpare(null);
      setSpareForm({
        name: '',
        category: 'Cooler Spare Parts',
        compatible_with: '',
        model_number: '',
        availability: 'available',
        description: '',
        image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
        is_active: true
      });
    }
    setSpareModalOpen(true);
  };

  const handleSaveSpare = async (e) => {
    e.preventDefault();
    try {
      if (editingSpare) {
        await api.put(`/spare-parts/${editingSpare.id}`, spareForm);
        showNotify('Spare part updated successfully!');
      } else {
        await api.post('/spare-parts', spareForm);
        showNotify('New Spare part added successfully!');
      }
      setSpareModalOpen(false);
      refreshAllData();
    } catch (err) {
      showNotify('Failed to save spare part.', 'error');
    }
  };

  // --- CATEGORY HANDLERS ---
  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({
        name: cat.name,
        image_url: cat.image_url || '',
        display_order: cat.display_order || 0,
        is_active: cat.is_active === 1
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=500&q=80',
        display_order: categories.length + 1,
        is_active: true
      });
    }
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, categoryForm);
        showNotify('Category updated successfully!');
      } else {
        await api.post('/categories', categoryForm);
        showNotify('New Category created successfully!');
      }
      setCategoryModalOpen(false);
      refreshAllData();
    } catch (err) {
      showNotify('Failed to save category.', 'error');
    }
  };

  // --- DELETE CONFIRMATION & SAFETY ---
  const requestDeleteCategory = (cat) => {
    const linked = products.filter(p => p.category_id === cat.id || p.category_name === cat.name);
    setDeleteConfirmModal({
      open: true,
      type: 'category',
      id: cat.id,
      title: cat.name,
      linkedCount: linked.length
    });
  };

  const handleConfirmDelete = async (force = false) => {
    const { type, id } = deleteConfirmModal;
    try {
      if (type === 'product') {
        await api.delete(`/products/${id}`);
        showNotify('Product deleted.');
      } else if (type === 'spare') {
        await api.delete(`/spare-parts/${id}`);
        showNotify('Spare Part deleted.');
      } else if (type === 'category') {
        await api.delete(`/categories/${id}?force=${force ? 'true' : 'false'}`);
        showNotify('Category deleted.');
      }
      setDeleteConfirmModal({ open: false, type: '', id: null, title: '', linkedCount: 0 });
      refreshAllData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete item.';
      showNotify(msg, 'error');
    }
  };

  // --- SAVE SHOP SETTINGS HANDLER ---
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.put('/settings', settingsForm);
      showNotify('Shop Settings updated successfully! Customer website will immediately reflect changes.');
      refreshAllData();
    } catch (err) {
      showNotify('Failed to update settings.', 'error');
    }
  };

  // Dashboard 7 Cards Stats (Requirement 21)
  const totalProducts = products.length;
  const availableCount = products.filter(p => p.availability === 'available').length;
  const limitedCount = products.filter(p => p.availability === 'limited').length;
  const outOfStockCount = products.filter(p => p.availability === 'out_of_stock').length;
  const mostSellingCount = products.filter(p => p.is_most_selling === 1).length;
  const categoriesCount = categories.length;
  const sparePartsCount = spareParts.length;

  return (
    <main className="min-h-screen bg-slate-100 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 mb-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-black text-xl shadow">
              N
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">Nagadatta Agencies Control Panel</h1>
              <p className="text-xs text-slate-400">Simple Product Management & Showroom Settings</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshAllData}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => {
                logoutAdmin();
                navigate('/');
              }}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Notifications Toast */}
        {notification && (
          <div className={`p-3.5 mb-6 rounded-xl shadow-sm border text-xs sm:text-sm font-bold flex items-center justify-between animate-fadeIn ${
            notification.type === 'error' ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}>
            <span>{notification.msg}</span>
            <button onClick={() => setNotification(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* 7 Dashboard Stat Cards (Requirement 21) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm text-center">
            <span className="text-xl font-black text-slate-900 block">{totalProducts}</span>
            <span className="text-[10px] font-bold uppercase text-slate-500">Total Products</span>
          </div>
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm text-center">
            <span className="text-xl font-black text-emerald-600 block">{availableCount}</span>
            <span className="text-[10px] font-bold uppercase text-slate-500">Available</span>
          </div>
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm text-center">
            <span className="text-xl font-black text-amber-600 block">{limitedCount}</span>
            <span className="text-[10px] font-bold uppercase text-slate-500">Limited</span>
          </div>
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm text-center">
            <span className="text-xl font-black text-rose-600 block">{outOfStockCount}</span>
            <span className="text-[10px] font-bold uppercase text-slate-500">Out of Stock</span>
          </div>
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm text-center">
            <span className="text-xl font-black text-orange-500 block">{mostSellingCount}</span>
            <span className="text-[10px] font-bold uppercase text-slate-500">Most Selling</span>
          </div>
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm text-center">
            <span className="text-xl font-black text-brand-600 block">{categoriesCount}</span>
            <span className="text-[10px] font-bold uppercase text-slate-500">Categories</span>
          </div>
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm text-center">
            <span className="text-xl font-black text-indigo-600 block">{sparePartsCount}</span>
            <span className="text-[10px] font-bold uppercase text-slate-500">Spare Parts</span>
          </div>
        </div>

        {/* Main Navigation (Requirement 21: Dashboard, Products, Categories, Spare Parts, Shop Settings) */}
        <div className="flex border-b border-slate-300 mb-6 space-x-1 sm:space-x-2 overflow-x-auto pb-0.5">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'categories', label: 'Categories', icon: Grid },
            { id: 'spare-parts', label: 'Spare Parts', icon: Wrench },
            { id: 'settings', label: 'Shop Settings', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shrink-0 ${
                  active
                    ? 'bg-white text-brand-700 border-t-2 border-brand-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW (Simplified for Father) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Quick Action Banner */}
            <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Quick Stock & Product Controls</h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Easily change product availability (Available / Limited / Out of Stock) below. Changes appear on customer website immediately.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenProductModal(null)}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Product</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs border border-slate-700"
                >
                  <span>Edit Shop Details</span>
                </button>
              </div>
            </div>

            {/* Quick Status Control Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Quick Product Status & Stock Manager</h3>
                <span className="text-xs text-slate-500">Select any status to update instantly</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-800 font-bold uppercase text-[10px] tracking-wider border-b">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Current Status</th>
                      <th className="p-3">Most Selling</th>
                      <th className="p-3 text-right">Quick Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.slice(0, 15).map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                          <img src={p.main_image} alt="" className="w-8 h-8 object-cover rounded-lg bg-slate-100 border shrink-0" />
                          <div className="truncate max-w-[200px] sm:max-w-xs">
                            <span className="block truncate font-bold">{p.name}</span>
                            <span className="text-[10px] text-slate-400">{p.brand}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600">{p.category_name}</td>
                        <td className="p-3">
                          <select
                            value={p.availability}
                            onChange={(e) => handleUpdateAvailability(p, e.target.value)}
                            className={`px-2.5 py-1.5 rounded-lg font-bold text-xs border cursor-pointer ${
                              p.availability === 'available'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : p.availability === 'limited'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                          >
                            <option value="available">🟢 Available</option>
                            <option value="limited">🟡 Limited</option>
                            <option value="out_of_stock">🔴 Out of Stock</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleMostSelling(p)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-colors ${
                              p.is_most_selling === 1
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-500 hover:bg-amber-50'
                            }`}
                          >
                            <Flame className="w-3 h-3" />
                            <span>{p.is_most_selling === 1 ? '⭐ ON' : 'OFF'}</span>
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleOpenProductModal(p)}
                            className="text-brand-600 hover:text-brand-800 font-bold text-xs"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT (Requirement 22 & 23) */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Products Catalogue</h2>
                <p className="text-xs text-slate-500">Manage showroom products, availability, and details.</p>
              </div>
              <button
                onClick={() => handleOpenProductModal(null)}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-900 text-white font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">Image</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Brand</th>
                      <th className="p-3">Availability</th>
                      <th className="p-3">Most Selling</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <img src={p.main_image} alt="" className="w-10 h-10 object-cover rounded-lg bg-slate-100 border" />
                        </td>
                        <td className="p-3 font-bold text-slate-900 text-xs">
                          {p.name}
                          {p.model_number && (
                            <span className="block text-[10px] font-mono text-slate-400 font-normal">Mod: {p.model_number}</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600">{p.category_name}</td>
                        <td className="p-3 font-semibold text-slate-800">{p.brand}</td>
                        <td className="p-3">
                          <select
                            value={p.availability}
                            onChange={(e) => handleUpdateAvailability(p, e.target.value)}
                            className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg font-bold text-xs cursor-pointer"
                          >
                            <option value="available">🟢 Available</option>
                            <option value="limited">🟡 Limited</option>
                            <option value="out_of_stock">🔴 Out of Stock</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleMostSelling(p)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 ${
                              p.is_most_selling === 1
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-500 hover:bg-amber-100'
                            }`}
                          >
                            <Flame className="w-3 h-3" />
                            <span>{p.is_most_selling === 1 ? 'ON' : 'OFF'}</span>
                          </button>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => handleOpenProductModal(p)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmModal({ open: true, type: 'product', id: p.id, title: p.name, linkedCount: 0 })}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: CATEGORIES MANAGEMENT (Requirement 9 & 38) */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Manage Product Categories</h2>
                <p className="text-xs text-slate-500">Categories organize the customer showcase navigation.</p>
              </div>
              <button
                onClick={() => handleOpenCategoryModal(null)}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(cat => {
                const count = products.filter(p => p.category_id === cat.id || p.category_name === cat.name).length;
                return (
                  <div key={cat.id} className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={cat.image_url} alt="" className="w-12 h-12 object-cover rounded-lg bg-slate-100 border shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{cat.name}</h4>
                        <p className="text-[11px] text-slate-400">{count} Product{count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={() => handleOpenCategoryModal(cat)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit Category"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => requestDeleteCategory(cat)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: SPARE PARTS MANAGEMENT (Requirement 12) */}
        {activeTab === 'spare-parts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Manage Spare Parts Catalogue</h2>
                <p className="text-xs text-slate-500">Replacement components for coolers, fans, grinders, and geysers.</p>
              </div>
              <button
                onClick={() => handleOpenSpareModal(null)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Spare Part</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Image</th>
                      <th className="p-3">Spare Part</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Compatible With</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {spareParts.map(sp => (
                      <tr key={sp.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <img src={sp.image_url} alt="" className="w-10 h-10 object-cover rounded-lg bg-slate-100 border" />
                        </td>
                        <td className="p-3 font-bold text-slate-900">{sp.name}</td>
                        <td className="p-3">{sp.category}</td>
                        <td className="p-3 text-amber-900 font-semibold">{sp.compatible_with}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sp.availability === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {sp.availability === 'available' ? '🟢 Available' : '🔴 Out of Stock'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => handleOpenSpareModal(sp)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmModal({ open: true, type: 'spare', id: sp.id, title: sp.name, linkedCount: 0 })}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: SHOP SETTINGS (Requirement 25) */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900">
                  Shop Information & Branding Settings
                </h2>
                <p className="text-xs text-slate-500">
                  All changes save directly to the database and update the customer storefront immediately.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Shop Name</label>
                  <input
                    type="text"
                    value={settingsForm.shop_name || ''}
                    onChange={e => setSettingsForm({ ...settingsForm, shop_name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={settingsForm.tagline || ''}
                    onChange={e => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Phone Number (Calling)</label>
                  <input
                    type="text"
                    value={settingsForm.phone_number || ''}
                    onChange={e => setSettingsForm({ ...settingsForm, phone_number: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">WhatsApp Number (e.g. 919849012345)</label>
                  <input
                    type="text"
                    value={settingsForm.whatsapp_number || ''}
                    onChange={e => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={settingsForm.email || ''}
                    onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Google Maps URL (Official Location)</label>
                  <input
                    type="text"
                    value={settingsForm.google_maps_url || ''}
                    onChange={e => setSettingsForm({ ...settingsForm, google_maps_url: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Instagram Profile URL</label>
                  <input
                    type="text"
                    value={settingsForm.instagram_url || ''}
                    onChange={e => setSettingsForm({ ...settingsForm, instagram_url: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Opening Hours</label>
                  <input
                    type="text"
                    value={settingsForm.opening_hours || ''}
                    onChange={e => setSettingsForm({ ...settingsForm, opening_hours: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Showroom Address</label>
                  <input
                    type="text"
                    value={settingsForm.address || ''}
                    onChange={e => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold"
                  />
                </div>

                {/* Hero Image Control */}
                <div className="md:col-span-2 space-y-2 border-t pt-4">
                  <label className="block text-xs font-bold uppercase text-slate-700">Hero Section Showcase Image</label>
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    {settingsForm.hero_image && (
                      <img src={settingsForm.hero_image} alt="" className="w-24 h-16 object-cover rounded-lg border bg-slate-100 shrink-0" />
                    )}
                    <input
                      type="text"
                      placeholder="Enter image URL..."
                      value={settingsForm.hero_image || ''}
                      onChange={e => setSettingsForm({ ...settingsForm, hero_image: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold"
                    />
                    <label className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleFileUpload(e, url => setSettingsForm(prev => ({ ...prev, hero_image: url })))}
                      />
                    </label>
                  </div>
                </div>

                {/* Logo URL Control */}
                <div className="md:col-span-2 space-y-2 border-t pt-4">
                  <label className="block text-xs font-bold uppercase text-slate-700">Logo Image URL</label>
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    {settingsForm.logo_url && (
                      <img src={settingsForm.logo_url} alt="" className="w-12 h-12 object-contain rounded-lg border bg-slate-100 shrink-0" />
                    )}
                    <input
                      type="text"
                      placeholder="Enter logo URL or leave blank for default..."
                      value={settingsForm.logo_url || ''}
                      onChange={e => setSettingsForm({ ...settingsForm, logo_url: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold"
                    />
                    <label className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleFileUpload(e, url => setSettingsForm(prev => ({ ...prev, logo_url: url })))}
                      />
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">About Us Description</label>
                  <textarea
                    rows={3}
                    value={settingsForm.about_us || ''}
                    onChange={e => setSettingsForm({ ...settingsForm, about_us: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow transition-all text-xs sm:text-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Settings</span>
                </button>
              </div>
            </form>

            {/* Dedicated Change Admin Password Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg">
              <div className="flex items-center gap-2.5 mb-4">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base text-white">Change Admin Password</h3>
              </div>
              <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter current password..."
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters..."
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password..."
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl shadow transition-all text-xs flex items-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{passwordLoading ? 'Updating Password...' : 'Update Admin Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* --- MODAL: ADD/EDIT PRODUCT (Requirement 22) --- */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-xl border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto my-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingProduct ? 'Edit Product' : '+ Add New Product'}
              </h3>
              <button onClick={() => setProductModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={e => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Category</label>
                  <select
                    value={productForm.category_name}
                    onChange={e => setProductForm({ ...productForm, category_name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-bold"
                  >
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Model Number</label>
                  <input
                    type="text"
                    value={productForm.model_number}
                    onChange={e => setProductForm({ ...productForm, model_number: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Availability Status</label>
                  <select
                    value={productForm.availability}
                    onChange={e => setProductForm({ ...productForm, availability: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-bold"
                  >
                    <option value="available">🟢 Available</option>
                    <option value="limited">🟡 Limited Availability</option>
                    <option value="out_of_stock">🔴 Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Price Notice</label>
                  <input
                    type="text"
                    value={productForm.price_text}
                    onChange={e => setProductForm({ ...productForm, price_text: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Features (One per line)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Copper Motor&#10;Inverter Compatible&#10;2 Year Warranty"
                  value={productForm.featuresStr}
                  onChange={e => setProductForm({ ...productForm, featuresStr: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-semibold"
                />
              </div>

              {/* Main Product Image Control */}
              <div className="space-y-1.5 border-t pt-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase text-slate-800">Primary Product Image</label>
                  <span className="text-[10px] text-slate-500 font-semibold">JPG, PNG, WEBP</span>
                </div>
                <div className="flex gap-2 items-center">
                  {productForm.main_image && (
                    <img src={productForm.main_image} alt="" className="w-10 h-10 object-cover rounded-lg border shrink-0 bg-slate-100" />
                  )}
                  <input
                    type="text"
                    placeholder="Paste image URL or upload from laptop..."
                    value={productForm.main_image}
                    onChange={e => setProductForm({ ...productForm, main_image: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-semibold"
                  />
                  <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleFileUpload(e, url => setProductForm(prev => ({ ...prev, main_image: url })))}
                    />
                  </label>
                </div>
              </div>

              {/* Additional Product Images Gallery (Requirement 13) */}
              <div className="space-y-2 border-t pt-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase text-slate-800">Additional Product Gallery Images</label>
                  <label className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 border border-brand-200">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Gallery Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleFileUpload(e, url => {
                        setProductForm(prev => ({
                          ...prev,
                          additional_images: [...prev.additional_images, url]
                        }));
                      })}
                    />
                  </label>
                </div>

                {productForm.additional_images.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {productForm.additional_images.map((imgUrl, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              const oldMain = productForm.main_image;
                              setProductForm(prev => ({
                                ...prev,
                                main_image: imgUrl,
                                additional_images: prev.additional_images.map((img, i) => i === idx ? oldMain : img).filter(Boolean)
                              }));
                              showNotify('Set as primary image!');
                            }}
                            className="p-1 bg-amber-500 text-white rounded text-[10px] font-bold"
                            title="Set as Primary"
                          >
                            Main
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setProductForm(prev => ({
                                ...prev,
                                additional_images: prev.additional_images.filter((_, i) => i !== idx)
                              }));
                            }}
                            className="p-1 bg-rose-600 text-white rounded"
                            title="Remove Image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No additional gallery images added.</p>
                )}

                <p className="text-[10px] text-slate-400 font-medium pt-1">
                  💡 Note: Please use images you own or have permission to use.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 py-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_most_selling}
                    onChange={e => setProductForm({ ...productForm, is_most_selling: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <span>Mark as 🔥 Most Selling Product</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_active}
                    onChange={e => setProductForm({ ...productForm, is_active: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Active (Visible to customers)</span>
                </label>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD/EDIT CATEGORY --- */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <h3 className="font-bold text-slate-900 text-sm">{editingCategory ? 'Edit Category' : '+ Add Category'}</h3>
              <button onClick={() => setCategoryModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Image URL or Upload</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={categoryForm.image_url}
                    onChange={e => setCategoryForm({ ...categoryForm, image_url: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-semibold"
                  />
                  <label className="px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleFileUpload(e, url => setCategoryForm(prev => ({ ...prev, image_url: url })))}
                    />
                  </label>
                </div>
              </div>
              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setCategoryModalOpen(false)} className="px-3 py-1.5 bg-slate-100 text-xs font-bold rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-brand-600 text-white text-xs font-bold rounded-lg shadow">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD/EDIT SPARE PART --- */}
      {spareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <h3 className="font-bold text-slate-900 text-sm">{editingSpare ? 'Edit Spare Part' : '+ Add Spare Part'}</h3>
              <button onClick={() => setSpareModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSaveSpare} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Spare Part Name *</label>
                <input
                  type="text"
                  required
                  value={spareForm.name}
                  onChange={e => setSpareForm({ ...spareForm, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Category</label>
                <select
                  value={spareForm.category}
                  onChange={e => setSpareForm({ ...spareForm, category: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-bold"
                >
                  <option value="Cooler Spare Parts">Cooler Spare Parts</option>
                  <option value="Fan Spare Parts">Fan Spare Parts</option>
                  <option value="Grinder Spare Parts">Grinder Spare Parts</option>
                  <option value="Water Heater/Geyser Spare Parts">Water Heater/Geyser Spare Parts</option>
                  <option value="Other Spare Parts">Other Spare Parts</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Compatible With (Brand/Model)</label>
                <input
                  type="text"
                  value={spareForm.compatible_with}
                  onChange={e => setSpareForm({ ...spareForm, compatible_with: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Image URL or Upload</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={spareForm.image_url}
                    onChange={e => setSpareForm({ ...spareForm, image_url: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-semibold"
                  />
                  <label className="px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleFileUpload(e, url => setSpareForm(prev => ({ ...prev, image_url: url })))}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Availability</label>
                <select
                  value={spareForm.availability}
                  onChange={e => setSpareForm({ ...spareForm, availability: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-bold"
                >
                  <option value="available">🟢 Available</option>
                  <option value="out_of_stock">🔴 Out of Stock</option>
                </select>
              </div>
              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setSpareModalOpen(false)} className="px-3 py-1.5 bg-slate-100 text-xs font-bold rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg shadow">Save Spare Part</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL WITH WARNING SAFETY (Requirement 38) --- */}
      {deleteConfirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm border border-slate-200 shadow-xl text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Confirm Deletion</h3>
            
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <strong>"{deleteConfirmModal.title}"</strong>?
            </p>

            {deleteConfirmModal.linkedCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left text-xs text-amber-900">
                <p className="font-bold text-amber-800">⚠️ Linked Products Warning:</p>
                <p className="mt-0.5">
                  There are <strong>{deleteConfirmModal.linkedCount}</strong> product(s) in this category. We recommend editing the category to keep it active or deactivating it instead.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmModal({ open: false, type: '', id: null, title: '', linkedCount: 0 })}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(deleteConfirmModal.linkedCount > 0)}
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow"
              >
                {deleteConfirmModal.linkedCount > 0 ? 'Delete Anyway' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
