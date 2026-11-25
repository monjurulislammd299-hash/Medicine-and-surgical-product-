import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { LIMITS, formatBDT, normalizePhoneDigits } from '../lib/validation';
import { Order, PaymentMethod } from '../types';
import { ProductImage } from './ProductImage';

export function CartDrawer() {
  const {
    user,
    profile,
    cart,
    cartOpen,
    setCartOpen,
    updateCartQty,
    removeFromCart,
    cartCount,
    cartSubtotal,
    placeOrder,
    setLoginDialogOpen,
    setOrdersModalOpen,
  } = useStore();

  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmed'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');
  const [notes, setNotes] = useState('');
  const [saveProfile, setSaveProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Pre-fill customer profile when signed in
  useEffect(() => {
    if (profile) {
      if (!customerName && profile.displayName) setCustomerName(profile.displayName);
      if (!phone && profile.phone) setPhone(profile.phone);
      if (!address && profile.address) setAddress(profile.address);
      if (profile.city) setCity(profile.city);
    } else if (user?.displayName && !customerName) {
      setCustomerName(user.displayName);
    }
  }, [profile, user, customerName, phone, address]);

  const deliveryFee =
    cartSubtotal === 0
      ? 0
      : cartSubtotal >= 2000
      ? 0
      : city.trim().toLowerCase() === 'dhaka'
      ? 60
      : 120;
  const grandTotal = cartSubtotal + deliveryFee;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!user || !user.emailVerified) {
      setLoginDialogOpen(true);
      return;
    }

    const normalizedPhone = normalizePhoneDigits(phone);
    if (customerName.trim().length < LIMITS.ORDER_NAME_MIN) {
      setFormError('সঠিক পূর্ণ নাম লিখুন (কমপক্ষে ২ অক্ষর)।');
      return;
    }
    if (!LIMITS.ORDER_PHONE_PATTERN.test(normalizedPhone)) {
      setFormError('সঠিক মোবাইল নম্বর লিখুন (যেমন 017XXXXXXXX)।');
      return;
    }
    if (address.trim().length < LIMITS.ORDER_ADDRESS_MIN) {
      setFormError('বিস্তারিত ডেলিভারি ঠিকানা লিখুন।');
      return;
    }

    setSubmitting(true);
    try {
      const created = await placeOrder({
        customerName,
        phone: normalizedPhone,
        address,
        city: city.trim() || 'Dhaka',
        paymentMethod,
        notes,
        saveProfile,
      });
      setConfirmedOrder(created);
      setStep('confirmed');
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'অর্ডার সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const closeAndReset = () => {
    setCartOpen(false);
    if (step === 'confirmed') {
      setStep('cart');
      setConfirmedOrder(null);
    }
  };

  return (
    <>
      {/* Floating Cart Button (compact height for mobile 15% cap compliance) */}
      <button
        id="cartFab"
        type="button"
        onClick={() => {
          if (step === 'confirmed') setStep('cart');
          setCartOpen(true);
        }}
        aria-label="Open shopping cart"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-white bg-[#087f5b] hover:bg-[#06694b] rounded-full shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer"
      >
        <ShoppingCart className="w-4 h-4" />
        <span id="cartCount" className="font-mono-tabular">
          {cartCount}
        </span>
      </button>

      {/* Backdrop */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px]"
          onClick={closeAndReset}
          aria-hidden="true"
        />
      )}

      {/* Slide-over Cart & Checkout Drawer */}
      <aside
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-transform duration-200 ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              {step === 'cart'
                ? 'আপনার কার্ট'
                : step === 'checkout'
                ? 'ডেলিভারি তথ্য'
                : 'অর্ডার নিশ্চিত হয়েছে'}
            </h2>
            {step === 'cart' && (
              <p className="text-xs text-slate-500">
                ৳২,০০০+ অর্ডারে ফ্রি হোম ডেলিভারি
              </p>
            )}
          </div>

          <button
            id="closeCart"
            type="button"
            onClick={closeAndReset}
            aria-label="Close cart"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 'confirmed' && confirmedOrder ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-[#087f5b] mx-auto mb-3" />
              <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
                ধন্যবাদ! আপনার অর্ডার গৃহীত হয়েছে
              </h3>
              <p className="text-sm text-slate-600 mb-5">
                আপনার অর্ডারটি বর্তমানে যাচাই করা হচ্ছে। নিচের Tracking ID দিয়ে অর্ডার
                ট্র্যাক করতে পারবেন।
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2 mb-6">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Tracking ID</span>
                  <span className="font-mono-tabular font-bold text-slate-900">
                    {confirmedOrder.trackingId}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>পেমেন্ট মাধ্যম</span>
                  <span className="font-medium text-slate-900">
                    {confirmedOrder.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                  <span className="font-medium text-slate-700">মোট বিল</span>
                  <span className="font-mono-tabular font-bold text-slate-900">
                    {formatBDT(confirmedOrder.total)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  closeAndReset();
                  setOrdersModalOpen(true);
                }}
                className="w-full py-3 px-5 text-sm font-semibold text-white bg-[#087f5b] hover:bg-[#06694b] rounded-lg transition-colors cursor-pointer"
              >
                আমার অর্ডার দেখুন
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-900 mb-1">
                আপনার কার্ট বর্তমানে খালি
              </p>
              <p className="text-xs text-slate-500">
                পণ্য তালিকা থেকে প্রয়োজনীয় ওষুধ বা সার্জিক্যাল পণ্য যোগ করুন।
              </p>
            </div>
          ) : step === 'cart' ? (
            <div id="cartItems" className="divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.productId} className="py-4 flex gap-3.5">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 shrink-0">
                    <ProductImage
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{item.unit}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center border border-slate-200 rounded-md">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQty(item.productId, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-mono-tabular font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQty(item.productId, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          className="p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono-tabular text-sm font-semibold text-slate-900">
                          {formatBDT(item.price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          aria-label={`Remove ${item.name}`}
                          className="p-1 text-slate-400 hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form
              id="checkoutForm"
              onSubmit={(e) => void handleCheckoutSubmit(e)}
              className="space-y-4"
            >
              {(!user || !user.emailVerified) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center justify-between gap-2">
                  <span>
                    {!user
                      ? 'অর্ডার সাবমিট করতে আগে লগইন করুন।'
                      : 'অর্ডার সাবমিট করতে আগে ইমেইল ভেরিফাই করুন।'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLoginDialogOpen(true)}
                    className="font-semibold underline cursor-pointer shrink-0"
                  >
                    {!user ? 'Login' : 'Verify'}
                  </button>
                </div>
              )}

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  পূর্ণ নাম *
                </label>
                <input
                  type="text"
                  required
                  maxLength={LIMITS.ORDER_NAME_MAX}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="আপনার নাম লিখুন"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    মোবাইল নম্বর *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={LIMITS.ORDER_PHONE_MAX}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    শহর / জেলা *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={LIMITS.ORDER_CITY_MAX}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Dhaka"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ডেলিভারি ঠিকানা *
                </label>
                <textarea
                  required
                  rows={2}
                  maxLength={LIMITS.ORDER_ADDRESS_MAX}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="বাড়ি নং, রোড, এলাকা..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  পেমেন্ট পদ্ধতি
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as PaymentMethod)
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
                >
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="bKash (Demo)">bKash (Demo)</option>
                  <option value="Nagad (Demo)">Nagad (Demo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  বিশেষ নোট (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  maxLength={LIMITS.ORDER_NOTES_MAX}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ডেলিভারি বা প্রেসক্রিপশন সংক্রান্ত তথ্য"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveProfile}
                  onChange={(e) => setSaveProfile(e.target.checked)}
                  className="rounded border-slate-300 text-[#087f5b] focus:ring-[#087f5b]"
                />
                <span>পরবর্তী অর্ডারের জন্য ঠিকানা সংরক্ষণ করুন</span>
              </label>
            </form>
          )}
        </div>

        {/* Footer Summary */}
        {cart.length > 0 && step !== 'confirmed' && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>সাবটোটাল</span>
                <span className="font-mono-tabular">{formatBDT(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ডেলিভারি চার্জ ({city || 'Dhaka'})</span>
                <span className="font-mono-tabular">
                  {deliveryFee === 0 ? 'Free' : formatBDT(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                <span>মোট</span>
                <span id="cartTotal" className="font-mono-tabular">
                  {formatBDT(grandTotal)}
                </span>
              </div>
            </div>

            {step === 'cart' ? (
              <button
                id="checkout"
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3 px-5 text-sm font-semibold text-white bg-[#087f5b] hover:bg-[#06694b] rounded-lg transition-colors cursor-pointer"
              >
                অর্ডার করুন
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  পিছনে
                </button>
                <button
                  type="submit"
                  form="checkoutForm"
                  disabled={submitting}
                  className="flex-1 py-3 px-5 text-sm font-semibold text-white bg-[#087f5b] hover:bg-[#06694b] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                >
                  {submitting ? 'সাবমিট হচ্ছে...' : 'অর্ডার নিশ্চিত করুন'}
                </button>
              </div>
            )}

            <p className="text-[11px] text-slate-500 text-center">
              ডেমো: আসল পেমেন্ট চালু করতে অনুমোদিত bKash/Nagad gateway লাগবে।
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
