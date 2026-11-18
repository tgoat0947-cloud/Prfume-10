export interface FragranceNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Perfume {
  id: 'creed-aventus' | 'dior-homme-intense' | 'versace-eros';
  arabicName: string;
  latinName: string;
  family: string;
  tagline: string;
  description: string;
  priceMad: number;
  volumeMl: number;
  spraysEstimate: number;
  longevity: string;
  occasion: string;
  image: string;
  notes: FragranceNotes;
}

export interface CartItem {
  perfumeId: Perfume['id'];
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
export const STANDARD_SHIPPING_MAD = 20;
export const FREE_SHIPPING_MIN_ITEMS = 3;

export const CAMPAIGN_IMAGE =
  '/assets/aistudio/2b4dd090-55f2-4e7d-a1d8-9605ee4e8542_7e7e3867.png';

export const PERFUMES: readonly Perfume[] = [
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

export function getPerfumeById(id: Perfume['id']): Perfume | undefined {
  return PERFUMES.find((p) => p.id === id);
}

export function addToCart(
  cart: readonly CartItem[],
  perfumeId: Perfume['id'],
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

export function addDiscoveryTrio(cart: readonly CartItem[]): CartItem[] {
  let next = [...cart];
  for (const perfume of PERFUMES) {
    next = addToCart(next, perfume.id, 1);
  }
  return next;
}

export function updateCartQuantity(
  cart: readonly CartItem[],
  perfumeId: Perfume['id'],
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
  perfumeId: Perfume['id'],
): CartItem[] {
  return cart.filter((item) => item.perfumeId !== perfumeId);
}

export function calculateCartTotals(cart: readonly CartItem[]): {
  totalItems: number;
  subtotalMad: number;
  shippingMad: number;
  totalMad: number;
  remainingForFreeShipping: number;
} {
  let totalItems = 0;
  let subtotalMad = 0;

  for (const item of cart) {
    const perfume = getPerfumeById(item.perfumeId);
    if (!perfume || item.quantity <= 0) continue;
    totalItems += item.quantity;
    subtotalMad += perfume.priceMad * item.quantity;
  }

  const shippingMad =
    totalItems === 0 || totalItems >= FREE_SHIPPING_MIN_ITEMS
      ? 0
      : STANDARD_SHIPPING_MAD;

  const remainingForFreeShipping =
    totalItems === 0
      ? FREE_SHIPPING_MIN_ITEMS
      : Math.max(0, FREE_SHIPPING_MIN_ITEMS - totalItems);

  return {
    totalItems,
    subtotalMad,
    shippingMad,
    totalMad: subtotalMad + shippingMad,
    remainingForFreeShipping,
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
  orderSeed = Math.floor(1000 + Math.random() * 9000),
): ConfirmedOrder {
  const totals = calculateCartTotals(cart);
  const items = cart
    .map((item) => {
      const perfume = getPerfumeById(item.perfumeId);
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
