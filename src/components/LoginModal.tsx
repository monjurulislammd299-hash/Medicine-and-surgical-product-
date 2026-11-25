import React, { useState } from 'react';
import { MailCheck, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function LoginModal() {
  const {
    user,
    loginDialogOpen,
    setLoginDialogOpen,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    resetPassword,
    resendVerification,
    refreshVerification,
    logout,
    authError,
    clearAuthError,
  } = useStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loginDialogOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name);
      }
    } catch {
      // Error surfaced via authError
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await resetPassword(email);
    } catch {
      // Error surfaced via authError
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-dialog-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 sm:p-8 relative shadow-lg max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={() => {
            clearAuthError();
            setLoginDialogOpen(false);
          }}
          aria-label="Close login modal"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {user && !user.emailVerified ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-amber-700">
              <MailCheck className="w-5 h-5" />
              <span className="text-xs font-semibold">ইমেইল ভেরিফিকেশন প্রয়োজন</span>
            </div>
            <h2
              id="login-dialog-title"
              className="font-display text-xl font-bold text-slate-900"
            >
              আপনার ইমেইল ভেরিফাই করুন
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              আমরা <span className="font-mono-tabular font-medium text-slate-900">{user.email}</span>{' '}
              ঠিকানায় একটি ভেরিফিকেশন লিংক পাঠিয়েছি। অর্ডার প্লেস ও ট্র্যাক করতে লিংকটিতে
              ক্লিক করুন।
            </p>

            {authError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {authError}
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => void refreshVerification()}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#087f5b] hover:bg-[#06694b] rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>ভেরিফাই সম্পন্ন (রিফ্রেশ)</span>
              </button>
              <button
                type="button"
                onClick={() => void resendVerification()}
                className="w-full px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                ভেরিফিকেশন ইমেইল আবার পাঠান
              </button>
              <button
                type="button"
                onClick={() => void logout()}
                className="text-xs text-slate-500 hover:text-slate-900 underline pt-1 cursor-pointer"
              >
                অন্য অ্যাকাউন্ট ব্যবহার করুন (Logout)
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2.5 text-[#087f5b] mb-3">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-semibold">নিরাপদ কাস্টমার অ্যাকাউন্ট</span>
            </div>

            <h2
              id="login-dialog-title"
              className="font-display text-xl font-bold text-slate-900 mb-1"
            >
              Customer Login / Registration
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              ইমেইল ও পাসওয়ার্ড অথবা Google অ্যাকাউন্ট দিয়ে লগইন করুন।
            </p>

            {/* Login / Register Mode Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  clearAuthError();
                }}
                className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  clearAuthError();
                }}
                className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Register
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed">
                {authError}
              </div>
            )}

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3.5">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    পূর্ণ নাম
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="আপনার নাম"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Password * (কমপক্ষে ৬ অক্ষর)
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => void handleResetPassword()}
                      disabled={!email.trim() || submitting}
                      className="text-[11px] font-medium text-[#087f5b] hover:underline disabled:opacity-40 cursor-pointer"
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#087f5b]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-5 text-sm font-semibold text-white bg-[#087f5b] hover:bg-[#06694b] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
              >
                {submitting
                  ? 'অপেক্ষা করুন...'
                  : mode === 'login'
                  ? 'Login'
                  : 'Register'}
              </button>
            </form>

            <div className="relative my-5">
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
              className="w-full flex items-center justify-center gap-3 px-5 py-2.5 text-sm font-medium text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
