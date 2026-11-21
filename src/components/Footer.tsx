interface FooterProps {
  onOpenOwner: () => void;
}

export function Footer({ onOpenOwner }: FooterProps) {
  return (
    <footer className="border-t border-white/10 bg-[#09090B] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6">
        <div>
          <span className="font-latin text-lg font-bold text-[#FAF7F5]">
            Perfume <span className="text-[#DC2626]">10</span>
          </span>
          <p className="mt-1 text-xs text-[#A8A29E]">
            عطور أصلية محمولة بحجم 10 مل · عبوة لا تنكسر · ثمن موحد 50 درهم
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-[#A8A29E]">
          <a href="#collection" className="hover:text-[#FAF7F5] transition-colors">
            العطور المتوفرة
          </a>
          <a href="#notes-guide" className="hover:text-[#FAF7F5] transition-colors">
            النوتات العطرية
          </a>
          <a href="#craftsmanship" className="hover:text-[#FAF7F5] transition-colors">
            ضمان الجودة
          </a>
          <button
            type="button"
            onClick={onOpenOwner}
            className="text-[#DC2626] font-semibold hover:text-[#FAF7F5] transition-colors cursor-pointer"
          >
            فضاء صاحب المحل
          </button>
          <span className="text-[#71717A]">
            © {new Date().getFullYear()} Perfume 10
          </span>
        </div>
      </div>
    </footer>
  );
}
