import { useState } from 'react';
import { CAMPAIGN_IMAGE } from '../utils/store';

interface HeroProps {
  onAddTrio: () => void;
}

export function Hero({ onAddTrio }: HeroProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <section
      id="top"
      className="relative border-b border-white/10 bg-[#09090B]"
    >
      {/* Subtle crimson radial ambient light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(185,28,28,0.18),transparent_55%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Editorial copy & CTA column */}
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="mb-3 text-sm font-semibold text-[#DC2626]">
              مجموعة 10 مل المحمولة · ثمن موحد 50 درهم
            </p>

            <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#FAF7F5] sm:text-4xl lg:text-5xl [text-wrap:balance]">
              فخامة العطور الأصلية في عبوة محمولة لا تنكسر
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#A8A29E] sm:text-lg">
              استمتع بثلاثة من أشهر العطور العالمية — كريد أفنتوس، ديور أوم إنتنس، وفيرساتشي إيروس — في عبوة معدنية أنيقة بحجم 10 مل وبرائحة أصلية 100% تناسب جيبك وكل تنقلاتك.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#collection"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#B91C1C] px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B] whitespace-nowrap shrink-0"
              >
                اكتشف العطور الثلاثة
              </a>

              <button
                type="button"
                onClick={onAddTrio}
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-white/15 bg-[#141214] px-5 py-3 text-sm font-semibold text-[#FAF7F5] transition-colors duration-150 hover:border-[#DC2626]/60 hover:bg-[#1C1719] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] whitespace-nowrap shrink-0 cursor-pointer"
              >
                اطلب المجموعة كاملة — 150 درهم
              </button>
            </div>
          </div>

          {/* Campaign showcase image column */}
          <div className="lg:col-span-6">
            <div className="relative flex h-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#0B090B] p-2">
              {!imageError ? (
                <img
                  src={CAMPAIGN_IMAGE}
                  alt="تشكيلة عطور Perfume 10 بحجم 10 مل: كريد أفنتوس، ديور أوم إنتنس، وفيرساتشي إيروس"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="max-h-[480px] w-full rounded-lg object-contain object-center"
                />
              ) : (
                <div className="flex h-full min-h-[320px] w-full flex-col items-center justify-center bg-gradient-to-br from-[#1A080A] via-[#0D0B0C] to-[#141214] p-8 text-center">
                  <span className="font-latin text-2xl font-bold text-[#FAF7F5]">
                    Perfume <span className="text-[#DC2626]">10</span>
                  </span>
                  <p className="mt-2 text-sm text-[#A8A29E]">
                    كريد أفنتوس · ديور أوم إنتنس · فيرساتشي إيروس
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full-width key value strip below hero split */}
        <div className="mt-10 grid grid-cols-1 divide-y divide-white/10 rounded-xl border border-white/10 bg-[#121012] sm:grid-cols-3 sm:divide-x sm:divide-x-reverse sm:divide-y-0">
          <div className="px-6 py-4">
            <p className="text-xs font-medium text-[#A8A29E]">السعر الموحد</p>
            <p className="mt-1 text-lg font-bold text-[#FAF7F5] tabular-nums">
              50 درهم <span className="text-sm font-normal text-[#A8A29E]">للعطر الواحد</span>
            </p>
          </div>
          <div className="px-6 py-4">
            <p className="text-xs font-medium text-[#A8A29E]">الحماية والتنقل</p>
            <p className="mt-1 text-lg font-bold text-[#FAF7F5]">
              عبوة 10 مل محمولة لا تنكسر
            </p>
          </div>
          <div className="px-6 py-4">
            <p className="text-xs font-medium text-[#A8A29E]">الضمان والجودة</p>
            <p className="mt-1 text-lg font-bold text-[#FAF7F5]">
              رائحة أصلية 100% · الدفع عند الاستلام
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
