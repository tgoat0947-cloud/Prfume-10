import fs from 'node:fs';
import path from 'node:path';

export type PerfumeId = string;
export type OrderStatus = 'new' | 'delivering' | 'delivered' | 'cancelled';

export interface OrderItemInput {
  perfumeId: string;
  arabicName?: string;
  latinName?: string;
  unitPriceMad?: number;
  quantity: number;
}

export interface StoredOrderItem {
  perfumeId: string;
  arabicName: string;
  latinName: string;
  unitPriceMad: number;
  quantity: number;
  lineTotalMad: number;
}

export interface OrderCustomerInput {
  fullName: string;
  phone: string;
  city: string;
  address: string;
}

export interface StoredOrder {
  orderNumber: string;
  createdAtIso: string;
  status: OrderStatus;
  customer: OrderCustomerInput;
  items: StoredOrderItem[];
  subtotalMad: number;
  shippingMad: number;
  totalMad: number;
}

export const UNIT_PRICE_MAD = 50;
export const STANDARD_SHIPPING_MAD = 20;

const CATALOG_META: Record<
  string,
  { arabicName: string; latinName: string; unitPriceMad: number }
> = {
  'creed-aventus': {
    arabicName: 'كريد أفنتوس',
    latinName: 'Creed Aventus',
    unitPriceMad: 50,
  },
  'dior-homme-intense': {
    arabicName: 'ديور أوم إنتنس',
    latinName: 'Dior Homme Intense',
    unitPriceMad: 50,
  },
  'versace-eros': {
    arabicName: 'فيرساتشي إيروس',
    latinName: 'Versace Eros',
    unitPriceMad: 50,
  },
};

export const VALID_ORDER_STATUSES: readonly OrderStatus[] = [
  'new',
  'delivering',
  'delivered',
  'cancelled',
];

function createSeedOrders(): StoredOrder[] {
  const now = Date.now();
  return [
    {
      orderNumber: 'P10-1002',
      createdAtIso: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      status: 'new',
      customer: {
        fullName: 'ياسين التازي',
        phone: '0661482910',
        city: 'الدار البيضاء',
        address: 'حي المعاريف، شارع بئر أنزران رقم 18',
      },
      items: [
        {
          perfumeId: 'creed-aventus',
          arabicName: 'كريد أفنتوس',
          latinName: 'Creed Aventus',
          unitPriceMad: 50,
          quantity: 1,
          lineTotalMad: 50,
        },
        {
          perfumeId: 'dior-homme-intense',
          arabicName: 'ديور أوم إنتنس',
          latinName: 'Dior Homme Intense',
          unitPriceMad: 50,
          quantity: 1,
          lineTotalMad: 50,
        },
        {
          perfumeId: 'versace-eros',
          arabicName: 'فيرساتشي إيروس',
          latinName: 'Versace Eros',
          unitPriceMad: 50,
          quantity: 1,
          lineTotalMad: 50,
        },
      ],
      subtotalMad: 150,
      shippingMad: 20,
      totalMad: 170,
    },
    {
      orderNumber: 'P10-1001',
      createdAtIso: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
      status: 'delivered',
      customer: {
        fullName: 'مهدي السقاط',
        phone: '0672910455',
        city: 'الرباط',
        address: 'حي أكدال، زنقة واد زيز رقم 7',
      },
      items: [
        {
          perfumeId: 'creed-aventus',
          arabicName: 'كريد أفنتوس',
          latinName: 'Creed Aventus',
          unitPriceMad: 50,
          quantity: 2,
          lineTotalMad: 100,
        },
      ],
      subtotalMad: 100,
      shippingMad: 20,
      totalMad: 120,
    },
  ];
}

export function loadOrders(filePath: string): StoredOrder[] {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    const seeds = createSeedOrders();
    saveOrders(filePath, seeds);
    return seeds;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredOrder[]) : [];
  } catch {
    return [];
  }
}

export function saveOrders(filePath: string, orders: readonly StoredOrder[]): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(orders, null, 2), 'utf-8');
  fs.renameSync(tmpPath, filePath);
}

export function validateIncomingOrderPayload(payload: {
  customer?: Partial<OrderCustomerInput>;
  items?: OrderItemInput[];
}): { valid: true } | { valid: false; message: string } {
  const customer = payload.customer;
  if (!customer) {
    return { valid: false, message: 'بيانات الزبون مطلوبة' };
  }
  if (typeof customer.fullName !== 'string' || customer.fullName.trim().length < 3) {
    return { valid: false, message: 'يرجى إدخال الاسم الكامل' };
  }
  const normalizedPhone =
    typeof customer.phone === 'string'
      ? customer.phone.replace(/[\s\-().]/g, '')
      : '';
  if (!/^(\+?\d{9,15}|0[5-7]\d{8})$/.test(normalizedPhone)) {
    return { valid: false, message: 'يرجى إدخال رقم هاتف صحيح' };
  }
  if (typeof customer.city !== 'string' || customer.city.trim().length < 2) {
    return { valid: false, message: 'يرجى تحديد المدينة' };
  }
  if (typeof customer.address !== 'string' || customer.address.trim().length < 5) {
    return { valid: false, message: 'يرجى إدخال عنوان التوصيل' };
  }
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return { valid: false, message: 'السلة فارغة' };
  }
  for (const item of payload.items) {
    if (typeof item.perfumeId !== 'string' || !item.perfumeId.trim()) {
      return { valid: false, message: 'عطر غير معروف في الطلب' };
    }
    if (
      typeof item.quantity !== 'number' ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 20
    ) {
      return { valid: false, message: 'كمية غير صالحة' };
    }
  }
  return { valid: true };
}

export function createOrderInStore(
  filePath: string,
  payload: {
    customer: OrderCustomerInput;
    items: OrderItemInput[];
    deliveryFeeMad?: number;
  },
  seedNum?: number,
): StoredOrder {
  const existing = loadOrders(filePath);
  const items: StoredOrderItem[] = payload.items.map((item) => {
    const known = CATALOG_META[item.perfumeId];
    const unitPriceMad =
      typeof item.unitPriceMad === 'number' &&
      Number.isFinite(item.unitPriceMad) &&
      item.unitPriceMad >= 1
        ? Math.round(item.unitPriceMad)
        : (known?.unitPriceMad ?? UNIT_PRICE_MAD);
    const arabicName =
      typeof item.arabicName === 'string' && item.arabicName.trim()
        ? item.arabicName.trim()
        : (known?.arabicName ?? item.perfumeId);
    const latinName =
      typeof item.latinName === 'string' && item.latinName.trim()
        ? item.latinName.trim()
        : (known?.latinName ?? arabicName);
    return {
      perfumeId: item.perfumeId,
      arabicName,
      latinName,
      unitPriceMad,
      quantity: item.quantity,
      lineTotalMad: unitPriceMad * item.quantity,
    };
  });

  const subtotalMad = items.reduce((sum, item) => sum + item.lineTotalMad, 0);
  const shippingMad =
    typeof payload.deliveryFeeMad === 'number' &&
    Number.isFinite(payload.deliveryFeeMad) &&
    payload.deliveryFeeMad >= 0
      ? Math.round(payload.deliveryFeeMad)
      : STANDARD_SHIPPING_MAD;

  const existingNumbers = new Set(existing.map((o) => o.orderNumber));
  let orderNumber = `P10-${seedNum ?? Math.floor(1100 + Math.random() * 8800)}`;
  while (existingNumbers.has(orderNumber)) {
    orderNumber = `P10-${Math.floor(1100 + Math.random() * 8800)}`;
  }

  const newOrder: StoredOrder = {
    orderNumber,
    createdAtIso: new Date().toISOString(),
    status: 'new',
    customer: {
      fullName: payload.customer.fullName.trim(),
      phone: payload.customer.phone.trim(),
      city: payload.customer.city.trim(),
      address: payload.customer.address.trim(),
    },
    items,
    subtotalMad,
    shippingMad,
    totalMad: subtotalMad + shippingMad,
  };

  const next = [newOrder, ...existing];
  saveOrders(filePath, next);
  return newOrder;
}

export function updateOrderStatusInStore(
  filePath: string,
  orderNumber: string,
  status: OrderStatus,
): StoredOrder | null {
  const existing = loadOrders(filePath);
  const index = existing.findIndex((o) => o.orderNumber === orderNumber);
  if (index === -1) return null;
  const updated: StoredOrder = { ...existing[index], status };
  const next = [...existing];
  next[index] = updated;
  saveOrders(filePath, next);
  return updated;
}

export function deleteOrderInStore(
  filePath: string,
  orderNumber: string,
): boolean {
  const existing = loadOrders(filePath);
  const next = existing.filter((o) => o.orderNumber !== orderNumber);
  if (next.length === existing.length) return false;
  saveOrders(filePath, next);
  return true;
}
