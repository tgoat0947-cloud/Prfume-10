import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PerfumeCard } from './components/PerfumeCard';
import { PerfumeModal } from './components/PerfumeModal';
import { WhySection } from './components/WhySection';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { AdminModal } from './components/AdminModal';
import {
  addDiscoveryTrio,
  addToCart,
  calculateCartTotals,
  loadStoredProducts,
  loadStoredSettings,
  removeFromCart,
  resetStoredCatalogAndSettings,
  saveStoredProducts,
  saveStoredSettings,
  updateCartQuantity,
  type CartItem,
  type ConfirmedOrder,
  type Perfume,
  type StoreSettings,
} from './utils/store';

const CART_STORAGE_KEY = 'perfume10_cart_v1';
const ORDER_STORAGE_KEY = 'perfume10_last_order_v1';
const OWNER_TOKEN_STORAGE_KEY = 'perfume10_owner_token_v1';
const ADMIN_AUTH_STORAGE_KEY = 'perfume10_admin_auth_v1';

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

function loadSavedOwnerToken(): string | null {
  try {
    return window.sessionStorage.getItem(OWNER_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function loadSavedAdminAuth(): boolean {
  try {
    return window.sessionStorage.getItem(ADMIN_AUTH_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export default function App() {
  const [products, setProducts] = useState<Perfume[]>(loadStoredProducts);
  const [settings, setSettings] = useState<StoreSettings>(loadStoredSettings);
  const [cart, setCart] = useState<CartItem[]>(loadSavedCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] =
    useState<boolean>(loadSavedAdminAuth);
  const [ownerToken, setOwnerToken] = useState<string | null>(loadSavedOwnerToken);
  const [activePerfume, setActivePerfume] = useState<Perfume | null>(null);
  const [lastOrder, setLastOrder] = useState<ConfirmedOrder | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    if (!ownerToken) return;
    fetch('/api/owner/session', {
      headers: { Authorization: `Bearer ${ownerToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.authenticated) {
          setOwnerToken(null);
          window.sessionStorage.removeItem(OWNER_TOKEN_STORAGE_KEY);
        }
      })
      .catch(() => {
        // Ignore transient offline error
      });
  }, [ownerToken]);

  const totals = calculateCartTotals(cart, products, settings.deliveryFeeMad);

  const handleAddToCart = (perfumeId: string, quantity = 1) => {
    setLastOrder(null);
    setCart((prev) => addToCart(prev, perfumeId, quantity));
  };

  const handleAddTrio = () => {
    setLastOrder(null);
    setCart((prev) => addDiscoveryTrio(prev, products));
    setIsCartOpen(true);
  };

  const handleUpdateQty = (perfumeId: string, nextQty: number) => {
    setCart((prev) => updateCartQuantity(prev, perfumeId, nextQty));
  };

  const handleRemoveItem = (perfumeId: string) => {
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

  const handleSaveProducts = (nextProducts: Perfume[]) => {
    setProducts(nextProducts);
    saveStoredProducts(nextProducts);
    // Prune cart items referencing deleted products
    const validIds = new Set(nextProducts.map((p) => p.id));
    setCart((prev) => prev.filter((item) => validIds.has(item.perfumeId)));
  };

  const handleSaveSettings = (nextSettings: StoreSettings) => {
    setSettings(nextSettings);
    saveStoredSettings(nextSettings);
  };

  const handleResetDefaults = () => {
    const defaults = resetStoredCatalogAndSettings();
    setProducts(defaults.products);
    setSettings(defaults.settings);
  };

  const handleAdminAuthenticated = (token: string | null) => {
    setIsAdminAuthenticated(true);
    setOwnerToken(token);
    try {
      window.sessionStorage.setItem(ADMIN_AUTH_STORAGE_KEY, '1');
      if (token) {
        window.sessionStorage.setItem(OWNER_TOKEN_STORAGE_KEY, token);
      }
    } catch {
      // Ignore storage errors
    }
  };

  const handleAdminLogout = async () => {
    if (ownerToken) {
      try {
        await fetch('/api/owner/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${ownerToken}` },
        });
      } catch {
        // Ignore network errors
      }
    }
    setIsAdminAuthenticated(false);
    setOwnerToken(null);
    try {
      window.sessionStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
      window.sessionStorage.removeItem(OWNER_TOKEN_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAF7F5]">
      <Header
        cartCount={totals.totalItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOwner={() => setIsAdminOpen(true)}
      />

      <main>
        <Hero
          products={products}
          deliveryFeeMad={settings.deliveryFeeMad}
          onAddTrio={handleAddTrio}
        />

        {/* Section 2: Featured Collection */}
        <section id="collection" className="bg-[#09090B] py-14 lg:py-18">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold text-[#DC2626]">
                  التشكيلة المتوفرة حالياً
                </p>
                <h2 className="mt-1 text-2xl font-bold text-[#FAF7F5] sm:text-3xl [text-wrap:balance]">
                  عطورنا العالمية المختارة
                </h2>
              </div>
              <p className="text-sm text-[#A8A29E]">
                عبوات محمولة لا تنكسر · رائحة أصلية · التوصيل بـ{' '}
                <span className="tabular-nums font-semibold text-[#FAF7F5]">
                  {settings.deliveryFeeMad === 0
                    ? 'المجان'
                    : `${settings.deliveryFeeMad} درهم`}
                </span>
              </p>
            </div>

            {products.length === 0 ? (
              <div className="mt-8 rounded-xl border border-white/10 bg-[#141214] p-10 text-center text-sm text-[#A8A29E]">
                لا توجد عطور معروضة حالياً.
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
                {products.map((perfume) => (
                  <PerfumeCard
                    key={perfume.id}
                    perfume={perfume}
                    onAddToCart={(id) => handleAddToCart(id, 1)}
                    onInspect={(p) => setActivePerfume(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <WhySection
          products={products}
          onSelectPerfume={(p) => setActivePerfume(p)}
          onAddTrio={handleAddTrio}
        />
      </main>

      <Footer onOpenOwner={() => setIsAdminOpen(true)} />

      <PerfumeModal
        perfume={activePerfume}
        onClose={() => setActivePerfume(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        products={products}
        settings={settings}
        lastOrder={lastOrder}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onAddTrio={handleAddTrio}
        onConfirmOrder={handleConfirmOrder}
        onClearReceipt={() => setLastOrder(null)}
      />

      <AdminModal
        isOpen={isAdminOpen}
        isAuthenticated={isAdminAuthenticated}
        ownerToken={ownerToken}
        products={products}
        settings={settings}
        onClose={() => setIsAdminOpen(false)}
        onAuthenticated={handleAdminAuthenticated}
        onLogout={handleAdminLogout}
        onSaveProducts={handleSaveProducts}
        onSaveSettings={handleSaveSettings}
        onResetDefaults={handleResetDefaults}
      />
    </div>
  );
}
