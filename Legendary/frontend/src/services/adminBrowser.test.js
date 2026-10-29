import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

let browser;
let socket;
let sequence = 0;
const pending = new Map();
const errors = [];
const baseUrl = process.env.ADMIN_TEST_URL || 'http://localhost:5173';

async function until(check, message) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const value = await check();
    if (value) return value;
    await delay(50);
  }
  throw new Error(message);
}

function command(method, params = {}) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text + ': ' + result.exceptionDetails.exception?.description);
  return result.result.value;
}

function installTestApi() {
  const product = {
    id: 1, name: 'Everyday tee', slug: 'everyday-tee', category_id: 1, category: { name: 'T-shirts' },
    base_price: 500, sale_price: null, status: 'active', is_featured: false, is_new_arrival: false,
    stock_quantity: 10, updated_at: '2026-10-23T01:00:00Z', images: [],
    variants: [{ id: 2, sku: 'TEE-BLK-M', color: 'Black', color_hex: '#000000', size: 'M', price_override: null, stock_quantity: 10, low_stock_threshold: 5, is_active: true, updated_at: '2026-10-23T01:00:00Z' }],
  };
  window.__adminTest = { writes: [], fail: false, product };
  window.confirm = () => true;
  window.fetch = async (input, options = {}) => {
    const path = new URL(input, window.location.href).pathname.replace(/^\/api\//, '');
    const method = options.method || 'GET';
    const state = window.__adminTest;
    const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
    if (path === 'auth/me') return json({ user: { id: 'admin', name: 'Admin', role: 'admin' } });
    if (path === 'auth/csrf') return json({ csrf_token: 'test' });
    if (method !== 'GET') {
      const body = options.body instanceof FormData ? Object.fromEntries(options.body) : JSON.parse(options.body || '{}');
      state.writes.push({ path, method, body, contentType: options.headers['Content-Type'] });
      await new Promise(resolve => setTimeout(resolve, 120));
      if (state.fail) return json({ message: 'Please check your input.', errors: { sku: ['This SKU is already in use.'] } }, 422);
      if (path === 'admin/products') return json({ data: { ...product, ...body } }, 201);
      if (path === 'admin/products/1' && method === 'PUT') {
        Object.assign(product, body, { updated_at: '2026-10-23T02:00:00Z' });
        return json({ data: product });
      }
      if (path.includes('/variants')) {
        product.variants[0] = { ...product.variants[0], ...body, updated_at: '2026-10-23T02:00:00Z' };
        return json({ data: product.variants[0] });
      }
      if (path === 'admin/products/1/images') return json({ data: { id: 3 } }, 201);
      if (path === 'admin/orders') return json({ data: { id: 9 } }, 201);
      return new Response(null, { status: 204 });
    }
    if (path === 'admin/categories') return json({ data: [{ id: 1, name: 'T-shirts' }] });
    if (path === 'admin/products/1') return json({ data: product });
    if (path === 'admin/products') return json({ data: [product], meta: { page: 1, per_page: 12, total: 1, last_page: 1 } });
    if (path === 'admin/orders/9') return json({ data: { id: 9, order_number: 'LL-TEST', status: 'pending', payment_status: 'pending', total: 1000, subtotal: 1000, shipping_fee: 0, discount_amount: 0, items: [], shipping_address: null } });
    if (path === 'cart') return json({ data: { items: [], count: 0, subtotal: 0, unavailable_items: 0 } });
    return json({ data: [] });
  };
}

before(async () => {
  const profile = await mkdtemp(join(tmpdir(), 'legendary-admin-browser-'));
  const executable = process.env.ADMIN_TEST_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  browser = spawn(executable, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank'], { stdio: 'ignore', windowsHide: true });
  browser.on('error', error => errors.push(error.message));
  const port = await until(async () => {
    try { return (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; } catch { return null; }
  }, 'Headless browser did not start.');
  const target = await (await fetch('http://127.0.0.1:' + port + '/json/new?about:blank', { method: 'PUT' })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve); socket.addEventListener('error', reject); });
  socket.addEventListener('message', event => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const task = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) task.reject(new Error(data.error.message)); else task.resolve(data.result);
    }
    if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text);
  });
  await command('Page.enable');
  await command('Runtime.enable');
  await command('Page.addScriptToEvaluateOnNewDocument', { source: '(' + installTestApi.toString() + ')()' });
});

after(async () => {
  if (socket) {
    try { await command('Browser.close'); } catch { /* Browser exits before acknowledging on some platforms. */ }
    socket.close();
  }
  browser?.kill();
});

async function open(path) {
  errors.length = 0;
  await command('Page.navigate', { url: baseUrl + path });
  await until(() => evaluate('!!document.querySelector("#admin-main form")'), 'Admin form did not load.');
}

async function fill(label, value) {
  await evaluate('(' + ((label, value) => {
    const control = [...document.querySelectorAll('label')].find(node => node.querySelector('.form-label')?.textContent === label)?.querySelector('input,select,textarea');
    if (!control) throw new Error('Missing control: ' + label);
    const prototype = control instanceof HTMLSelectElement ? HTMLSelectElement.prototype : control instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(control, value);
    control.dispatchEvent(new Event('input', { bubbles: true }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
  }).toString() + ')(' + JSON.stringify(label) + ',' + JSON.stringify(value) + ')');
}

async function click(text) {
  await evaluate('(' + (text => {
    const button = [...document.querySelectorAll('button')].find(node => node.textContent.trim() === text);
    if (!button) throw new Error('Missing button: ' + text);
    button.click();
  }).toString() + ')(' + JSON.stringify(text) + ')');
}

test('product form preserves values after validation errors and prevents duplicate submissions', async () => {
  await open('/admin/products/new');
  await fill('Product name', 'New tee');
  await fill('URL slug', 'new-tee');
  await fill('Category', '1');
  await fill('Base price (PHP)', '500');
  await evaluate('window.__adminTest.fail = true');
  await click('Create product');
  await until(() => evaluate('document.querySelector("button[disabled]") !== null'), 'Submit did not disable.');
  await evaluate('document.querySelector("#admin-main form").requestSubmit()');
  await until(() => evaluate('document.querySelector("[role=alert]")?.textContent.includes("SKU")'), 'Validation error not shown.');
  assert.equal(await evaluate('window.__adminTest.writes.length'), 1);
  assert.equal(await evaluate('document.querySelector("input[name=name]").value'), 'New tee');
  assert.deepEqual(errors, []);
});

test('inventory editing preserves unsaved product details while refreshing stock', async () => {
  await open('/admin/products/1');
  await fill('Product name', 'Unsaved product name');
  await click('Edit');
  await fill('Stock quantity', '7');
  await click('Save variant');
  await until(() => evaluate('document.querySelector("#admin-main").textContent.includes("Changes saved.")'), 'Variant did not save.');
  await until(() => evaluate('document.querySelector("td")?.textContent.includes("500")'), 'Refreshed inventory missing.');
  assert.equal(await evaluate('document.querySelector("input[name=name]").value'), 'Unsaved product name');
  assert.equal(await evaluate('window.__adminTest.writes[0].body.stock_quantity'), '7');
  assert.equal(await evaluate('window.__adminTest.writes[0].body.updated_at'), '2026-10-23T01:00:00Z');
  assert.deepEqual(errors, []);
});

test('admin layouts fit mobile, tablet, and desktop widths and controls have labels', async () => {
  await open('/admin/products/1');
  for (const width of [390, 768, 1440]) {
    await command('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
    assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, 'Overflow at width ' + width);
  }
  assert.equal(await evaluate('[...document.querySelectorAll("#admin-main input, #admin-main textarea, #admin-main select")].every(input => input.labels.length || input.getAttribute("aria-label"))'), true);
  assert.deepEqual(errors, []);
});


test('image upload sends multipart data and refreshes the image list', async () => {
  await open('/admin/products/1');
  await fill('Image description', 'Back of black tee');
  await evaluate('(' + (() => {
    const bytes = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF0sAAAAASUVORK5CYII='), letter => letter.charCodeAt(0));
    const transfer = new DataTransfer();
    transfer.items.add(new File([bytes], 'tee.png', { type: 'image/png' }));
    document.querySelector('input[type=file]').files = transfer.files;
    document.querySelector('input[type=file]').dispatchEvent(new Event('change', { bubbles: true }));
  }).toString() + ')()');
  await click('Upload image');
  await until(() => evaluate('document.querySelector("#admin-main").textContent.includes("Image uploaded.")'), 'Image did not upload.');
  assert.equal(await evaluate('window.__adminTest.writes[0].body.alt_text'), 'Back of black tee');
  assert.equal(await evaluate('window.__adminTest.writes[0].contentType === undefined'), true);
  assert.equal(await evaluate('document.querySelector("input[type=file]").files.length'), 0);
  assert.deepEqual(errors, []);
});

test('order form submits variant IDs and quantities with no display prices', async () => {
  await command('Emulation.clearDeviceMetricsOverride');
  await open('/admin/orders/new');
  for (const [label, value] of [['Customer name', 'Buyer'], ['Email', 'buyer@example.test'], ['Phone', '09123456789'], ['Recipient name', 'Buyer'], ['Delivery phone', '09123456789'], ['Address line 1', '1 Test Street'], ['City', 'Manila'], ['Province', 'Metro Manila'], ['Postal code', '1000']]) await fill(label, value);
  await fill('Product', '1');
  await until(() => evaluate('[...document.querySelectorAll("button")].some(node => node.textContent.includes("TEE-BLK-M"))'), 'Variant picker did not load.');
  await evaluate('[...document.querySelectorAll("button")].find(node => node.textContent.includes("TEE-BLK-M")).click()');
  await click('Create order');
  await until(() => evaluate('window.__adminTest.writes.length > 0'), 'Order was not submitted.');
  const body = await evaluate('window.__adminTest.writes[0].body');
  assert.deepEqual(body.items, [{ variant_id: 2, quantity: 1 }]);
  assert.equal(body.guest_email, 'buyer@example.test');
  assert.equal(Object.hasOwn(body, 'total'), false);
  assert.deepEqual(errors, []);
});


test('variant pickers support presets, custom colors and SKUs, and dropdown sizes', async () => {
  await open('/admin/products/1');
  await fill('Color', 'Navy');
  await fill('Size', 'XL');
  assert.equal(await evaluate('document.querySelector("input[name=color_hex]").value'), '#000080');
  assert.equal(await evaluate('document.querySelector("select[name=size]").value'), 'XL');
  const suggested = await evaluate('document.querySelector("input[name=sku]").value');
  assert.ok(suggested.endsWith('-NAVY-XL'));
  await fill('SKU', 'CUSTOM-NAVY');
  await fill('Color', 'Ocean mist');
  await fill('Size', 'M');
  assert.equal(await evaluate('document.querySelector("input[name=sku]").value'), 'CUSTOM-NAVY');
  await fill('Color hex', '#12ABCD');
  assert.equal(await evaluate('document.querySelector("input[type=color]").value'), '#12abcd');
  await evaluate('(' + (() => {
    const picker = document.querySelector('input[type=color]');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(picker, '#123456');
    picker.dispatchEvent(new Event('input', { bubbles: true }));
    picker.dispatchEvent(new Event('change', { bubbles: true }));
  }).toString() + ')()');
  assert.equal(await evaluate('document.querySelector("input[name=color_hex]").value'), '#123456');
  await click('Add variant');
  await until(() => evaluate('document.querySelector("#admin-main").textContent.includes("Changes saved.")'), 'Variant did not save.');
  const body = await evaluate('window.__adminTest.writes[0].body');
  assert.equal(body.color, 'Ocean mist');
  assert.equal(body.color_hex, '#123456');
  assert.equal(body.sku, 'CUSTOM-NAVY');
  assert.equal(body.size, 'M');
  assert.deepEqual(errors, []);
});
