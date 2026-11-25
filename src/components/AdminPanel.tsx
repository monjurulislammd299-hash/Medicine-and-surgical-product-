import React, { useRef, useState } from 'react';
import {
  ArrowLeft,
  Edit3,
  ImagePlus,
  Link2,
  PackageCheck,
  Plus,
  ShieldAlert,
  Trash2,
  Upload,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { compressProductImage } from '../lib/imageUpload';
import { LIMITS, formatBDT } from '../lib/validation';
import {
  CURATED_PRODUCT_IMAGES,
  OrderStatus,
  Product,
  ProductCategory,
} from '../types';
import { ProductImage } from './ProductImage';

const ALL_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const EMPTY_FORM = {
  name: '',
  nameBn: '',
  category: 'Medicine' as ProductCategory,
  price: 100,
  unit: '1 Box',
  stock: 50,
  imageUrl: CURATED_PRODUCT_IMAGES[0].url,
  description: '',
  manufacturer: '',
  requiresPrescription: false,
  featured: false,
};

export function AdminPanel() {
  const {
    user,
    isAdmin,
    signInWithGoogle,
    signInWithEmail,
    resendVerification,
    refreshVerification,
    authError,
    logout,
    setActiveView,
    products,
    isCatalogSeeded,
    seedStarterCatalog,
    addProduct,
    updateProduct,
    deleteProduct,
    allOrders,
    adminOrdersLoading,
    updateOrderStatus,
  } = useStore();

  const [tab, setTab] = useState<'catalog' | 'orders'>('catalog');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageMode, setImageMode] = useState<'upload' | 'gallery' | 'url'>('upload');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminLoggingIn, setAdminLoggingIn] = useState(false);

  const handleSwitchAdminGmail = async () => {
    await logout();
    setActiveView('admin');
    await signInWithGoogle();
  };

  const handleAdminPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoggingIn(true);
    try {
      await signInWithEmail(adminEmailInput, adminPasswordInput);
    } catch {
      // Error surfaced in authError
    } finally {
      setAdminLoggingIn(false);
    }
  };

  if (!user || !isAdmin) {
    return (
      <section className="max-w-[540px] mx-auto px-4 sm:px-6 py-14">
        <button
          type="button"
          onClick={() => setActiveView('store')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>স্টোরে ফিরে যান</span>
        </button>

        <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-10">
          <div className="flex items-center gap-3 text-[#087f5b] mb-3">
            <ShieldAlert className="w-6 h-6" />
            <h1 className="font-display text-xl font-bold text-slate-900">
              {!user
                ? 'শুধুমাত্র অ্যাডমিন প্রবেশাধিকার'
                : !user.emailVerified
                ? 'ইমেইল ভেরিফিকেশন প্রয়োজন'
                : 'প্রবেশাধিকার নেই (Access Denied)'}
            </h1>
          </div>

          {!user ? (
            <>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Admin Panel-এ প্রবেশ করতে শুধুমাত্র অনুমোদিত অ্যাডমিন Gmail ও পাসওয়ার্ড
                অথবা Google অ্যাকাউন্ট দিয়ে লগইন করুন।
              </p>

              {authError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {authError}
                </div>
              )}

              <form
                onSubmit={(e) => void handleAdminPasswordLogin(e)}
                className="space-y-3.5 mb-5"
              >
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Admin Gmail *
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    placeholder="admin@gmail.com"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={adminLoggingIn}
                  className="w-full py-2.5 px-5 text-sm font-semibold text-white bg-[#087f5b] hover:bg-[#06694b] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                >
                  {adminLoggingIn ? 'যাচাই হচ্ছে...' : 'Password দিয়ে Admin Login'}
                </button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-400">অথবা</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-2.5 text-sm font-medium text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                <span>Google (Gmail) দিয়ে Admin Login</span>
              </button>
            </>
          ) : !user.emailVerified ? (
            <>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                আপনার অ্যাকাউন্ট (<span className="font-mono-tabular">{user.email}</span>)
                এখনো ইমেইল ভেরিফাই করা হয়নি। ইনবক্স থেকে ভেরিফিকেশন লিংকে ক্লিক করে
                নিচের বাটনে চাপুন।
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void refreshVerification()}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#087f5b] hover:bg-[#06694b] rounded-lg cursor-pointer"
                >
                  ভেরিফিকেশন রিফ্রেশ
                </button>
                <button
                  type="button"
                  onClick={() => void resendVerification()}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  ইমেইল আবার পাঠান
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                বর্তমান লগইনকৃত Gmail (
                <span className="font-mono-tabular font-medium text-slate-900">
                  {user.email}
                </span>
                ) অনুমোদিত অ্যাডমিন অ্যাকাউন্ট নয়। শুধুমাত্র নির্ধারিত অ্যাডমিন Gmail দিয়েই
                এখানে প্রবেশ করা যাবে।
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => void handleSwitchAdminGmail()}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#087f5b] hover:bg-[#06694b] rounded-lg transition-colors cursor-pointer"
                >
                  অন্য Gmail দিয়ে লগইন করুন
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('store')}
                  className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  স্টোরে ফিরে যান
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    );
  }

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);
    setUploadingImage(true);
    try {
      const compressedDataUrl = await compressProductImage(file);
      setForm((prev) => ({ ...prev, imageUrl: compressedDataUrl }));
    } catch (err) {
      setImageError(
        err instanceof Error ? err.message : 'ছবি আপলোড ব্যর্থ হয়েছে।',
      );
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      if (editingId) {
        await updateProduct(editingId, form);
        setEditingId(null);
      } else {
        await addProduct(form);
      }
      setForm(EMPTY_FORM);
      setImageError(null);
    } finally {
      setSavingProduct(false);
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setImageError(null);
    setForm({
      name: p.name,
      nameBn: p.nameBn,
      category: p.category,
      price: p.price,
      unit: p.unit,
      stock: p.stock,
      imageUrl: p.imageUrl,
      description: p.description,
      manufacturer: p.manufacturer,
      requiresPrescription: p.requiresPrescription,
      featured: p.featured,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredAdminOrders =
    statusFilter === 'ALL'
      ? allOrders
      : allOrders.filter((o) => o.status === statusFilter);

  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        <div>
          <button
            type="button"
            onClick={() => setActiveView('store')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#087f5b] hover:underline mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>স্টোরফ্রন্টে ফিরে যান</span>
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Admin Workspace
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            পণ্য ইনভেন্টরি এবং কাস্টমার অর্ডার পরিচালনা করুন
          </p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setTab('catalog')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              tab === 'catalog'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            পণ্য ব্যবস্থাপনা ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('orders')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              tab === 'orders'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            সকল অর্ডার ({allOrders.length})
          </button>
        </div>
      </div>

      {tab === 'catalog' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Product Form */}
          <form
            onSubmit={(e) => void handleProductSubmit(e)}
            className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-slate-900">
                {editingId ? 'পণ্য তথ্য সম্পাদনা' : 'নতুন পণ্য যোগ করুন'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(EMPTY_FORM);
                    setImageError(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900 underline cursor-pointer"
                >
                  বাতিল
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Product Name (English) *
              </label>
              <input
                type="text"
                required
                minLength={LIMITS.PRODUCT_NAME_MIN}
                maxLength={LIMITS.PRODUCT_NAME_MAX}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Digital Glucometer Kit"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                পণ্যের বাংলা নাম *
              </label>
              <input
                type="text"
                required
                minLength={LIMITS.PRODUCT_NAME_BN_MIN}
                maxLength={LIMITS.PRODUCT_NAME_BN_MAX}
                value={form.nameBn}
                onChange={(e) => setForm({ ...form, nameBn: e.target.value })}
                placeholder="যেমন: ডিজিটাল গ্লুকোমিটার কিট"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                প্রস্তুতকারক *
              </label>
              <input
                type="text"
                required
                maxLength={LIMITS.PRODUCT_MANUFACTURER_MAX}
                value={form.manufacturer}
                onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                placeholder="Beximco Pharma"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  দাম (৳) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={LIMITS.PRODUCT_PRICE_MAX}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm font-mono-tabular border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  স্টক *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={LIMITS.PRODUCT_STOCK_MAX}
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm font-mono-tabular border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ইউনিট *
                </label>
                <input
                  type="text"
                  required
                  maxLength={LIMITS.PRODUCT_UNIT_MAX}
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="1 Box"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
                />
              </div>
            </div>

            {/* Product Image Adder: Upload / Studio Gallery / URL + Live Preview */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs font-medium text-slate-700">
                  পণ্যের ছবি *
                </label>
                <div className="inline-flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md cursor-pointer transition-colors ${
                      imageMode === 'upload'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Upload className="w-3 h-3" />
                    <span>আপলোড</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('gallery')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md cursor-pointer transition-colors ${
                      imageMode === 'gallery'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ImagePlus className="w-3 h-3" />
                    <span>গ্যালারি</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md cursor-pointer transition-colors ${
                      imageMode === 'url'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Link2 className="w-3 h-3" />
                    <span>লিংক</span>
                  </button>
                </div>
              </div>

              {/* Live 4:3 Preview */}
              <div className="aspect-[4/3] w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                <ProductImage
                  src={form.imageUrl}
                  alt={form.name || 'Product image preview'}
                  className="w-full h-full object-cover"
                />
              </div>

              {imageMode === 'upload' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => void handleImageFileSelect(e)}
                    className="hidden"
                    id="admin-product-image-upload"
                  />
                  <label
                    htmlFor="admin-product-image-upload"
                    className="flex flex-col items-center justify-center gap-1.5 w-full py-4 px-4 border border-dashed border-slate-300 hover:border-[#087f5b] rounded-lg bg-slate-50 hover:bg-emerald-50/30 transition-colors cursor-pointer text-center"
                  >
                    <Upload className="w-5 h-5 text-[#087f5b]" />
                    <span className="text-xs font-semibold text-slate-800">
                      {uploadingImage
                        ? 'ছবি প্রসেস হচ্ছে...'
                        : 'ডিভাইস থেকে পণ্যের ছবি বেছে নিন'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      JPG, PNG বা WebP (স্বয়ংক্রিয়ভাবে অপ্টিমাইজ হবে)
                    </span>
                  </label>
                </div>
              )}

              {imageMode === 'gallery' && (
                <div className="grid grid-cols-3 gap-2">
                  {CURATED_PRODUCT_IMAGES.map((img) => {
                    const selected = form.imageUrl === img.url;
                    return (
                      <button
                        key={img.url}
                        type="button"
                        onClick={() => {
                          setForm({ ...form, imageUrl: img.url });
                          setImageError(null);
                        }}
                        title={img.label}
                        className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          selected
                            ? 'border-[#087f5b] ring-2 ring-[#087f5b]/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <ProductImage
                          src={img.url}
                          alt={img.label}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {imageMode === 'url' && (
                <input
                  type="text"
                  required
                  maxLength={LIMITS.PRODUCT_IMAGE_MAX}
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://example.com/product-photo.jpg"
                  className="w-full px-3 py-2 text-xs font-mono-tabular border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
                />
              )}

              {imageError && (
                <p className="text-xs text-rose-700">{imageError}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                বিবরণ
              </label>
              <textarea
                rows={3}
                maxLength={LIMITS.PRODUCT_DESC_MAX}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="পণ্যের কার্যকারিতা ও ব্যবহার বিধি..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
              />
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-700">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.requiresPrescription}
                  onChange={(e) =>
                    setForm({ ...form, requiresPrescription: e.target.checked })
                  }
                  className="rounded border-slate-300 text-[#087f5b]"
                />
                <span>Rx Advised</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="rounded border-slate-300 text-[#087f5b]"
                />
                <span>Featured</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={savingProduct}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 text-sm font-semibold text-white bg-[#087f5b] hover:bg-[#06694b] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                {savingProduct
                  ? 'সংরক্ষণ হচ্ছে...'
                  : editingId
                  ? 'আপডেট সংরক্ষণ করুন'
                  : 'নতুন পণ্য যোগ করুন'}
              </span>
            </button>
          </form>

          {/* Product Inventory List */}
          <div className="lg:col-span-7 space-y-4">
            {!isCatalogSeeded && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
                <p className="text-sm text-slate-700">
                  Firestore-এ প্রাথমিক ৮টি পণ্য যোগ করতে নিচের বাটনে ক্লিক করুন।
                </p>
                <button
                  type="button"
                  onClick={() => void seedStarterCatalog()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#087f5b] rounded-lg hover:bg-[#06694b] whitespace-nowrap cursor-pointer"
                >
                  ৮টি পণ্য সিড করুন
                </button>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
                    <tr>
                      <th className="py-3 px-4 font-medium">পণ্য</th>
                      <th className="py-3 px-4 font-medium text-right">দাম</th>
                      <th className="py-3 px-4 font-medium text-right">স্টক</th>
                      <th className="py-3 px-4 font-medium text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 shrink-0">
                              <ProductImage
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate max-w-[200px]">
                                {p.name}
                              </p>
                              <p className="text-xs text-slate-500 truncate max-w-[200px]">
                                {p.nameBn}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono-tabular font-semibold text-slate-900 whitespace-nowrap">
                          {formatBDT(p.price)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono-tabular text-slate-700 whitespace-nowrap">
                          {p.stock}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEdit(p)}
                              aria-label={`Edit ${p.name}`}
                              className="p-2 text-slate-500 hover:text-[#087f5b] rounded-lg hover:bg-slate-100 cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteProduct(p.id)}
                              aria-label={`Delete ${p.name}`}
                              className="p-2 text-slate-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({allOrders.length})
            </button>
            {ALL_STATUSES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {adminOrdersLoading ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
              অর্ডার তালিকা লোড হচ্ছে...
            </div>
          ) : filteredAdminOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
              <PackageCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-900">
                এই ক্যাটাগরিতে কোনো অর্ডার নেই
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAdminOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-mono-tabular font-bold text-slate-900">
                        {order.trackingId}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="font-medium text-slate-900">
                        {order.customerName}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="text-slate-600">{order.phone}</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {order.address}, {order.city} · {order.paymentMethod} ·{' '}
                      <span className="font-mono-tabular font-semibold text-slate-900">
                        {formatBDT(order.total)}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">
                      পণ্য:{' '}
                      {order.items
                        .map((i) => `${i.name} (×${i.quantity})`)
                        .join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <label className="text-xs text-slate-500" htmlFor={`status-${order.id}`}>
                      স্ট্যাটাস:
                    </label>
                    <select
                      id={`status-${order.id}`}
                      value={order.status}
                      onChange={(e) =>
                        void updateOrderStatus(
                          order.id,
                          e.target.value as OrderStatus,
                          order.notes || '',
                        )
                      }
                      className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
                    >
                      {ALL_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
