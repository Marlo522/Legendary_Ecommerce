import test from 'node:test';
import assert from 'node:assert/strict';
import { orderIsLocked, orderPayload, paymentOptions, statusOptions } from './adminForms.js';

test('fulfillment only offers valid next statuses', () => {
  assert.deepEqual(statusOptions('pending'), ['pending', 'confirmed', 'cancelled']);
  assert.deepEqual(statusOptions('packed'), ['packed', 'shipped', 'cancelled']);
  assert.deepEqual(statusOptions('completed'), ['completed']);
  assert.deepEqual(statusOptions('cancelled'), ['cancelled']);
});

test('payment history cannot be downgraded to permit item editing', () => {
  assert.deepEqual(paymentOptions('paid'), ['paid', 'refunded']);
  assert.deepEqual(paymentOptions('refunded'), ['refunded']);
  assert.deepEqual(paymentOptions('failed'), ['failed', 'pending', 'paid']);
});

test('paid, shipped, completed and cancelled orders lock item amounts', () => {
  assert.equal(orderIsLocked({ status: 'pending', payment_status: 'paid' }), true);
  assert.equal(orderIsLocked({ status: 'shipped' }), true);
  assert.equal(orderIsLocked({ status: 'completed' }), true);
  assert.equal(orderIsLocked({ status: 'cancelled' }), true);
  assert.equal(orderIsLocked({ status: 'pending', payment_status: 'pending' }), false);
  assert.equal(orderIsLocked(undefined), false);
});

test('order submission strips display prices and normalizes selected quantities', () => {
  const body = orderPayload({ items: [{ variant_id: '7', quantity: '2', unit_price: 1, label: 'Preview' }], shipping_fee: '', discount_amount: '25.50', updated_at: 'version' });
  assert.deepEqual(body, { items: [{ variant_id: 7, quantity: 2 }], shipping_fee: 0, discount_amount: '25.50', updated_at: 'version' });
});
