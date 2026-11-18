import { PERFUMES, type Perfume } from '../utils/store';

interface WhySectionProps {
  onSelectPerfume: (perfume: Perfume) => void;
  onAddTrio: () => void;
}

export function WhySection({ onSelectPerfume, onAddTrio }: WhySectionProps) {
  return (
    <>
      {/* Section 3: Craftsmanship & Notes Comparison Guide */}
      <section
        id="notes-guide"
        className="border-t border-white/10 bg-[#0D0B0C] py-14 lg:py-18"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-[#DC2626]">
                دليل الروائح السريع
              </p>
              <h2 className="mt-1 text-2xl font-bold text-[#FAF7F5] sm:text-3xl [text-wrap:balance]">
                اختر العطر المناسب لذوقك ووقتك
              </h2>
            </div>
            <p className="max-w-md text-sm text-[#A8A29E]">
              مقارنة واضحة بين النوتات الأساسية، الطابع العطري، وأفضل أوقات الاستخدام لكل عطر من مجموعتنا.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-xl border border-white/10 bg-[#141214]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-right text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-[#09090B] text-xs font-semibold text-[#A8A29E]">
                    <th className="px-5 py-3.5">العطر</th>
                    <th className="px-5 py-3.5">الافتتاحية</th>
                    <th className="px-5 py-3.5">القلب والقاعدة</th>
                    <th className="px-5 py-3.5">أفضل وقت</th>
                    <th className="px-5 py-3.5">الثمن</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {PERFUMES.map((perfume) => (
                    <tr
                      key={perfume.id}
                      className="transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSelectPerfume(perfume)}
                          className="text-right font-bold text-[#FAF7F5] hover:text-[#DC2626] transition-colors cursor-pointer"
                        >
                          {perfume.arabicName}
                          <span className="mt-0.5 block font-latin text-xs font-normal text-[#A8A29E]">
                            {perfume.latinName}
                          </span>
                        </button>
                      </td>
                      <td className="px-5 py-4 text-[#A8A29E]">
                        {perfume.notes.top.join(' · ')}
                      </td>
                      <td className="px-5 py-4 text-[#A8A29E]">
                        {[...perfume.notes.heart.slice(0, 2), ...perfume.notes.base.slice(0, 2)].join(' · ')}
                      </td>
                      <td className="px-5 py-4 text-[#FAF7F5]">
                        {perfume.occasion}
                      </td>
                      <td className="px-5 py-4 font-bold text-[#DC2626] tabular-nums whitespace-nowrap">
                        {perfume.priceMad} درهم
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Why 10ml Portable Atomizer */}
      <section
        id="craftsmanship"
        className="border-t border-white/10 bg-[#09090B] py-14 lg:py-18"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="text-sm font-semibold text-[#DC2626]">
                لماذا Perfume 10
              </p>
              <h2 className="mt-1 text-2xl font-bold text-[#FAF7F5] sm:text-3xl [text-wrap:balance]">
                عبوة ذكية تجمع بين المتانة والرائحة الأصلية
              </h2>
            </div>
            <div className="lg:col-span-5 lg:text-left">
              <button
                type="button"
                onClick={onAddTrio}
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#B91C1C] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] whitespace-nowrap cursor-pointer"
              >
                أضف الثلاثية كاملة (توصيل مجاني)
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-[#141214] p-6">
              <h3 className="text-base font-bold text-[#FAF7F5]">
                01. عبوة محمولة لا تنكسر
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#A8A29E]">
                غلاف معدني أحمر مقوى يحمي العطر من الصدمات والسقوط، بحجم مدمج يناسب الجيب، الحقيبة، والسيارة دون خوف من الكسر.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#141214] p-6">
              <h3 className="text-base font-bold text-[#FAF7F5]">
                02. رائحة أصلية 100%
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#A8A29E]">
                تعبئة دقيقة ومباشرة من العطور الأصلية تمنحك نفس النوتات العطرية والثبات العالي طوال اليوم مع بخاخ ناعم متوازن.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#141214] p-6">
              <h3 className="text-base font-bold text-[#FAF7F5]">
                03. 10 مل تكفي طويلاً
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#A8A29E]">
                كل عبوة 10 مل توفر قرابة 150 رشة، بسعر موحد 50 درهم فقط — لتستمتع بأشهر العطور العالمية أو تجمع الثلاثة معاً بـ 150 درهم.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
