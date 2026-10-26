import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = new EventTarget();
const { apiRequest, clearCsrf } = await import('./apiClient.js');
const {
  clearResourceCache, invalidateResource, loadResource, peekResource, prefetchResource, subscribeResourceCache,
} = await import('./resourceCache.js');

let calls;
const response = data => new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });

beforeEach(() => {
  clearResourceCache();
  clearCsrf();
  calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return response({ data: { visit: calls.length }, csrf_token: 'test-csrf' });
  };
});

test('navigation and prefetch share one request and reuse the completed result', async () => {
  prefetchResource('account');
  const first = loadResource('account');
  const second = loadResource('account');
  assert.equal(first, second);
  const result = await first;
  assert.deepEqual(await loadResource('account'), result);
  assert.deepEqual(peekResource('account'), result);
  assert.equal(calls.length, 1);
});

test('expired resources reload after thirty seconds', async context => {
  let now = 1_000;
  context.mock.method(Date, 'now', () => now);
  await loadResource('account');
  now += 30_001;
  assert.equal(peekResource('account'), undefined);
  await loadResource('account');
  assert.equal(calls.length, 2);
});

test('logout and session expiry discard private data and pending responses', async () => {
  await loadResource('account');
  let finish;
  globalThis.fetch = () => new Promise(resolve => { finish = resolve; });
  const pending = loadResource('account/orders?page=1&per_page=12');
  window.dispatchEvent(new Event('auth:expired'));
  finish(response({ data: ['previous account'] }));
  await pending;
  assert.equal(peekResource('account'), undefined);
  assert.equal(peekResource('account/orders?page=1&per_page=12'), undefined);
});

test('writes invalidate cached overview and wishlist results and notify mounted resources', async () => {
  await loadResource('account');
  await loadResource('account/wishlist?page=1&per_page=12');
  let notifications = 0;
  const unsubscribe = subscribeResourceCache(() => { notifications++; });
  await apiRequest('account/wishlist', { method: 'POST', body: { slug: 'tee', saved: true } });
  unsubscribe();
  assert.equal(peekResource('account'), undefined);
  assert.equal(peekResource('account/wishlist?page=1&per_page=12'), undefined);
  assert.equal(notifications, 1);
  await loadResource('account');
  assert.equal(calls.length, 4);
});

test('cart and product stock are fetched fresh on every visit', async () => {
  for (const path of ['cart', 'catalog/products/everyday-tee']) {
    await loadResource(path, { authenticate: false });
    await loadResource(path, { authenticate: false });
    assert.equal(peekResource(path, false), undefined);
  }
  assert.equal(calls.length, 4);
});

test('failed requests can be retried, and explicit retry bypasses a cached result', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ message: 'Unavailable' }), { status: 503 });
  await assert.rejects(loadResource('account'), /Unavailable/);
  globalThis.fetch = async () => { calls.push('request'); return response({ data: [] }); };
  await loadResource('account');
  invalidateResource('account');
  await loadResource('account');
  assert.equal(calls.length, 2);
});

test('public and authenticated resource keys stay separate and storage is bounded', async () => {
  await loadResource('account', { authenticate: false });
  assert.equal(peekResource('account'), undefined);
  for (let page = 0; page < 61; page++) await loadResource('account/orders?page=' + page);
  assert.equal(peekResource('account/orders?page=0'), undefined);
  assert.ok(peekResource('account/orders?page=60'));
});
