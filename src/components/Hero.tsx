import { HERO_IMAGE_URL } from '../types';
import { ProductImage } from './ProductImage';

export function Hero() {
  return (
    <section className="bg-white border-y border-slate-200">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 lg:py-10">
        <div className="h-64 sm:h-80 lg:h-96 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
          <ProductImage
            src={HERO_IMAGE_URL}
            alt="Clinical pharmacy counter with sterile surgical tray, medical bottles, and stethoscope"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
