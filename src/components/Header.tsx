import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  LogIn,
  LogOut,
  MessageCircle,
  Settings,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { WHATSAPP_HELPLINE_DISPLAY, WHATSAPP_HELPLINE_NUMBER } from '../types';

export function Header() {
  const {
    user,
    profile,
    isAdmin,
    activeView,
    setActiveView,
    setLoginDialogOpen,
    setProfileModalOpen,
    setOrdersModalOpen,
    setTrackingModalOpen,
    setCategoryModalOpen,
    logout,
  } = useStore();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSettingsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleNavClick = (sectionId?: string) => {
    setActiveView('store');
    setSettingsOpen(false);
    if (sectionId) {
      window.setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 30);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openAdminPanel = () => {
    setSettingsOpen(false);
    setActiveView(activeView === 'admin' ? 'store' : 'admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    setSettingsOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-sky-100">
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Single-element Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick();
          }}
          className="font-display text-sm sm:text-lg font-bold tracking-tight text-slate-900 min-w-0 flex items-center gap-2 sm:gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f5b] rounded"
        >
          <img
            src="/assets/aistudio/company_logo_db9cd45e.png"
            alt="Medicine & Surgical Products"
            className="h-8 w-8 sm:h-9 sm:w-9 object-contain rounded-md bg-white shrink-0"
          />
          <span className="truncate">Medicine &amp; Surgical Products</span>
        </a>

        {/* Zone 3: Single Primary Action (Settings Dropdown with Profile, Admin Panel, WhatsApp & Logout) */}
        <div className="relative flex items-center shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setSettingsOpen((prev) => !prev)}
            aria-expanded={settingsOpen}
            aria-haspopup="menu"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f5b]"
          >
            <Settings className="w-4 h-4 text-[#087f5b] shrink-0" />
            <span>Settings</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-150 ${
                settingsOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {settingsOpen && (
            <div
              role="menu"
              aria-label="Account and store settings"
              className="absolute right-0 top-full mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50"
            >
              {user && (
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {profile?.displayName || user.displayName || 'Signed-in Account'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {user.email}
                  </p>
                </div>
              )}

              {user ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setSettingsOpen(false);
                    setProfileModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-[#087f5b] shrink-0" />
                  <span>Profile (Edit)</span>
                </button>
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setSettingsOpen(false);
                    setLoginDialogOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-[#087f5b] shrink-0" />
                  <span>Login / Register</span>
                </button>
              )}

              {(!user || isAdmin) && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={openAdminPanel}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                    activeView === 'admin'
                      ? 'bg-emerald-50 text-[#087f5b] font-semibold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-[#087f5b] shrink-0" />
                  <span>
                    {activeView === 'admin' ? 'Back to Store' : 'Admin Panel'}
                  </span>
                </button>
              )}

              <a
                href={`https://wa.me/${WHATSAPP_HELPLINE_NUMBER}?text=${encodeURIComponent(
                  'আসসালামু আলাইকুম, Medicine & Surgical Products সম্পর্কে সহায়তা প্রয়োজন।',
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={() => setSettingsOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-emerald-50/70 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#087f5b] shrink-0" />
                <div className="min-w-0">
                  <span className="block leading-tight">Help Line (WhatsApp)</span>
                  <span className="block text-[11px] text-slate-500 font-mono-tabular">
                    {WHATSAPP_HELPLINE_DISPLAY}
                  </span>
                </div>
              </a>

              {user && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void handleLogout()}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer border-t border-slate-100 mt-1 pt-2.5"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lower Navigation Bar with soft light-blue background */}
      <nav
        aria-label="Primary navigation"
        className="border-t border-blue-200 bg-blue-100"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-start gap-5 sm:gap-7 text-xs sm:text-sm font-medium text-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => handleNavClick('products')}
            className="whitespace-nowrap shrink-0 hover:text-blue-950 transition-colors cursor-pointer py-0.5"
          >
            Products
          </button>
          <button
            type="button"
            onClick={() => {
              setSettingsOpen(false);
              setOrdersModalOpen(true);
            }}
            className="whitespace-nowrap shrink-0 hover:text-blue-950 transition-colors cursor-pointer py-0.5"
          >
            My Orders
          </button>
          <button
            type="button"
            onClick={() => {
              setSettingsOpen(false);
              setTrackingModalOpen(true);
            }}
            className="whitespace-nowrap shrink-0 hover:text-blue-950 transition-colors cursor-pointer py-0.5"
          >
            Order Tracking
          </button>
          <button
            type="button"
            onClick={() => {
              setSettingsOpen(false);
              setCategoryModalOpen(true);
            }}
            className="whitespace-nowrap shrink-0 hover:text-blue-950 transition-colors cursor-pointer py-0.5"
          >
            Product Category
          </button>
          {!user && (
            <button
              type="button"
              onClick={() => setLoginDialogOpen(true)}
              className="ml-auto whitespace-nowrap shrink-0 text-[#087f5b] hover:text-[#06694b] font-semibold cursor-pointer py-0.5"
            >
              Login
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
