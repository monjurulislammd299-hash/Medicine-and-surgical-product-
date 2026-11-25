import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  Search,
  Truck,
  X,
  XCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatBDT } from '../lib/validation';
import { ORDER_STATUS_FLOW, OrderStatus } from '../types';

function TrackingStatusLabel({ status }: { status: OrderStatus }) {
  switch (status) {
    case 'Pending':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800">
          <Clock className="w-3.5 h-3.5" />
          <span>Pending</span>
        </span>
      );
    case 'Confirmed':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-800">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Confirmed</span>
        </span>
      );
    case 'Packed':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-800">
          <Package className="w-3.5 h-3.5" />
          <span>Packed</span>
        </span>
      );
    case 'Shipped':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
          <Truck className="w-3.5 h-3.5" />
          <span>Shipped</span>
        </span>
      );
    case 'Delivered':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#087f5b]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Delivered</span>
        </span>
      );
    case 'Cancelled':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
          <XCircle className="w-3.5 h-3.5" />
          <span>Cancelled</span>
        </span>
      );
  }
}

export function OrderTrackingModal() {
  const {
    user,
    isAdmin,
    myOrders,
    allOrders,
    trackingModalOpen,
    setTrackingModalOpen,
    setLoginDialogOpen,
  } = useStore();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!trackingModalOpen) return;
    setQuery('');
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTrackingModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [trackingModalOpen, setTrackingModalOpen]);

  const sourceOrders = isAdmin && allOrders.length > 0 ? allOrders : myOrders;

  const matchedOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sourceOrders;
    return sourceOrders.filter(
      (o) =>
        o.trackingId.toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q),
    );
  }, [sourceOrders, query]);

  if (!trackingModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-tracking-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 sm:p-7 relative shadow-lg max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={() => setTrackingModalOpen(false)}
          aria-label="Close order tracking modal"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 text-[#087f5b] mb-2">
          <Truck className="w-5 h-5" />
          <span className="text-xs font-semibold">অর্ডার ট্র্যাকিং</span>
        </div>

        <h2
          id="order-tracking-modal-title"
          className="font-display text-xl font-bold text-slate-900 mb-1"
        >
          Order Tracking
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mb-5">
          আপনার Tracking ID (যেমন MSP-...) দিয়ে অর্ডারের বর্তমান অবস্থা দেখুন।
        </p>

        {!user || !user.emailVerified ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-3">
            <p className="text-sm text-slate-700">
              {!user
                ? 'অর্ডার ট্র্যাক করতে অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন করুন।'
                : 'অর্ডার ট্র্যাক করতে আগে আপনার ইমেইল ভেরিফাই করুন।'}
            </p>
            <button
              type="button"
              onClick={() => {
                setTrackingModalOpen(false);
                setLoginDialogOpen(true);
              }}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#087f5b] hover:bg-[#06694b] rounded-lg transition-colors cursor-pointer"
            >
              {!user ? 'Login করুন' : 'ভেরিফিকেশন পেজে যান'}
            </button>
          </div>
        ) : (
          <>
            <div className="relative mb-5">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tracking ID লিখুন (যেমন: MSP-...)"
                aria-label="Search order by Tracking ID"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#087f5b]"
              />
            </div>

            {matchedOrders.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center text-sm text-slate-600">
                {query.trim()
                  ? 'এই Tracking ID-তে কোনো অর্ডার পাওয়া যায়নি।'
                  : 'আপনার এখনো কোনো অর্ডার নেই।'}
              </div>
            ) : (
              <div className="space-y-4">
                {matchedOrders.map((order) => {
                  const currentIdx = ORDER_STATUS_FLOW.indexOf(order.status);
                  const isCancelled = order.status === 'Cancelled';

                  return (
                    <div
                      key={order.id}
                      className="border border-slate-200 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <span className="font-mono-tabular text-sm font-bold text-slate-900">
                            {order.trackingId}
                          </span>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {order.items.length}টি পণ্য · {formatBDT(order.total)}
                          </p>
                        </div>
                        <TrackingStatusLabel status={order.status} />
                      </div>

                      {!isCancelled && (
                        <div className="grid grid-cols-5 gap-1.5 pt-1">
                          {ORDER_STATUS_FLOW.map((step, idx) => {
                            const completed = currentIdx >= idx;
                            return (
                              <div key={step} className="flex flex-col gap-1">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    completed ? 'bg-[#087f5b]' : 'bg-slate-200'
                                  }`}
                                />
                                <span
                                  className={`text-[10px] sm:text-[11px] truncate ${
                                    completed
                                      ? 'text-slate-900 font-medium'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {step}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
