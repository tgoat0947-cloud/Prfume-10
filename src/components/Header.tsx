import { ShoppingBag } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenOwner: () => void;
}

export function Header({ cartCount, onOpenCart, onOpenOwner }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#09090B]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        {/* Zone 1: Single-element brand wordmark */}
        <a
          href="#top"
          className="font-latin text-xl font-bold tracking-tight text-[#FAF7F5] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] rounded"
        >
          Perfume <span className="text-[#DC2626]">10</span>
        </a>

        {/* Zone 2: Concise single-line nav links */}
        <nav
          aria-label="التنقل الرئيسي"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#A8A29E]"
        >
          <a
            href="#collection"
            className="hover:text-[#FAF7F5] transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            العطور
          </a>
          <a
            href="#notes-guide"
            className="hover:text-[#FAF7F5] transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            النوتات العطرية
          </a>
          <a
            href="#craftsmanship"
            className="hover:text-[#FAF7F5] transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            لماذا 10 مل
          </a>
          <button
            type="button"
            onClick={onOpenOwner}
            className="hover:text-[#FAF7F5] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            إدارة المحل
          </button>
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenOwner}
            className="md:hidden inline-flex items-center rounded-lg border border-white/15 bg-[#141214] px-3 py-2 text-xs font-semibold text-[#A8A29E] transition-colors hover:border-[#DC2626] hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            الإدارة
          </button>
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`فتح سلة التسوق (${cartCount} منتجات)`}
            className="inline-flex items-center gap-2.5 rounded-lg bg-[#B91C1C] px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>السلة</span>
            <span
              data-testid="cart-count"
              className="tabular-nums rounded bg-black/30 px-1.5 py-0.5 text-xs font-bold leading-none"
            >
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
