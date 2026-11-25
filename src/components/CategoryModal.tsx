import { useEffect } from 'react';
import { Check, LayoutGrid, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PRODUCT_CATEGORIES, ProductCategory } from '../types';

export function CategoryModal() {
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    categoryModalOpen,
    setCategoryModalOpen,
    setActiveView,
  } = useStore();

  useEffect(() => {
    if (!categoryModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCategoryModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [categoryModalOpen, setCategoryModalOpen]);

  if (!categoryModalOpen) return null;

  const handleSelect = (category: 'ALL' | ProductCategory) => {
    setSelectedCategory(category);
    setActiveView('store');
    setCategoryModalOpen(false);
    window.setTimeout(() => {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    }, 40);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 relative shadow-lg">
        <button
          type="button"
          onClick={() => setCategoryModalOpen(false)}
          aria-label="Close product category modal"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-[#087f5b] mb-2">
          <LayoutGrid className="w-5 h-5" />
          <span className="text-xs font-semibold">ক্যাটাগরি অনুযায়ী পণ্য</span>
        </div>

        <h2
          id="category-modal-title"
          className="font-display text-xl font-bold text-slate-900 mb-1"
        >
          Product Category
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mb-5">
          যেকোনো ক্যাটাগরি বেছে নিয়ে নির্দিষ্ট পণ্যগুলো দেখুন।
        </p>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleSelect('ALL')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'border-[#087f5b] bg-emerald-50/70 text-[#087f5b]'
                : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span>সব পণ্য (All Products)</span>
            <span className="inline-flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono-tabular">{products.length}টি</span>
              {selectedCategory === 'ALL' && <Check className="w-4 h-4 text-[#087f5b]" />}
            </span>
          </button>

          {PRODUCT_CATEGORIES.map((cat) => {
            const count = products.filter((p) => p.category === cat).length;
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleSelect(cat)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? 'border-[#087f5b] bg-emerald-50/70 text-[#087f5b]'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span>{cat}</span>
                <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono-tabular">{count}টি</span>
                  {active && <Check className="w-4 h-4 text-[#087f5b]" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
