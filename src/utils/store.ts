export interface FragranceNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Perfume {
  id: string;
  arabicName: string;
  latinName: string;
  family: string;
  tagline: string;
  description: string;
  priceMad: number;
  volumeMl: number;
  sizeLabel?: string;
  spraysEstimate: number;
  longevity: string;
  occasion: string;
  image: string;
  notes: FragranceNotes;
}

export interface StoreSettings {
  whatsappNumber: string;
  deliveryFeeMad: number;
}

export interface CartItem {
  perfumeId: string;
  quantity: number;
}

export interface OrderCustomer {
  fullName: string;
  phone: string;
  city: string;
  address: string;
}

export interface OrderValidationErrors {
  fullName?: string;
  phone?: string;
  city?: string;
  address?: string;
}

export interface ConfirmedOrder {
  orderNumber: string;
  createdAtIso: string;
  customer: OrderCustomer;
  items: Array<{
    perfume: Perfume;
    quantity: number;
    lineTotalMad: number;
  }>;
  subtotalMad: number;
  shippingMad: number;
  totalMad: number;
}

export const UNIT_PRICE_MAD = 50;
export const DEFAULT_DELIVERY_FEE_MAD = 20;
export const DEFAULT_WHATSAPP_NUMBER = '212771587686';

export const ADMIN_USERNAME = 'abdejalil';
export const ADMIN_PASSWORD = 'gokugoku';

export const PRODUCTS_STORAGE_KEY = 'perfume10_products_v1';
export const SETTINGS_STORAGE_KEY = 'perfume10_settings_v1';
export const AVENTUS_RESTORE_MARKER_KEY = 'perfume10_aventus_restored_v1';

export const DEFAULT_SETTINGS: StoreSettings = {
  whatsappNumber: DEFAULT_WHATSAPP_NUMBER,
  deliveryFeeMad: DEFAULT_DELIVERY_FEE_MAD,
};

export const CAMPAIGN_IMAGE =
  '/assets/aistudio/2b4dd090-55f2-4e7d-a1d8-9605ee4e8542_7e7e3867.png';

export const DEFAULT_PERFUMES: readonly Perfume[] = [
  {
    id: 'creed-aventus',
    arabicName: 'كريد أفنتوس',
    latinName: 'Creed Aventus',
    family: 'تشيبر فاكهي مدخن',
    tagline: 'القوة والنجاح والأناقة في كل رشة',
    description:
      'أيقونة العطور الرجالية الفاخرة. يفتتح بنفحات الأناناس والبرغموت المنعشة، ويتعمق بقلب من خشب البتولا المدخن قبل أن يستقر على قاعدة فخمة من المسك والعنبر.',
    priceMad: UNIT_PRICE_MAD,
    volumeMl: 10,
    sizeLabel: '10 مل',
    spraysEstimate: 150,
    longevity: 'ثبات حتى 10 ساعات · فوحان قوي',
    occasion: 'العمل · المناسبات · الاستخدام اليومي',
    image: '/assets/perfumes/aventus-card.png',
    notes: {
      top: ['الأناناس', 'البرغموت', 'الكشمش الأسود', 'التفاح'],
      heart: ['خشب البتولا المدخن', 'الباتشولي', 'الياسمين المغربي', 'الورد'],
      base: ['المسك', 'طحلب البلوط', 'العنبر', 'الفانيليا'],
    },
  },
  {
    id: 'dior-homme-intense',
    arabicName: 'ديور أوم إنتنس',
    latinName: 'Dior Homme Intense',
    family: 'خشبي زهري مسكي',
    tagline: 'عمق حسي وأناقة مسائية لا تُنسى',
    description:
      'عطر مسائي راقٍ يجمع بين نعومة الخزامى وفخامة زهرة السوسن المخملية، مع قاعدة خشبية دافئة من الأرز الفيرجيني ونجيل الهند تمنحك حضوراً واثقاً.',
    priceMad: UNIT_PRICE_MAD,
    volumeMl: 10,
    sizeLabel: '10 مل',
    spraysEstimate: 150,
    longevity: 'ثبات حتى 12 ساعة · فوحان دافئ',
    occasion: 'السهرات · المناسبات الخاصة · الخريف والشتاء',
    image: '/assets/perfumes/dior-homme-intense.png',
    notes: {
      top: ['الخزامى (اللافندر)'],
      heart: ['زهرة السوسن (الأيريس)', 'الأمبريت', 'الكمثرى'],
      base: ['خشب الأرز الفيرجيني', 'نجيل الهند', 'العنبر الدافئ'],
    },
  },
  {
    id: 'versace-eros',
    arabicName: 'فيرساتشي إيروس',
    latinName: 'Versace Eros',
    family: 'أروماتيك فوجير منعش',
    tagline: 'انتعاش جريء وشغف يدوم طوال اليوم',
    description:
      'مزيج متفجر من الانتعاش والجاذبية، يبدأ بانتعاش النعناع والليمون الإيطالي والتفاح الأخضر، وينساب نحو دفء التونكا وفانيليا مدغشقر الفاخرة.',
    priceMad: UNIT_PRICE_MAD,
    volumeMl: 10,
    sizeLabel: '10 مل',
    spraysEstimate: 150,
    longevity: 'ثبات حتى 10 ساعات · فوحان جذاب',
    occasion: 'اللقاءات المسائية · الخرجات · جميع الفصول',
    image: '/assets/perfumes/versace-eros.png',
    notes: {
      top: ['النعناع', 'التفاح الأخضر', 'الليمون الإيطالي'],
      heart: ['حبوب التونكا', 'الأمبروكسان', 'إبرة الراعي'],
      base: ['فانيليا مدغشقر', 'خشب الأرز', 'نجيل الهند', 'طحلب البلوط'],
    },
  },
];

// Backward-compatible alias
export const PERFUMES = DEFAULT_PERFUMES;

export function getPerfumeById(
  id: string,
  products: readonly Perfume[] = DEFAULT_PERFUMES,
): Perfume | undefined {
  return products.find((p) => p.id === id);
}

export function getProductSizeText(perfume: Perfume): string {
  return perfume.sizeLabel?.trim() || `${perfume.volumeMl} مل`;
}

export function addToCart(
  cart: readonly CartItem[],
  perfumeId: string,
  quantity = 1,
): CartItem[] {
  const safeQty = Math.max(1, Math.floor(quantity));
  const existing = cart.find((item) => item.perfumeId === perfumeId);
  if (existing) {
    return cart.map((item) =>
      item.perfumeId === perfumeId
        ? { ...item, quantity: Math.min(20, item.quantity + safeQty) }
        : item,
    );
  }
  return [...cart, { perfumeId, quantity: Math.min(20, safeQty) }];
}

export function addDiscoveryTrio(
  cart: readonly CartItem[],
  products: readonly Perfume[] = DEFAULT_PERFUMES,
): CartItem[] {
  let next = [...cart];
  for (const perfume of products.slice(0, 3)) {
    next = addToCart(next, perfume.id, 1);
  }
  return next;
}

export function updateCartQuantity(
  cart: readonly CartItem[],
  perfumeId: string,
  nextQuantity: number,
): CartItem[] {
  if (nextQuantity <= 0) {
    return cart.filter((item) => item.perfumeId !== perfumeId);
  }
  return cart.map((item) =>
    item.perfumeId === perfumeId
      ? { ...item, quantity: Math.min(20, Math.floor(nextQuantity)) }
      : item,
  );
}

export function removeFromCart(
  cart: readonly CartItem[],
  perfumeId: string,
): CartItem[] {
  return cart.filter((item) => item.perfumeId !== perfumeId);
}

export function calculateCartTotals(
  cart: readonly CartItem[],
  products: readonly Perfume[] = DEFAULT_PERFUMES,
  deliveryFeeMad = DEFAULT_DELIVERY_FEE_MAD,
): {
  totalItems: number;
  subtotalMad: number;
  shippingMad: number;
  totalMad: number;
} {
  let totalItems = 0;
  let subtotalMad = 0;

  for (const item of cart) {
    const perfume = getPerfumeById(item.perfumeId, products);
    if (!perfume || item.quantity <= 0) continue;
    totalItems += item.quantity;
    subtotalMad += perfume.priceMad * item.quantity;
  }

  const safeDelivery = Math.max(0, Number(deliveryFeeMad) || 0);
  const shippingMad = totalItems === 0 ? 0 : safeDelivery;

  return {
    totalItems,
    subtotalMad,
    shippingMad,
    totalMad: subtotalMad + shippingMad,
  };
}

export function validateOrderForm(customer: OrderCustomer): {
  isValid: boolean;
  errors: OrderValidationErrors;
} {
  const errors: OrderValidationErrors = {};

  if (customer.fullName.trim().length < 3) {
    errors.fullName = 'يرجى إدخال الاسم الكامل (3 أحرف على الأقل)';
  }

  const normalizedPhone = customer.phone.replace(/[\s\-().]/g, '');
  if (!/^(\+?\d{9,15}|0[5-7]\d{8})$/.test(normalizedPhone)) {
    errors.phone = 'يرجى إدخال رقم هاتف صحيح للتواصل عند التوصيل';
  }

  if (customer.city.trim().length < 2) {
    errors.city = 'يرجى تحديد المدينة';
  }

  if (customer.address.trim().length < 5) {
    errors.address = 'يرجى إدخال عنوان التوصيل بشكل واضح';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function createOrderReceipt(
  cart: readonly CartItem[],
  customer: OrderCustomer,
  products: readonly Perfume[] = DEFAULT_PERFUMES,
  deliveryFeeMad = DEFAULT_DELIVERY_FEE_MAD,
  orderSeed = Math.floor(1000 + Math.random() * 9000),
): ConfirmedOrder {
  const totals = calculateCartTotals(cart, products, deliveryFeeMad);
  const items = cart
    .map((item) => {
      const perfume = getPerfumeById(item.perfumeId, products);
      if (!perfume || item.quantity <= 0) return null;
      return {
        perfume,
        quantity: item.quantity,
        lineTotalMad: perfume.priceMad * item.quantity,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return {
    orderNumber: `P10-${orderSeed}`,
    createdAtIso: new Date().toISOString(),
    customer: {
      fullName: customer.fullName.trim(),
      phone: customer.phone.trim(),
      city: customer.city.trim(),
      address: customer.address.trim(),
    },
    items,
    subtotalMad: totals.subtotalMad,
    shippingMad: totals.shippingMad,
    totalMad: totals.totalMad,
  };
}

export function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) {
    return digits.slice(2);
  }
  if (digits.length === 10 && digits.startsWith('0')) {
    return `212${digits.slice(1)}`;
  }
  return digits;
}

export function isValidWhatsAppNumber(raw: string): boolean {
  const normalized = normalizeWhatsAppNumber(raw);
  return /^\d{9,15}$/.test(normalized);
}

export function buildWhatsAppOrderMessage(order: ConfirmedOrder): string {
  const itemLines = order.items
    .map(
      ({ perfume, quantity, lineTotalMad }) =>
        `• ${perfume.arabicName} (${getProductSizeText(perfume)}) × ${quantity} — ${lineTotalMad} درهم`,
    )
    .join('\n');

  const deliveryLine =
    order.shippingMad === 0 ? 'مجاني' : `${order.shippingMad} درهم`;

  return [
    `*طلب جديد — Perfume 10*`,
    `رقم الطلب: #${order.orderNumber}`,
    ``,
    `*بيانات الزبون:*`,
    `• الاسم الكامل: ${order.customer.fullName}`,
    `• رقم الهاتف: ${order.customer.phone}`,
    `• المدينة: ${order.customer.city}`,
    `• العنوان: ${order.customer.address}`,
    ``,
    `*المنتجات المطلوبة:*`,
    itemLines,
    ``,
    `*ملخص الدفع عند الاستلام:*`,
    `• مجموع المنتجات: ${order.subtotalMad} درهم`,
    `• رسوم التوصيل: ${deliveryLine}`,
    `• المجموع الإجمالي: ${order.totalMad} درهم`,
  ].join('\n');
}

export function buildWhatsAppChatUrl(
  whatsappNumber: string,
  order: ConfirmedOrder,
): string {
  const cleanNumber =
    normalizeWhatsAppNumber(whatsappNumber) || DEFAULT_WHATSAPP_NUMBER;
  const text = encodeURIComponent(buildWhatsAppOrderMessage(order));
  return `https://wa.me/${cleanNumber}?text=${text}`;
}

export function validateAdminCredentials(
  username: string,
  password: string,
): boolean {
  return username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export interface ProductDraftInput {
  name: string;
  latinName?: string;
  priceMad: number;
  image: string;
  sizeLabel: string;
  description: string;
  topNotes?: string;
  heartNotes?: string;
  baseNotes?: string;
}

function splitNotes(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[،,·\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function createPerfumeFromDraft(
  draft: ProductDraftInput,
  existingId?: string,
): Perfume {
  const trimmedName = draft.name.trim();
  const trimmedSize = draft.sizeLabel.trim() || '10 مل';
  const parsedMl = Number.parseInt(trimmedSize, 10);
  const volumeMl = Number.isFinite(parsedMl) && parsedMl > 0 ? parsedMl : 10;
  const cleanPrice = Math.max(1, Math.round(Number(draft.priceMad) || 50));
  const id =
    existingId ||
    `perfume-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  return {
    id,
    arabicName: trimmedName,
    latinName: (draft.latinName || trimmedName).trim(),
    family: 'عطر مختار',
    tagline: draft.description.trim(),
    description: draft.description.trim(),
    priceMad: cleanPrice,
    volumeMl,
    sizeLabel: trimmedSize,
    spraysEstimate: volumeMl * 15,
    longevity: 'رائحة مركزة وثبات عالي',
    occasion: 'الاستخدام اليومي والمناسبات',
    image: draft.image.trim(),
    notes: {
      top: splitNotes(draft.topNotes),
      heart: splitNotes(draft.heartNotes),
      base: splitNotes(draft.baseNotes),
    },
  };
}

export function saveProductToList(
  products: readonly Perfume[],
  draft: ProductDraftInput,
  editingId: string | null = null,
): { products: Perfume[]; saved: Perfume; mode: 'added' | 'updated' } {
  if (editingId) {
    const existing = products.find((p) => p.id === editingId);
    if (existing) {
      const trimmedName = draft.name.trim();
      const resolvedLatinName =
        draft.latinName !== undefined
          ? draft.latinName.trim()
          : trimmedName === existing.arabicName
            ? existing.latinName
            : trimmedName;

      const rebuilt = createPerfumeFromDraft(
        {
          ...draft,
          latinName: resolvedLatinName,
        },
        existing.id,
      );

      const updated: Perfume = {
        ...existing,
        ...rebuilt,
        id: existing.id,
        latinName: resolvedLatinName,
        family: existing.family,
        longevity: existing.longevity,
        occasion: existing.occasion,
      };

      return {
        products: products.map((p) => (p.id === existing.id ? updated : p)),
        saved: updated,
        mode: 'updated',
      };
    }
  }

  const created = createPerfumeFromDraft(draft);
  return {
    products: [created, ...products],
    saved: created,
    mode: 'added',
  };
}

export function restoreCreedAventus(
  products: readonly Perfume[],
): Perfume[] {
  const originalAventus = DEFAULT_PERFUMES[0];
  const exists = products.some((p) => p.id === originalAventus.id);
  if (exists) {
    return [...products];
  }
  return [{ ...originalAventus }, ...products];
}

export function loadStoredProducts(): Perfume[] {
  try {
    const raw = window.localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) return [...DEFAULT_PERFUMES];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEFAULT_PERFUMES];
    const validProducts = parsed.filter(
      (p): p is Perfume =>
        Boolean(p) &&
        typeof p.id === 'string' &&
        typeof p.arabicName === 'string' &&
        typeof p.priceMad === 'number',
    );

    const hasRestoredAventus =
      window.localStorage.getItem(AVENTUS_RESTORE_MARKER_KEY) === '1';
    if (
      !hasRestoredAventus &&
      !validProducts.some((p) => p.id === DEFAULT_PERFUMES[0].id)
    ) {
      const restored = restoreCreedAventus(validProducts);
      saveStoredProducts(restored);
      window.localStorage.setItem(AVENTUS_RESTORE_MARKER_KEY, '1');
      return restored;
    }

    return validProducts;
  } catch {
    return [...DEFAULT_PERFUMES];
  }
}

export function saveStoredProducts(products: readonly Perfume[]): void {
  try {
    window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadStoredSettings(): StoreSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    const whatsappNumber =
      typeof parsed?.whatsappNumber === 'string' &&
      isValidWhatsAppNumber(parsed.whatsappNumber)
        ? normalizeWhatsAppNumber(parsed.whatsappNumber)
        : DEFAULT_WHATSAPP_NUMBER;
    const deliveryFeeMad =
      typeof parsed?.deliveryFeeMad === 'number' &&
      Number.isFinite(parsed.deliveryFeeMad) &&
      parsed.deliveryFeeMad >= 0
        ? parsed.deliveryFeeMad
        : DEFAULT_DELIVERY_FEE_MAD;
    return { whatsappNumber, deliveryFeeMad };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveStoredSettings(settings: StoreSettings): void {
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota errors
  }
}

export function resetStoredCatalogAndSettings(): {
  products: Perfume[];
  settings: StoreSettings;
} {
  const products = [...DEFAULT_PERFUMES];
  const settings = { ...DEFAULT_SETTINGS };
  saveStoredProducts(products);
  saveStoredSettings(settings);
  return { products, settings };
}

export type OrderStatus = 'new' | 'delivering' | 'delivered' | 'cancelled';

export interface OwnerOrderItem {
  perfumeId: string;
  arabicName: string;
  latinName: string;
  unitPriceMad: number;
  quantity: number;
  lineTotalMad: number;
}

export interface OwnerOrder {
  orderNumber: string;
  createdAtIso: string;
  status: OrderStatus;
  customer: OrderCustomer;
  items: OwnerOrderItem[];
  subtotalMad: number;
  shippingMad: number;
  totalMad: number;
}

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; badgeClass: string }
> = {
  new: {
    label: 'طلب جديد',
    badgeClass: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  },
  delivering: {
    label: 'قيد التوصيل',
    badgeClass: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
  },
  delivered: {
    label: 'تم التوصيل',
    badgeClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  },
  cancelled: {
    label: 'ملغى',
    badgeClass: 'border-red-500/40 bg-red-500/10 text-red-300',
  },
};

export function computeOrderStats(orders: readonly OwnerOrder[]): {
  totalOrders: number;
  newOrders: number;
  totalBottlesSold: number;
  totalRevenueMad: number;
} {
  let newOrders = 0;
  let totalBottlesSold = 0;
  let totalRevenueMad = 0;

  for (const order of orders) {
    if (order.status === 'new') {
      newOrders += 1;
    }
    if (order.status !== 'cancelled') {
      totalRevenueMad += order.totalMad;
      for (const item of order.items) {
        totalBottlesSold += item.quantity;
      }
    }
  }

  return {
    totalOrders: orders.length,
    newOrders,
    totalBottlesSold,
    totalRevenueMad,
  };
}

export function filterOrders(
  orders: readonly OwnerOrder[],
  statusFilter: 'all' | OrderStatus,
  searchQuery: string,
): OwnerOrder[] {
  const q = searchQuery.trim().toLowerCase();
  return orders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    if (!q) return true;
    const haystack = [
      order.orderNumber,
      order.customer.fullName,
      order.customer.phone,
      order.customer.city,
      order.customer.address,
      ...order.items.map((i) => `${i.arabicName} ${i.latinName}`),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}
