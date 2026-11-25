import React, { useEffect, useState } from 'react';
import { CheckCircle2, MailCheck, MapPin, Phone, Save, User as UserIcon, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { LIMITS, normalizePhoneDigits } from '../lib/validation';

export function ProfileModal() {
  const {
    user,
    profile,
    profileModalOpen,
    setProfileModalOpen,
    setLoginDialogOpen,
    updateUserProfile,
  } = useStore();

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileModalOpen) return;
    setFormError(null);
    setDisplayName(profile?.displayName || user?.displayName || '');
    setPhone(profile?.phone || '');
    setCity(profile?.city || 'Dhaka');
    setAddress(profile?.address || '');
  }, [profileModalOpen, profile, user]);

  useEffect(() => {
    if (!profileModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProfileModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [profileModalOpen, setProfileModalOpen]);

  if (!profileModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = displayName.trim();
    const normalizedPhone = normalizePhoneDigits(phone);
    const trimmedCity = city.trim();
    const trimmedAddress = address.trim();

    if (trimmedName.length < LIMITS.ORDER_NAME_MIN) {
      setFormError('অনুগ্রহ করে কমপক্ষে ২ অক্ষরের পূর্ণ নাম লিখুন।');
      return;
    }

    if (normalizedPhone && !LIMITS.ORDER_PHONE_PATTERN.test(normalizedPhone)) {
      setFormError('সঠিক মোবাইল নম্বর লিখুন (যেমন: 01711-000000)।');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile({
        displayName: trimmedName,
        phone: normalizedPhone,
        city: trimmedCity,
        address: trimmedAddress,
      });
      setProfileModalOpen(false);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'প্রোফাইল সংরক্ষণ করা যায়নি।',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-dialog-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 sm:p-8 relative shadow-lg max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={() => setProfileModalOpen(false)}
          aria-label="Close profile modal"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-[#087f5b]">
              <UserIcon className="w-5 h-5" />
              <span className="text-xs font-semibold">কাস্টমার প্রোফাইল</span>
            </div>
            <h2
              id="profile-dialog-title"
              className="font-display text-xl font-bold text-slate-900"
            >
              প্রোফাইল দেখতে লগইন করুন
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              আপনার নাম, ফোন নম্বর ও ডেলিভারি ঠিকানা সংরক্ষণ ও এডিট করতে অনুগ্রহ করে লগইন করুন।
            </p>
            <button
              type="button"
              onClick={() => {
                setProfileModalOpen(false);
                setLoginDialogOpen(true);
              }}
              className="w-full py-2.5 px-5 text-sm font-semibold text-white bg-[#087f5b] hover:bg-[#06694b] rounded-lg transition-colors cursor-pointer"
            >
              Login / Register
            </button>
          </div>
        ) : !user.emailVerified ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-amber-700">
              <MailCheck className="w-5 h-5" />
              <span className="text-xs font-semibold">ইমেইল ভেরিফিকেশন প্রয়োজন</span>
            </div>
            <h2
              id="profile-dialog-title"
              className="font-display text-xl font-bold text-slate-900"
            >
              ইমেইল ভেরিফাই করুন
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              প্রোফাইল তথ্য সংরক্ষণ করতে আগে আপনার{' '}
              <span className="font-mono-tabular font-medium text-slate-900">{user.email}</span>{' '}
              ইমেইলটি ভেরিফাই করুন।
            </p>
            <button
              type="button"
              onClick={() => {
                setProfileModalOpen(false);
                setLoginDialogOpen(true);
              }}
              className="w-full py-2.5 px-5 text-sm font-semibold text-white bg-[#087f5b] hover:bg-[#06694b] rounded-lg transition-colors cursor-pointer"
            >
              ভেরিফিকেশন পেজে যান
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2.5 text-[#087f5b] mb-2">
              <UserIcon className="w-5 h-5" />
              <span className="text-xs font-semibold">আমার প্রোফাইল</span>
            </div>

            <h2
              id="profile-dialog-title"
              className="font-display text-xl font-bold text-slate-900 mb-1"
            >
              প্রোফাইল তথ্য এডিট করুন
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
              এখানে সংরক্ষিত নাম, ফোন ও ঠিকানা আপনার পরবর্তী অর্ডারে অটোমেটিক ব্যবহৃত হবে।
            </p>

            {/* Verified Account Summary */}
            <div className="mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500">ভেরিফাইড ইমেইল</p>
                <p className="text-xs font-medium text-slate-900 truncate">{user.email}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#087f5b] shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed">
                {formError}
              </div>
            )}

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3.5">
              <div>
                <label
                  htmlFor="profile-display-name"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  পূর্ণ নাম *
                </label>
                <input
                  id="profile-display-name"
                  type="text"
                  required
                  minLength={LIMITS.ORDER_NAME_MIN}
                  maxLength={LIMITS.ORDER_NAME_MAX}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="আপনার পূর্ণ নাম লিখুন"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="profile-phone"
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>মোবাইল নম্বর</span>
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    maxLength={LIMITS.ORDER_PHONE_MAX}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-city"
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>শহর / জেলা</span>
                  </label>
                  <input
                    id="profile-city"
                    type="text"
                    maxLength={LIMITS.ORDER_CITY_MAX}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Dhaka"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="profile-address"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  ডেলিভারি ঠিকানা
                </label>
                <textarea
                  id="profile-address"
                  rows={3}
                  maxLength={LIMITS.ORDER_ADDRESS_MAX}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="বাসা/রোড নম্বর, এলাকা, পোস্টাল কোড..."
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b] resize-none"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="flex-1 py-2.5 px-4 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-[#087f5b] hover:bg-[#06694b] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
