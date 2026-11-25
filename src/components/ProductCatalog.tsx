import { useMemo, useState } from 'react';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatBDT } from '../lib/validation';
import { Product } from '../types';
import { ProductImage } from './ProductImage';

export function ProductCatalog() {
  const {
    products,
    productsLoading,
    isCatalogSeeded,
    isAdmin,
    seedStarterCatalog,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    cart,
    addToCart,
    updateCartQty,
    setCartOpen,
  } = useStore();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalQty, setModalQty] = useState(1);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return products.filter((p) => {
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.nameBn.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [products, searchTerm, selectedCategory]);

  const getCartQuantity = (productId: string) =>
    cart.find((c) => c.productId === productId)?.quantity ?? 0;

  const openDetailModal = (product: Product) => {
    setSelectedProduct(product);
    setModalQty(1);
  };

  const hasActiveFilter = Boolean(searchTerm.trim()) || selectedCategory !== 'ALL';

  return (
    <section id="products" className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-5 pb-12">
      {hasActiveFilter && (
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-200">
          <p className="text-sm font-medium text-slate-700">
            {selectedCategory !== 'ALL' && (
              <span className="font-semibold text-slate-900">{selectedCategory}</span>
            )}
            {selectedCategory !== 'ALL' && searchTerm.trim() && ' · '}
            {searchTerm.trim() && (
              <span>&ldquo;{searchTerm.trim()}&rdquo;</span>
            )}{' '}
            <span className="text-slate-500">({filteredProducts.length}টি)</span>
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('ALL');
            }}
            className="px-3.5 py-1.5 text-xs font-medium text-[#087f5b] border border-[#087f5b] rounded-lg hover:bg-[#087f5b] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            সব পণ্য দেখুন
          </button>
        </div>
      )}

      {/* Sync Notice when catalog is showing starter items before Admin first sync */}
      {!productsLoading && !isCatalogSeeded && (
        <div className="mt-5 p-4 bg-white border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-slate-600">
          <span>
            Firestore ক্যাটালগ এখনও খালি থাকায় প্রাথমিক যাচাইকৃত পণ্য তালিকা দেখানো হচ্ছে।
          </span>
          {isAdmin && (
            <button
              type="button"
              onClick={() => void seedStarterCatalog()}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#087f5b] hover:bg-[#06694b] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Firestore-এ ৮টি পণ্য সংরক্ষণ করুন
            </button>
          )}
        </div>
      )}

      {/* Loading Skeleton */}
      {productsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden animate-pulse"
            >
              <div className="aspect-[4/3] bg-slate-100" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-32 bg-slate-100 rounded" />
                <div className="h-5 w-3/4 bg-slate-100 rounded" />
                <div className="h-4 w-1/2 bg-slate-100 rounded" />
                <div className="pt-2 flex justify-between items-center">
                  <div className="h-5 w-16 bg-slate-100 rounded" />
                  <div className="h-9 w-28 bg-slate-100 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="mt-10 bg-white border border-slate-200 rounded-xl p-10 text-center">
          <p className="text-base font-semibold text-slate-900 mb-1">
            কোনো পণ্য পাওয়া যায়নি
          </p>
          <p className="text-sm text-slate-600 mb-4">
            অন্য কোনো নাম বা ব্র্যান্ড দিয়ে খুঁজে দেখুন।
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('ALL');
            }}
            className="px-4 py-2 text-sm font-medium text-[#087f5b] border border-[#087f5b] rounded-lg hover:bg-[#087f5b] hover:text-white transition-colors cursor-pointer"
          >
            সব পণ্য দেখুন
          </button>
        </div>
      ) : (
        <div
          id="productGrid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7"
        >
          {filteredProducts.map((product) => {
            const qtyInCart = getCartQuantity(product.id);
            const outOfStock = product.stock <= 0;

            return (
              <article
                key={product.id}
                className="group bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => openDetailModal(product)}
                  className="aspect-[4/3] w-full bg-slate-50 overflow-hidden cursor-pointer block text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f5b]"
                >
                  <ProductImage
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </button>

                <div className="p-5 flex-1 flex flex-col">
                  {/* Unboxed clean metadata line */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 truncate">
                    <span className="truncate">{product.unit}</span>
                    {product.requiresPrescription && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-700 font-medium">Rx Advised</span>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => openDetailModal(product)}
                    className="text-left cursor-pointer group-hover:text-[#087f5b] transition-colors"
                  >
                    <h3 className="font-display text-base font-semibold text-slate-900 leading-snug line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-600 mt-0.5 line-clamp-1">
                      {product.nameBn}
                    </p>
                  </button>

                  <p className="text-xs text-slate-500 mt-2 mb-4">
                    {product.manufacturer}
                    <span aria-hidden="true"> · </span>
                    <span className={outOfStock ? 'text-rose-700 font-medium' : 'text-slate-500'}>
                      {outOfStock ? 'Out of Stock' : `Stock: ${product.stock}`}
                    </span>
                  </p>

                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="font-mono-tabular text-base font-semibold text-slate-900">
                      {formatBDT(product.price)}
                    </span>

                    {qtyInCart > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <div className="inline-flex items-center border border-slate-200 rounded-lg bg-slate-50">
                          <button
                            type="button"
                            onClick={() => updateCartQty(product.id, qtyInCart - 1)}
                            aria-label={`Decrease quantity of ${product.name}`}
                            className="p-2 text-slate-700 hover:text-slate-900 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-mono-tabular font-semibold text-slate-900">
                            {qtyInCart}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(product.id, qtyInCart + 1)}
                            aria-label={`Increase quantity of ${product.name}`}
                            className="p-2 text-slate-700 hover:text-slate-900 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCartOpen(true)}
                          className="px-3 py-2 text-xs font-medium text-[#087f5b] hover:bg-emerald-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          কার্ট দেখুন
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={outOfStock}
                        onClick={() => addToCart(product, 1)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#087f5b] hover:bg-[#06694b] disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{outOfStock ? 'স্টক নেই' : 'কার্টে যোগ করুন'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full overflow-hidden relative shadow-xl max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close product details"
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 text-slate-500 hover:text-slate-900 rounded-lg border border-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
              <div className="md:col-span-6 bg-slate-50 min-h-[260px]">
                <ProductImage
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="md:col-span-6 p-6 sm:p-8 flex flex-col">
                <p className="text-xs text-slate-500 mb-2">
                  {selectedProduct.manufacturer}
                </p>

                <h3
                  id="product-modal-title"
                  className="font-display text-xl font-bold text-slate-900 leading-snug"
                >
                  {selectedProduct.name}
                </h3>
                <p className="text-sm text-slate-700 mt-1 mb-4">
                  {selectedProduct.nameBn}
                </p>

                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {selectedProduct.description}
                </p>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 text-sm mb-6">
                  <div>
                    <span className="block text-xs text-slate-500">প্যাকেজিং / ইউনিট</span>
                    <span className="font-medium text-slate-900">{selectedProduct.unit}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">স্টক অবস্থা</span>
                    <span className="font-medium text-slate-900 tabular-nums">
                      {selectedProduct.stock > 0
                        ? `In Stock (${selectedProduct.stock})`
                        : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {selectedProduct.requiresPrescription && (
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
                    সতর্কতা: ব্যবহারের পূর্বে চিকিৎসকের পরামর্শ নিন।
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-4">
                  <div>
                    <span className="block text-xs text-slate-500">মূল্য</span>
                    <span className="font-mono-tabular text-2xl font-bold text-slate-900">
                      {formatBDT(selectedProduct.price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center border border-slate-200 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                        aria-label="Decrease quantity"
                        className="p-2.5 text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 text-sm font-mono-tabular font-semibold">
                        {modalQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setModalQty((q) => Math.min(100, q + 1))}
                        aria-label="Increase quantity"
                        className="p-2.5 text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={selectedProduct.stock <= 0}
                      onClick={() => {
                        addToCart(selectedProduct, modalQty);
                        setSelectedProduct(null);
                        setCartOpen(true);
                      }}
                      className="px-5 py-2.5 text-sm font-semibold text-white bg-[#087f5b] hover:bg-[#06694b] disabled:bg-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      কার্টে যোগ করুন
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
