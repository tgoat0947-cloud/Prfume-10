import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PerfumeCard } from './components/PerfumeCard';
import { PerfumeModal } from './components/PerfumeModal';
import { WhySection } from './components/WhySection';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import {
  PERFUMES,
  addDiscoveryTrio,
  addToCart,
  calculateCartTotals,
  removeFromCart,
  updateCartQuantity,
  type CartItem,
  type ConfirmedOrder,
  type Perfume,
} from './utils/store';

const CART_STORAGE_KEY = 'perfume10_cart_v1';
const ORDER_STORAGE_KEY = 'perfume10_last_order_v1';

function loadSavedCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        item &&
        typeof item.perfumeId === 'string' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0,
    );
  } catch {
    return [];
  }
}

export default function App() {
  const [cart, setCart] = useState<CartItem[]>(loadSavedCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activePerfume, setActivePerfume] = useState<Perfume | null>(null);
  const [lastOrder, setLastOrder] = useState<ConfirmedOrder | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota errors
    }
  }, [cart]);

  const totals = calculateCartTotals(cart);

  const handleAddToCart = (perfumeId: Perfume['id'], quantity = 1) => {
    setLastOrder(null);
    setCart((prev) => addToCart(prev, perfumeId, quantity));
  };

  const handleAddTrio = () => {
    setLastOrder(null);
    setCart((prev) => addDiscoveryTrio(prev));
    setIsCartOpen(true);
  };

  const handleUpdateQty = (perfumeId: Perfume['id'], nextQty: number) => {
    setCart((prev) => updateCartQuantity(prev, perfumeId, nextQty));
  };

  const handleRemoveItem = (perfumeId: Perfume['id']) => {
    setCart((prev) => removeFromCart(prev, perfumeId));
  };

  const handleConfirmOrder = (order: ConfirmedOrder) => {
    setLastOrder(order);
    setCart([]);
    try {
      window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
    } catch {
      // Ignore storage quota errors
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAF7F5]">
      <Header
        cartCount={totals.totalItems}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main>
        <Hero onAddTrio={handleAddTrio} />

        {/* Section 2: Featured 3-Perfume Collection */}
        <section id="collection" className="bg-[#09090B] py-14 lg:py-18">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold text-[#DC2626]">
                  التشكيلة المتوفرة حالياً
                </p>
                <h2 className="mt-1 text-2xl font-bold text-[#FAF7F5] sm:text-3xl [text-wrap:balance]">
                  ثلاثة عطور عالمية بسعر 50 درهم للعطر
                </h2>
              </div>
              <p className="text-sm text-[#A8A29E]">
                جميع العبوات بحجم 10 مل · هيكل مقاوم للكسر · رائحة أصلية
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
              {PERFUMES.map((perfume) => (
                <PerfumeCard
                  key={perfume.id}
                  perfume={perfume}
                  onAddToCart={(id) => handleAddToCart(id, 1)}
                  onInspect={(p) => setActivePerfume(p)}
                />
              ))}
            </div>
          </div>
        </section>

        <WhySection
          onSelectPerfume={(p) => setActivePerfume(p)}
          onAddTrio={handleAddTrio}
        />
      </main>

      <Footer />

      <PerfumeModal
        perfume={activePerfume}
        onClose={() => setActivePerfume(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        lastOrder={lastOrder}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onAddTrio={handleAddTrio}
        onConfirmOrder={handleConfirmOrder}
        onClearReceipt={() => setLastOrder(null)}
      />
    </div>
  );
}
