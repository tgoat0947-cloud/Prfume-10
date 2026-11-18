import { useState } from 'react';
import { Check, Eye, Plus } from 'lucide-react';
import type { Perfume } from '../utils/store';

interface PerfumeCardProps {
  perfume: Perfume;
  onAddToCart: (perfumeId: Perfume['id']) => void;
  onInspect: (perfume: Perfume) => void;
}

export function PerfumeCard({
  perfume,
  onAddToCart,
  onInspect,
}: PerfumeCardProps) {
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = () => {
    onAddToCart(perfume.id);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article
      data-testid={`perfume-card-${perfume.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#141214] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#B91C1C]/50"
    >
      {/* Uniform 4:3 image container */}
      <button
        type="button"
        onClick={() => onInspect(perfume)}
        aria-label={`عرض تفاصيل ونوتات ${perfume.arabicName}`}
        className="relative aspect-[4/3] w-full overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_center,rgba(185,28,28,0.14),#09090B_78%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#DC2626] cursor-pointer"
      >
        {!imageError ? (
          <img
            src={perfume.image}
            alt={`${perfume.arabicName} (${perfume.latinName}) - 10 مل`}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-[#1F090C] to-[#09090B] p-6 text-center">
            <span className="font-latin text-lg font-semibold text-[#FAF7F5]">
              {perfume.latinName}
            </span>
            <span className="mt-1 text-xs text-[#A8A29E]">10 مل</span>
          </div>
        )}
      </button>

      {/* Card content */}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3 text-xs text-[#A8A29E]">
          <span>{perfume.family}</span>
          <span className="tabular-nums whitespace-nowrap">
            {perfume.volumeMl} مل · قرابة {perfume.spraysEstimate} رشة
          </span>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#FAF7F5]">
              {perfume.arabicName}
            </h3>
            <p className="font-latin text-xs font-medium tracking-wide text-[#A8A29E]">
              {perfume.latinName}
            </p>
          </div>
          <p className="shrink-0 text-lg font-bold text-[#DC2626] tabular-nums">
            {perfume.priceMad} درهم
          </p>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-[#A8A29E]">
          {perfume.tagline}
        </p>

        {/* Olfactory notes directly visible */}
        <dl className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs">
          <div className="flex items-baseline gap-2">
            <dt className="w-16 shrink-0 font-semibold text-[#FAF7F5]">
              الافتتاحية:
            </dt>
            <dd className="text-[#A8A29E]">{perfume.notes.top.join(' · ')}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="w-16 shrink-0 font-semibold text-[#FAF7F5]">
              القلب:
            </dt>
            <dd className="text-[#A8A29E]">{perfume.notes.heart.join(' · ')}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="w-16 shrink-0 font-semibold text-[#FAF7F5]">
              القاعدة:
            </dt>
            <dd className="text-[#A8A29E]">{perfume.notes.base.join(' · ')}</dd>
          </div>
        </dl>

        {/* Actions aligned uniformly at bottom */}
        <div className="mt-auto flex flex-col gap-2.5 pt-6 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label={`أضف ${perfume.arabicName} إلى السلة`}
            className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-lg bg-[#B91C1C] px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] whitespace-nowrap cursor-pointer"
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>تمت الإضافة</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>أضف إلى السلة</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onInspect(perfume)}
            aria-label={`عرض الهرم العطري لـ ${perfume.arabicName}`}
            className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-transparent px-3.5 py-2 text-xs font-semibold text-[#FAF7F5] transition-colors duration-150 hover:border-white/30 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>النوتات</span>
          </button>
        </div>
      </div>
    </article>
  );
}
