import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  ShoppingBag,
  Truck,
  X,
  XCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatBDT } from '../lib/validation';
import { ORDER_STATUS_FLOW, OrderStatus } from '../types';

function formatOrderDate(createdAt: unknown): string {
  if (!createdAt) return 'এইমাত্র';
  if (
    typeof createdAt === 'object' &&
    createdAt !== null &&
    'toDate' in createdAt &&
    typeof (createdAt as { toDate: () => Date }).toDate === 'function'
  ) {
    return (createdAt as { toDate: () => Date })
      .toDate()
      .toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
  }
  return 'এইমাত্র';
}

function StatusBadge({ status }: { status: OrderStatus }) {
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

export function MyOrdersModal() {
  const {
    user,
    myOrders,
    ordersLoading,
    ordersModalOpen,
    setOrdersModalOpen,
    setLoginDialogOpen,
    cancelMyOrder,
  } = useStore();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!ordersModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOrdersModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ordersModalOpen, setOrdersModalOpen]);

  if (!ordersModalOpen) return null;

  const handleCancel = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      await cancelMyOrder(orderId);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="my-orders-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full p-6 sm:p-7 relative shadow-lg max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={() => setOrdersModalOpen(false)}
          aria-label="Close my orders modal"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 text-[#087f5b] mb-2">
          <ShoppingBag className="w-5 h-5" />
          <span className="text-xs font-semibold">অর্ডার ইতিহাস</span>
        </div>

        <h2
          id="my-orders-modal-title"
          className="font-display text-xl font-bold text-slate-900 mb-1"
        >
          আমার অর্ডার (My Orders)
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mb-6">
          আপনার সকল অর্ডার এবং বর্তমান অবস্থা এখানে দেখতে পারবেন।
        </p>

        {!user ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 mb-1">
                আপনার অর্ডার ইতিহাস দেখতে লগইন করুন
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                নিরাপদ Tracking ID, ডেলিভারি স্ট্যাটাস এবং পূর্বের অর্ডারের বিবরণ কেবল আপনার
                অ্যাকাউন্টে সুরক্ষিত থাকে।
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOrdersModalOpen(false);
                setLoginDialogOpen(true);
              }}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#087f5b] hover:bg-[#06694b] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Login করুন
            </button>
          </div>
        ) : !user.emailVerified ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 mb-1">
                ইমেইল ভেরিফিকেশন সম্পন্ন করুন
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                আপনার অর্ডার তালিকা দেখতে ইমেইল ({user.email}) ভেরিফাই করা প্রয়োজন।
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOrdersModalOpen(false);
                setLoginDialogOpen(true);
              }}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#087f5b] hover:bg-[#06694b] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              ভেরিফিকেশন স্ট্যাটাস দেখুন
            </button>
          </div>
        ) : ordersLoading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="bg-slate-50 border border-slate-200 rounded-xl p-5 animate-pulse space-y-3"
              >
                <div className="h-4 w-48 bg-slate-200 rounded" />
                <div className="h-3 w-72 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : myOrders.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
            <p className="text-base font-semibold text-slate-900 mb-1">
              এখনো কোনো অর্ডার নেই
            </p>
            <p className="text-sm text-slate-600">
              পণ্য তালিকা থেকে প্রয়োজনীয় ওষুধ বা সার্জিক্যাল পণ্য কার্টে যোগ করে অর্ডার করুন।
            </p>
          </div>
        ) : (
          <div id="orderList" className="space-y-4">
            {myOrders.map((order) => {
              const currentStepIdx = ORDER_STATUS_FLOW.indexOf(order.status);
              const isCancelled = order.status === 'Cancelled';

              return (
                <article
                  key={order.id}
                  className="bg-white border border-slate-200 rounded-xl p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm">
                      <span className="font-mono-tabular font-semibold text-slate-900">
                        {order.trackingId}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="text-slate-600">
                        {formatOrderDate(order.createdAt)}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="text-slate-600">{order.paymentMethod}</span>
                    </div>

                    <StatusBadge status={order.status} />
                  </div>

                  {!isCancelled && (
                    <div className="py-4 border-b border-slate-100">
                      <div className="grid grid-cols-5 gap-2">
                        {ORDER_STATUS_FLOW.map((step, idx) => {
                          const completed = currentStepIdx >= idx;
                          return (
                            <div key={step} className="flex flex-col gap-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-colors ${
                                  completed ? 'bg-[#087f5b]' : 'bg-slate-200'
                                }`}
                              />
                              <span
                                className={`text-[10px] sm:text-xs truncate ${
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
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4">
                    <div className="md:col-span-7 space-y-2">
                      <p className="text-xs font-medium text-slate-500">অর্ডারকৃত পণ্য</p>
                      <ul className="divide-y divide-slate-100 text-sm">
                        {order.items.map((item, idx) => (
                          <li
                            key={`${item.productId}-${idx}`}
                            className="py-2 flex items-center justify-between gap-4"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {item.quantity} × {formatBDT(item.price)}
                              </p>
                            </div>
                            <span className="font-mono-tabular font-medium text-slate-900 shrink-0">
                              {formatBDT(item.price * item.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="md:col-span-5 flex flex-col justify-between bg-slate-50 rounded-lg p-4 border border-slate-100">
                      <div className="text-xs text-slate-600 space-y-1">
                        <p className="font-semibold text-slate-900 text-sm">
                          {order.customerName}
                        </p>
                        <p>{order.phone}</p>
                        <p>
                          {order.address}, {order.city}
                        </p>
                        {order.notes && (
                          <p className="text-slate-500 pt-1">নোট: {order.notes}</p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                        <div>
                          <span className="block text-xs text-slate-500">সর্বমোট</span>
                          <span className="font-mono-tabular text-base font-bold text-slate-900">
                            {formatBDT(order.total)}
                          </span>
                        </div>

                        {order.status === 'Pending' && (
                          <button
                            type="button"
                            disabled={cancellingId === order.id}
                            onClick={() => void handleCancel(order.id)}
                            className="px-3 py-1.5 text-xs font-medium text-rose-700 border border-rose-200 bg-white hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {cancellingId === order.id ? 'বাতিল হচ্ছে...' : 'অর্ডার বাতিল'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
