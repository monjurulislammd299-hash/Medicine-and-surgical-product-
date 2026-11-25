import { AdminPanel } from './components/AdminPanel';
import { CartDrawer } from './components/CartDrawer';
import { CategoryModal } from './components/CategoryModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { LoginModal } from './components/LoginModal';
import { MyOrdersModal } from './components/MyOrdersModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { ProductCatalog } from './components/ProductCatalog';
import { ProfileModal } from './components/ProfileModal';
import { SearchStrip } from './components/SearchStrip';
import { StoreProvider, useStore } from './context/StoreContext';

function StoreShell() {
  const { activeView, toastMessage } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1">
        {activeView === 'admin' ? (
          <AdminPanel />
        ) : (
          <>
            <SearchStrip />
            <ProductCatalog />
            <Hero />
          </>
        )}
      </main>

      <Footer />
      <CartDrawer />
      <LoginModal />
      <ProfileModal />
      <MyOrdersModal />
      <OrderTrackingModal />
      <CategoryModal />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs sm:text-sm font-medium rounded-lg shadow-lg pointer-events-none max-w-[90vw] truncate"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <StoreShell />
      </StoreProvider>
    </ErrorBoundary>
  );
}
