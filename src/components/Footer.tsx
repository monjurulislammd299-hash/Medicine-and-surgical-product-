export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 flex items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/company_logo_db9cd45e.png"
            alt="Medicine & Surgical Products"
            className="h-10 w-10 object-contain rounded-md bg-white border border-slate-200 shrink-0"
          />
          <div>
            <p className="font-display font-semibold text-slate-900 text-sm">
              Medicine &amp; Surgical Products
            </p>
            <p className="mt-0.5">
              বাংলাদেশে নির্ভরযোগ্য অনলাইন স্বাস্থ্যপণ্য ও সার্জিক্যাল সামগ্রী।
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
