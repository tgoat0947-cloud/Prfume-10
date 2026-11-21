import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PERFUMES,
  DEFAULT_DELIVERY_FEE_MAD,
  DEFAULT_WHATSAPP_NUMBER,
  UNIT_PRICE_MAD,
  addToCart,
  addDiscoveryTrio,
  updateCartQuantity,
  removeFromCart,
  calculateCartTotals,
  validateOrderForm,
  createOrderReceipt,
  buildWhatsAppOrderMessage,
  buildWhatsAppChatUrl,
  normalizeWhatsAppNumber,
  isValidWhatsAppNumber,
  validateAdminCredentials,
  createPerfumeFromDraft,
  restoreCreedAventus,
  saveProductToList,
  computeOrderStats,
  filterOrders,
  type OwnerOrder,
} from './store';

test('catalog contains the three requested 10ml perfumes at 50 MAD', () => {
  assert.equal(DEFAULT_PERFUMES.length, 3);
  assert.deepEqual(
    DEFAULT_PERFUMES.map((p) => p.id),
    ['creed-aventus', 'dior-homme-intense', 'versace-eros'],
  );
  for (const perfume of DEFAULT_PERFUMES) {
    assert.equal(perfume.priceMad, UNIT_PRICE_MAD);
    assert.equal(perfume.volumeMl, 10);
    assert.ok(perfume.notes.top.length > 0);
    assert.ok(perfume.notes.heart.length > 0);
    assert.ok(perfume.notes.base.length > 0);
  }
});

test('cart addition, increment, decrement, and removal work cleanly', () => {
  let cart = addToCart([], 'creed-aventus', 1);
  assert.deepEqual(cart, [{ perfumeId: 'creed-aventus', quantity: 1 }]);

  cart = addToCart(cart, 'creed-aventus', 1);
  cart = addToCart(cart, 'versace-eros', 1);
  assert.deepEqual(cart, [
    { perfumeId: 'creed-aventus', quantity: 2 },
    { perfumeId: 'versace-eros', quantity: 1 },
  ]);

  cart = updateCartQuantity(cart, 'creed-aventus', 1);
  assert.equal(cart[0].quantity, 1);

  cart = updateCartQuantity(cart, 'creed-aventus', 0);
  assert.deepEqual(cart, [{ perfumeId: 'versace-eros', quantity: 1 }]);

  cart = removeFromCart(cart, 'versace-eros');
  assert.deepEqual(cart, []);
});

test('totals apply configurable delivery fee (default 20 MAD) when cart is non-empty', () => {
  const emptyTotals = calculateCartTotals([], DEFAULT_PERFUMES, DEFAULT_DELIVERY_FEE_MAD);
  assert.equal(emptyTotals.totalItems, 0);
  assert.equal(emptyTotals.subtotalMad, 0);
  assert.equal(emptyTotals.shippingMad, 0);
  assert.equal(emptyTotals.totalMad, 0);

  const twoItems = addToCart(
    addToCart([], 'creed-aventus', 1),
    'dior-homme-intense',
    1,
  );
  const twoTotals = calculateCartTotals(twoItems, DEFAULT_PERFUMES, 20);
  assert.equal(twoTotals.totalItems, 2);
  assert.equal(twoTotals.subtotalMad, 100);
  assert.equal(twoTotals.shippingMad, 20);
  assert.equal(twoTotals.totalMad, 120);

  const trioCart = addDiscoveryTrio([], DEFAULT_PERFUMES);
  const customFeeTotals = calculateCartTotals(trioCart, DEFAULT_PERFUMES, 30);
  assert.equal(customFeeTotals.totalItems, 3);
  assert.equal(customFeeTotals.subtotalMad, 150);
  assert.equal(customFeeTotals.shippingMad, 30);
  assert.equal(customFeeTotals.totalMad, 180);
});

test('order validation rejects empty/invalid inputs and accepts valid Moroccan COD details', () => {
  const invalid = validateOrderForm({
    fullName: '',
    phone: '123',
    city: '',
    address: 'ab',
  });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.fullName);
  assert.ok(invalid.errors.phone);
  assert.ok(invalid.errors.city);
  assert.ok(invalid.errors.address);

  const valid = validateOrderForm({
    fullName: 'يوسف العلمي',
    phone: '0612345678',
    city: 'الدار البيضاء',
    address: 'شارع الزرقطوني، رقم 42',
  });
  assert.equal(valid.isValid, true);
  assert.deepEqual(valid.errors, {});
});

test('WhatsApp order URL and Arabic message include customer details, items, fee, and total', () => {
  const cart = addToCart([], 'creed-aventus', 2);
  const receipt = createOrderReceipt(
    cart,
    {
      fullName: 'كريم بناني',
      phone: '0661223344',
      city: 'الرباط',
      address: 'حي أكدال، شارع فرنسا',
    },
    DEFAULT_PERFUMES,
    20,
    4821,
  );
  assert.equal(receipt.orderNumber, 'P10-4821');
  assert.equal(receipt.subtotalMad, 100);
  assert.equal(receipt.shippingMad, 20);
  assert.equal(receipt.totalMad, 120);

  const msg = buildWhatsAppOrderMessage(receipt);
  assert.ok(msg.includes('كريم بناني'));
  assert.ok(msg.includes('0661223344'));
  assert.ok(msg.includes('الرباط'));
  assert.ok(msg.includes('كريد أفنتوس'));
  assert.ok(msg.includes('20 درهم'));
  assert.ok(msg.includes('120 درهم'));

  const url = buildWhatsAppChatUrl(DEFAULT_WHATSAPP_NUMBER, receipt);
  assert.ok(url.startsWith('https://wa.me/212771587686?text='));
  assert.ok(decodeURIComponent(url).includes('كريم بناني'));
});

test('WhatsApp normalization, admin credentials, and custom product drafting work cleanly', () => {
  assert.equal(normalizeWhatsAppNumber('+212 771-587-686'), '212771587686');
  assert.equal(normalizeWhatsAppNumber('0771587686'), '212771587686');
  assert.equal(isValidWhatsAppNumber('212771587686'), true);
  assert.equal(isValidWhatsAppNumber('123'), false);

  assert.equal(validateAdminCredentials('abdejalil', 'gokugoku'), true);
  assert.equal(validateAdminCredentials('abdejalil', 'wrong'), false);
  assert.equal(validateAdminCredentials('visitor', 'gokugoku'), false);

  const custom = createPerfumeFromDraft({
    name: 'سوفاج إليكسير',
    priceMad: 75,
    image: '',
    sizeLabel: '15 مل',
    description: 'عطر خشبي حار بتركيز عالي',
    topNotes: 'القرفة، جوزة الطيب',
  });
  assert.equal(custom.arabicName, 'سوفاج إليكسير');
  assert.equal(custom.priceMad, 75);
  assert.equal(custom.sizeLabel, '15 مل');
  assert.equal(custom.notes.top.length, 2);
});

test('owner dashboard stats exclude cancelled orders from revenue and bottles sold', () => {
  const sampleOrders: OwnerOrder[] = [
    {
      orderNumber: 'P10-2001',
      createdAtIso: '2026-11-18T10:00:00.000Z',
      status: 'new',
      customer: {
        fullName: 'ياسين التازي',
        phone: '0661482910',
        city: 'الدار البيضاء',
        address: 'حي المعاريف',
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
    {
      orderNumber: 'P10-2002',
      createdAtIso: '2026-11-18T09:00:00.000Z',
      status: 'delivered',
      customer: {
        fullName: 'مهدي السقاط',
        phone: '0672910455',
        city: 'الرباط',
        address: 'حي أكدال',
      },
      items: [
        {
          perfumeId: 'versace-eros',
          arabicName: 'فيرساتشي إيروس',
          latinName: 'Versace Eros',
          unitPriceMad: 50,
          quantity: 3,
          lineTotalMad: 150,
        },
      ],
      subtotalMad: 150,
      shippingMad: 0,
      totalMad: 150,
    },
    {
      orderNumber: 'P10-2003',
      createdAtIso: '2026-11-18T08:00:00.000Z',
      status: 'cancelled',
      customer: {
        fullName: 'عماد فوزي',
        phone: '0655001122',
        city: 'فاس',
        address: 'وسط المدينة',
      },
      items: [
        {
          perfumeId: 'dior-homme-intense',
          arabicName: 'ديور أوم إنتنس',
          latinName: 'Dior Homme Intense',
          unitPriceMad: 50,
          quantity: 1,
          lineTotalMad: 50,
        },
      ],
      subtotalMad: 50,
      shippingMad: 20,
      totalMad: 70,
    },
  ];

  const stats = computeOrderStats(sampleOrders);
  assert.equal(stats.totalOrders, 3);
  assert.equal(stats.newOrders, 1);
  assert.equal(stats.totalBottlesSold, 5);
  assert.equal(stats.totalRevenueMad, 270);

  assert.equal(filterOrders(sampleOrders, 'all', '').length, 3);
  assert.equal(filterOrders(sampleOrders, 'delivered', '').length, 1);
  assert.equal(filterOrders(sampleOrders, 'all', 'الرباط')[0].orderNumber, 'P10-2002');
  assert.equal(filterOrders(sampleOrders, 'all', 'P10-2001')[0].customer.fullName, 'ياسين التازي');
});

test('saveProductToList updates an existing product in-place without duplication and preserves others', () => {
  const edited = saveProductToList(
    DEFAULT_PERFUMES,
    {
      name: 'ديور أوم إنتنس المعدل',
      priceMad: 65,
      sizeLabel: '15 مل',
      image: '/assets/perfumes/dior-homme-intense.png',
      description: 'نسخة محدثة بتركيز أقوى وثبات أطول',
      topNotes: 'الخزامى، البرغموت',
      heartNotes: 'السوسن، العنبر',
      baseNotes: 'خشب الأرز',
    },
    'dior-homme-intense',
  );

  assert.equal(edited.mode, 'updated');
  assert.equal(edited.products.length, 3);
  assert.deepEqual(
    edited.products.map((p) => p.id),
    ['creed-aventus', 'dior-homme-intense', 'versace-eros'],
  );
  const target = edited.products[1];
  assert.equal(target.arabicName, 'ديور أوم إنتنس المعدل');
  assert.equal(target.priceMad, 65);
  assert.equal(target.sizeLabel, '15 مل');
  assert.equal(target.volumeMl, 15);
  assert.deepEqual(target.notes.top, ['الخزامى', 'البرغموت']);
  assert.deepEqual(target.notes.heart, ['السوسن', 'العنبر']);
  assert.deepEqual(target.notes.base, ['خشب الأرز']);
  // Other products untouched
  assert.equal(edited.products[0].arabicName, 'كريد أفنتوس');
  assert.equal(edited.products[0].priceMad, 50);
  assert.equal(edited.products[2].arabicName, 'فيرساتشي إيروس');

  // Adding a new product prepends cleanly without touching existing ones
  const added = saveProductToList(edited.products, {
    name: 'سوفاج ديور',
    priceMad: 80,
    sizeLabel: '10 مل',
    image: '',
    description: 'عطر رجالي فخم',
    topNotes: 'برغموت',
  });
  assert.equal(added.mode, 'added');
  assert.equal(added.products.length, 4);
  assert.equal(added.products[0].arabicName, 'سوفاج ديور');
});

test('restoreCreedAventus restores Creed Aventus with original details when missing and avoids duplicating if present', () => {
  const withoutAventus = DEFAULT_PERFUMES.filter((p) => p.id !== 'creed-aventus');
  assert.equal(withoutAventus.length, 2);

  const restored = restoreCreedAventus(withoutAventus);
  assert.equal(restored.length, 3);
  assert.equal(restored[0].id, 'creed-aventus');
  assert.equal(restored[0].arabicName, 'كريد أفنتوس');
  assert.equal(restored[0].priceMad, 50);
  assert.equal(restored[0].sizeLabel, '10 مل');
  assert.equal(restored[0].image, '/assets/perfumes/aventus-card.png');
  assert.ok(restored[0].notes.top.includes('الأناناس'));

  const idempotent = restoreCreedAventus(restored);
  assert.equal(idempotent.length, 3);
});

