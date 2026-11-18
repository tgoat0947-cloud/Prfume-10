import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PERFUMES,
  UNIT_PRICE_MAD,
  STANDARD_SHIPPING_MAD,
  addToCart,
  addDiscoveryTrio,
  updateCartQuantity,
  removeFromCart,
  calculateCartTotals,
  validateOrderForm,
  createOrderReceipt,
} from './store';

test('catalog contains the three requested 10ml perfumes at 50 MAD', () => {
  assert.equal(PERFUMES.length, 3);
  assert.deepEqual(
    PERFUMES.map((p) => p.id),
    ['creed-aventus', 'dior-homme-intense', 'versace-eros'],
  );
  for (const perfume of PERFUMES) {
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

test('totals calculate 50 MAD per bottle and unlock free shipping at 3 bottles', () => {
  const emptyTotals = calculateCartTotals([]);
  assert.equal(emptyTotals.totalItems, 0);
  assert.equal(emptyTotals.subtotalMad, 0);
  assert.equal(emptyTotals.shippingMad, 0);
  assert.equal(emptyTotals.totalMad, 0);

  const twoItems = addToCart(
    addToCart([], 'creed-aventus', 1),
    'dior-homme-intense',
    1,
  );
  const twoTotals = calculateCartTotals(twoItems);
  assert.equal(twoTotals.totalItems, 2);
  assert.equal(twoTotals.subtotalMad, 100);
  assert.equal(twoTotals.shippingMad, STANDARD_SHIPPING_MAD);
  assert.equal(twoTotals.totalMad, 120);
  assert.equal(twoTotals.remainingForFreeShipping, 1);

  const trioCart = addDiscoveryTrio([]);
  const trioTotals = calculateCartTotals(trioCart);
  assert.equal(trioTotals.totalItems, 3);
  assert.equal(trioTotals.subtotalMad, 150);
  assert.equal(trioTotals.shippingMad, 0);
  assert.equal(trioTotals.totalMad, 150);
  assert.equal(trioTotals.remainingForFreeShipping, 0);
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

test('order receipt summarizes line items and deterministic order number', () => {
  const cart = addDiscoveryTrio([]);
  const receipt = createOrderReceipt(
    cart,
    {
      fullName: 'كريم بناني',
      phone: '0661223344',
      city: 'الرباط',
      address: 'حي أكدال، شارع فرنسا',
    },
    4821,
  );
  assert.equal(receipt.orderNumber, 'P10-4821');
  assert.equal(receipt.items.length, 3);
  assert.equal(receipt.subtotalMad, 150);
  assert.equal(receipt.shippingMad, 0);
  assert.equal(receipt.totalMad, 150);
});
