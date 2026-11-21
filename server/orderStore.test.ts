import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  createOrderInStore,
  deleteOrderInStore,
  loadOrders,
  updateOrderStatusInStore,
  validateIncomingOrderPayload,
} from './orderStore.ts';

function withTempStorePath(): string {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'perfume10-'));
  return path.join(tmpDir, 'orders.json');
}

test('server order store seeds initial orders and persists newly created orders', () => {
  const storePath = withTempStorePath();
  const initial = loadOrders(storePath);
  assert.equal(initial.length, 2);

  const created = createOrderInStore(
    storePath,
    {
      customer: {
        fullName: 'سعيد المرابط',
        phone: '0612345678',
        city: 'مراكش',
        address: 'حي جيليز، شارع محمد الخامس',
      },
      items: [
        { perfumeId: 'creed-aventus', quantity: 1 },
        { perfumeId: 'dior-homme-intense', quantity: 1 },
      ],
    },
    7777,
  );

  assert.equal(created.orderNumber, 'P10-7777');
  assert.equal(created.status, 'new');
  assert.equal(created.subtotalMad, 100);
  assert.equal(created.shippingMad, 20);
  assert.equal(created.totalMad, 120);

  const reloaded = loadOrders(storePath);
  assert.equal(reloaded.length, 3);
  assert.equal(reloaded[0].orderNumber, 'P10-7777');
});

test('server order store updates order status and deletes orders', () => {
  const storePath = withTempStorePath();
  loadOrders(storePath);

  const updated = updateOrderStatusInStore(storePath, 'P10-1002', 'delivered');
  assert.ok(updated);
  assert.equal(updated.status, 'delivered');

  const missing = updateOrderStatusInStore(storePath, 'P10-9999', 'cancelled');
  assert.equal(missing, null);

  const deleted = deleteOrderInStore(storePath, 'P10-1001');
  assert.equal(deleted, true);
  assert.equal(loadOrders(storePath).length, 1);
});

test('incoming order payload validation enforces required fields and valid items', () => {
  const bad = validateIncomingOrderPayload({
    customer: { fullName: 'a', phone: '12', city: '', address: 'x' },
    items: [],
  });
  assert.equal(bad.valid, false);

  const good = validateIncomingOrderPayload({
    customer: {
      fullName: 'نديم العلوي',
      phone: '0661223344',
      city: 'طنجة',
      address: 'شارع باستور رقم 14',
    },
    items: [{ perfumeId: 'versace-eros', quantity: 3 }],
  });
  assert.equal(good.valid, true);
});
