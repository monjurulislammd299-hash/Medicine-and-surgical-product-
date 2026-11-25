import React from 'react';
import { Search, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function SearchStrip() {
  const { searchTerm, setSearchTerm } = useStore();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div id="top" className="border-b border-slate-200 bg-slate-50/80">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3">
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center w-full bg-white border border-slate-200 rounded-lg overflow-hidden focus-within:border-[#087f5b] transition-colors"
        >
          <div className="relative flex-1 min-w-0 flex items-center">
            <Search
              className="w-4 h-4 text-slate-400 ml-3.5 shrink-0 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ওষুধ, সার্জিক্যাল পণ্য বা ব্র্যান্ড খুঁজুন..."
              aria-label="Search products"
              className="w-full pl-2.5 pr-2 py-2.5 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
                className="p-1.5 mr-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="self-stretch px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#087f5b] hover:bg-[#06694b] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            খুঁজুন
          </button>
        </form>
      </div>
    </div>
  );
}
