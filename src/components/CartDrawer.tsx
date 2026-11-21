import { useEffect, useState, type FormEvent } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import {
  buildWhatsAppChatUrl,
  calculateCartTotals,
  createOrderReceipt,
  getPerfumeById,
  getProductSizeText,
  validateOrderForm,
  type CartItem,
  type ConfirmedOrder,
  type OrderCustomer,
  type OrderValidationErrors,
  type Perfume,
  type StoreSettings,
} from '../utils/store';

interface CartDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  products: readonly Perfume[];
  settings: StoreSettings;
  lastOrder: ConfirmedOrder | null;
  onClose: () => void;
  onUpdateQty: (perfumeId: string, nextQty: number) => void;
  onRemoveItem: (perfumeId: string) => void;
  onAddTrio: () => void;
  onConfirmOrder: (order: ConfirmedOrder) => void;
  onClearReceipt: () => void;
}

const INITIAL_CUSTOMER: OrderCustomer = {
  fullName: '',
  phone: '',
  city: '',
  address: '',
};

function triggerWhatsAppLink(url: string) {
  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } catch {
    // Fallback link remains prominently clickable in the confirmation receipt
  }
}

export function CartDrawer({
  isOpen,
  cart,
  products,
  settings,
  lastOrder,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onAddTrio,
  onConfirmOrder,
  onClearReceipt,
}: CartDrawerProps) {
  const [customer, setCustomer] = useState<OrderCustomer>(INITIAL_CUSTOMER);
  const [errors, setErrors] = useState<OrderValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totals = calculateCartTotals(cart, products, settings.deliveryFeeMad);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = validateOrderForm(customer);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    const receipt = createOrderReceipt(
      cart,
      customer,
      products,
      settings.deliveryFeeMad,
    );

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          deliveryFeeMad: settings.deliveryFeeMad,
          items: receipt.items.map((entry) => ({
            perfumeId: entry.perfume.id,
            arabicName: entry.perfume.arabicName,
            latinName: entry.perfume.latinName,
            unitPriceMad: entry.perfume.priceMad,
            quantity: entry.quantity,
          })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.order?.orderNumber) {
          receipt.orderNumber = data.order.orderNumber;
          receipt.createdAtIso = data.order.createdAtIso;
        }
      }
    } catch {
      // Proceed cleanly with WhatsApp order flow even if offline
    } finally {
      setIsSubmitting(false);
    }

    const whatsappUrl = buildWhatsAppChatUrl(settings.whatsappNumber, receipt);
    triggerWhatsAppLink(whatsappUrl);
    onConfirmOrder(receipt);
    setCustomer(INITIAL_CUSTOMER);
  };

  const confirmedWhatsappUrl = lastOrder
    ? buildWhatsAppChatUrl(settings.whatsappNumber, lastOrder)
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="سلة التسوق وإتمام الطلب"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-md flex-col border-r border-white/10 bg-[#110F11] text-[#FAF7F5] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-[#DC2626]" aria-hidden="true" />
            <h2 className="text-lg font-bold">
              {lastOrder ? 'تم تأكيد الطلب' : 'سلة المشتريات'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق سلة التسوق"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#09090B] text-[#A8A29E] transition-colors hover:border-[#DC2626] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {lastOrder ? (
            <div data-testid="order-confirmation" className="space-y-5">
              <div className="rounded-xl border border-[#DC2626]/40 bg-[#1B0C0E] p-5">
                <div className="flex items-center gap-2.5 text-[#FAF7F5]">
                  <CheckCircle2
                    className="h-6 w-6 shrink-0 text-[#DC2626]"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-base font-bold">
                      شكراً لك، {lastOrder.customer.fullName}
                    </p>
                    <p className="text-xs text-[#A8A29E]">
                      رقم الطلب:{' '}
                      <span
                        dir="ltr"
                        className="inline-block font-latin font-semibold text-[#FAF7F5] tabular-nums"
                      >
                        #{lastOrder.orderNumber}
                      </span>
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#A8A29E]">
                  تم تجهيز ملخص طلبك لإرساله عبر واتساب للتوصيل إلى{' '}
                  {lastOrder.customer.city} ({lastOrder.customer.address}) — الدفع عند الاستلام.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#09090B] p-4">
                <h3 className="text-sm font-bold text-[#FAF7F5]">ملخص الطلب</h3>
                <ul className="mt-3 divide-y divide-white/10 text-sm">
                  {lastOrder.items.map(({ perfume, quantity, lineTotalMad }) => (
                    <li
                      key={perfume.id}
                      className="flex items-center justify-between py-2.5"
                    >
                      <span>
                        {perfume.arabicName}{' '}
                        <span className="text-xs text-[#A8A29E] tabular-nums">
                          × {quantity}
                        </span>
                      </span>
                      <span className="font-semibold tabular-nums">
                        {lineTotalMad} درهم
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 border-t border-white/10 pt-3 text-sm">
                  <div className="flex justify-between text-[#A8A29E]">
                    <span>مجموع العطور</span>
                    <span className="tabular-nums">{lastOrder.subtotalMad} درهم</span>
                  </div>
                  <div className="mt-1.5 flex justify-between text-[#A8A29E]">
                    <span>رسوم التوصيل</span>
                    <span className="tabular-nums">
                      {lastOrder.shippingMad === 0
                        ? 'مجاني'
                        : `${lastOrder.shippingMad} درهم`}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between text-base font-bold text-[#FAF7F5]">
                    <span>المجموع عند الاستلام</span>
                    <span className="text-[#DC2626] tabular-nums">
                      {lastOrder.totalMad} درهم
                    </span>
                  </div>
                </div>
              </div>

              <a
                data-testid="whatsapp-order-link"
                href={confirmedWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-[#DC2626] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#B91C1C]"
              >
                <span>إرسال الطلب عبر واتساب</span>
                <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
              </a>

              <button
                type="button"
                onClick={() => {
                  onClearReceipt();
                  onClose();
                }}
                className="inline-flex min-h-[42px] w-full items-center justify-center rounded-lg border border-white/15 bg-[#09090B] px-4 py-2.5 text-sm font-semibold text-[#FAF7F5] transition-colors hover:border-white/30 cursor-pointer"
              >
                متابعة التسوق
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-[#09090B] text-[#DC2626]">
                <ShoppingBag className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#FAF7F5]">
                سلة المشتريات فارغة
              </h3>
              <p className="mt-2 max-w-xs text-sm text-[#A8A29E]">
                اختر عطرك المفضل وأضفه للسلة لإتمام الطلب عبر واتساب والدفع عند الاستلام.
              </p>
              {products.length > 0 && (
                <button
                  type="button"
                  onClick={onAddTrio}
                  className="mt-6 inline-flex min-h-[42px] items-center justify-center rounded-lg bg-[#DC2626] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B91C1C] cursor-pointer"
                >
                  أضف الباقة المختارة للسلة
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cart items list */}
              <ul className="divide-y divide-white/10">
                {cart.map((item) => {
                  const perfume = getPerfumeById(item.perfumeId, products);
                  if (!perfume) return null;
                  return (
                    <li
                      key={perfume.id}
                      data-testid={`cart-item-${perfume.id}`}
                      className="flex items-center gap-3.5 py-4 first:pt-0"
                    >
                      {perfume.image ? (
                        <img
                          src={perfume.image}
                          alt={perfume.arabicName}
                          className="h-16 w-16 shrink-0 rounded-lg border border-white/10 bg-[#09090B] object-contain"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#09090B] text-xs font-bold text-[#DC2626]">
                          {getProductSizeText(perfume)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#FAF7F5]">
                          {perfume.arabicName}
                        </p>
                        <p className="text-xs text-[#A8A29E] tabular-nums">
                          {getProductSizeText(perfume)} · {perfume.priceMad} درهم
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          <div className="inline-flex items-center rounded border border-white/15 bg-[#09090B]">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQty(perfume.id, item.quantity - 1)
                              }
                              aria-label={`إنقاص كمية ${perfume.arabicName}`}
                              className="inline-flex h-7 w-7 items-center justify-center text-[#FAF7F5] hover:text-[#DC2626] cursor-pointer"
                            >
                              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQty(perfume.id, item.quantity + 1)
                              }
                              aria-label={`زيادة كمية ${perfume.arabicName}`}
                              className="inline-flex h-7 w-7 items-center justify-center text-[#FAF7F5] hover:text-[#DC2626] cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveItem(perfume.id)}
                            aria-label={`إزالة ${perfume.arabicName} من السلة`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded text-[#A8A29E] transition-colors hover:text-[#DC2626] cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-[#FAF7F5] tabular-nums">
                        {perfume.priceMad * item.quantity} درهم
                      </p>
                    </li>
                  );
                })}
              </ul>

              {/* Totals summary */}
              <div className="space-y-2 rounded-lg border border-white/10 bg-[#09090B] p-4 text-sm">
                <div className="flex justify-between text-[#A8A29E]">
                  <span>مجموع العطور ({totals.totalItems})</span>
                  <span data-testid="cart-subtotal" className="tabular-nums">
                    {totals.subtotalMad} درهم
                  </span>
                </div>
                <div className="flex justify-between text-[#A8A29E]">
                  <span>رسوم التوصيل</span>
                  <span data-testid="cart-delivery-fee" className="tabular-nums">
                    {totals.shippingMad === 0
                      ? 'مجاني'
                      : `${totals.shippingMad} درهم`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 text-base font-bold text-[#FAF7F5]">
                  <span>الإجمالي (الدفع عند الاستلام)</span>
                  <span data-testid="cart-total" className="text-[#DC2626] tabular-nums">
                    {totals.totalMad} درهم
                  </span>
                </div>
              </div>

              {/* COD Order Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
                <h3 className="text-sm font-bold text-[#FAF7F5]">
                  بيانات التوصيل (الدفع عند الاستلام)
                </h3>

                <div>
                  <label
                    htmlFor="order-fullname"
                    className="mb-1 block text-xs font-medium text-[#A8A29E]"
                  >
                    الاسم الكامل
                  </label>
                  <input
                    id="order-fullname"
                    type="text"
                    value={customer.fullName}
                    onChange={(e) =>
                      setCustomer((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    placeholder="مثال: أمين بنجلون"
                    className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3.5 py-2.5 text-sm text-[#FAF7F5] placeholder:text-[#71717A] focus:border-[#DC2626] focus:outline-none"
                  />
                  {errors.fullName && (
                    <p role="alert" className="mt-1 text-xs text-[#F87171]">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="order-phone"
                    className="mb-1 block text-xs font-medium text-[#A8A29E]"
                  >
                    رقم الهاتف
                  </label>
                  <input
                    id="order-phone"
                    type="tel"
                    dir="ltr"
                    value={customer.phone}
                    onChange={(e) =>
                      setCustomer((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="06 12 34 56 78"
                    className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3.5 py-2.5 text-right text-sm text-[#FAF7F5] placeholder:text-[#71717A] focus:border-[#DC2626] focus:outline-none"
                  />
                  {errors.phone && (
                    <p role="alert" className="mt-1 text-xs text-[#F87171]">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="order-city"
                    className="mb-1 block text-xs font-medium text-[#A8A29E]"
                  >
                    المدينة
                  </label>
                  <input
                    id="order-city"
                    type="text"
                    value={customer.city}
                    onChange={(e) =>
                      setCustomer((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="مثال: الدار البيضاء، الرباط، مراكش"
                    className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3.5 py-2.5 text-sm text-[#FAF7F5] placeholder:text-[#71717A] focus:border-[#DC2626] focus:outline-none"
                  />
                  {errors.city && (
                    <p role="alert" className="mt-1 text-xs text-[#F87171]">
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="order-address"
                    className="mb-1 block text-xs font-medium text-[#A8A29E]"
                  >
                    العنوان
                  </label>
                  <input
                    id="order-address"
                    type="text"
                    value={customer.address}
                    onChange={(e) =>
                      setCustomer((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="الحي، الشارع، ورقم الإقامة"
                    className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3.5 py-2.5 text-sm text-[#FAF7F5] placeholder:text-[#71717A] focus:border-[#DC2626] focus:outline-none"
                  />
                  {errors.address && (
                    <p role="alert" className="mt-1 text-xs text-[#F87171]">
                      {errors.address}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 inline-flex min-h-[46px] w-full items-center justify-center rounded-lg bg-[#DC2626] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] cursor-pointer"
                >
                  {isSubmitting
                    ? 'جاري تجهيز الطلب...'
                    : `تأكيد الطلب — ${totals.totalMad} درهم`}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
