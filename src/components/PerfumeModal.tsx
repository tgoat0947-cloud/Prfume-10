import { useEffect, useState } from 'react';
import { Minus, Plus, ShieldCheck, ShoppingBag, Sparkles, X } from 'lucide-react';
import type { Perfume } from '../utils/store';

interface PerfumeModalProps {
  perfume: Perfume | null;
  onClose: () => void;
  onAddToCart: (perfumeId: Perfume['id'], quantity: number) => void;
}

export function PerfumeModal({
  perfume,
  onClose,
  onAddToCart,
}: PerfumeModalProps) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [perfume?.id]);

  useEffect(() => {
    if (!perfume) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [perfume, onClose]);

  if (!perfume) return null;

  const handleConfirmAdd = () => {
    onAddToCart(perfume.id, quantity);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-perfume-title"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-white/15 bg-[#121012] text-[#FAF7F5] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-[#09090B] px-6 py-3.5">
          <span className="text-xs font-semibold text-[#DC2626]">
            {perfume.family} · 10 مل · قرابة {perfume.spraysEstimate} رشة
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة تفاصيل العطر"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#121012] text-[#FAF7F5] transition-colors hover:border-[#DC2626] hover:text-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Product image */}
          <div className="flex items-center justify-center border-b border-white/10 bg-[#09090B] p-4 md:col-span-5 md:border-b-0 md:border-l">
            <img
              src={perfume.image}
              alt={`${perfume.arabicName} (${perfume.latinName})`}
              referrerPolicy="no-referrer"
              className="max-h-[340px] w-full rounded-lg object-contain"
            />
          </div>

          {/* Product details & olfactory pyramid */}
          <div className="flex flex-col p-6 md:col-span-7">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <h2
                  id="modal-perfume-title"
                  className="text-2xl font-bold text-[#FAF7F5]"
                >
                  {perfume.arabicName}
                </h2>
                <p className="font-latin text-sm text-[#A8A29E]">
                  {perfume.latinName}
                </p>
              </div>
              <p className="shrink-0 text-2xl font-bold text-[#FAF7F5] tabular-nums">
                {perfume.priceMad} <span className="text-sm font-normal text-[#A8A29E]">درهم</span>
              </p>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#A8A29E]">
              {perfume.description}
            </p>

            {/* Full 3-tier olfactory pyramid */}
            <div className="mt-5 space-y-3 rounded-lg border border-white/10 bg-[#09090B] p-4">
              <h3 className="text-sm font-bold text-[#FAF7F5]">
                الهرم العطري الكامل
              </h3>
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="font-semibold text-[#DC2626]">
                    افتتاحية العطر (Top Notes):{' '}
                  </span>
                  <span className="text-[#FAF7F5]">
                    {perfume.notes.top.join(' · ')}
                  </span>
                </div>
                <div className="border-t border-white/10 pt-2">
                  <span className="font-semibold text-[#DC2626]">
                    قلب العطر (Heart Notes):{' '}
                  </span>
                  <span className="text-[#FAF7F5]">
                    {perfume.notes.heart.join(' · ')}
                  </span>
                </div>
                <div className="border-t border-white/10 pt-2">
                  <span className="font-semibold text-[#DC2626]">
                    قاعدة العطر (Base Notes):{' '}
                  </span>
                  <span className="text-[#FAF7F5]">
                    {perfume.notes.base.join(' · ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottle guarantees */}
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#A8A29E]">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#DC2626]" aria-hidden="true" />
                عبوة محمولة لا تنكسر
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#DC2626]" aria-hidden="true" />
                {perfume.longevity}
              </span>
            </div>

            {/* Quantity & Add CTA */}
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
              <div className="inline-flex items-center rounded-lg border border-white/15 bg-[#09090B]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="إنقاص الكمية"
                  className="inline-flex h-10 w-10 items-center justify-center text-[#FAF7F5] hover:text-[#DC2626] cursor-pointer"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <span className="w-8 text-center text-sm font-bold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                  aria-label="زيادة الكمية"
                  className="inline-flex h-10 w-10 items-center justify-center text-[#FAF7F5] hover:text-[#DC2626] cursor-pointer"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleConfirmAdd}
                className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-lg bg-[#B91C1C] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] whitespace-nowrap cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="tabular-nums">
                  أضف إلى السلة — {quantity * perfume.priceMad} درهم
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
