import { apiRequest } from './apiClient.js';

const resources = new Map();
const listeners = new Set();
const maxAge = 30_000;
const maxEntries = 60;

function keyFor(path, authenticate) {
  return (authenticate ? 'private:' : 'public:') + path;
}

function canCache(path) {
  return path !== 'cart' && !path.startsWith('cart/')
    && !/^catalog\/products\/[^/?]+(?:\?|$)/.test(path);
}

export function clearResourceCache() {
  for (const entry of resources.values()) entry.controller?.abort();
  resources.clear();
  for (const listener of listeners) listener();
}

export function subscribeResourceCache(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function invalidateResource(path, authenticate = true) {
  const key = keyFor(path, authenticate);
  resources.get(key)?.controller?.abort();
  resources.delete(key);
}

export function peekResource(path, authenticate = true) {
  const entry = resources.get(keyFor(path, authenticate));
  return canCache(path) && entry?.expiresAt > Date.now() ? entry.data : undefined;
}

export function loadResource(path, { authenticate = true, force = false } = {}) {
  const key = keyFor(path, authenticate);
  const existing = resources.get(key);
  if (existing?.promise) return existing.promise;
  if (!force) {
    const cached = peekResource(path, authenticate);
    if (cached !== undefined) return Promise.resolve(cached);
  }

  const controller = new AbortController();
  const entry = { controller };
  entry.promise = apiRequest(path, { authenticate, signal: controller.signal }).then(data => {
    if (resources.get(key) === entry) {
      if (canCache(path)) {
        resources.delete(key);
        resources.set(key, { data, expiresAt: Date.now() + maxAge });
        if (resources.size > maxEntries) {
          const oldest = [...resources].find(([, value]) => !value.promise);
          if (oldest) resources.delete(oldest[0]);
        }
      } else resources.delete(key);
    }
    return data;
  }).catch(error => {
    if (resources.get(key) === entry) resources.delete(key);
    throw error;
  });
  resources.set(key, entry);
  return entry.promise;
}

export function prefetchResource(path, options) {
  void loadResource(path, options).catch(() => {});
}

window.addEventListener('auth:expired', clearResourceCache);
window.addEventListener('api:mutated', clearResourceCache);
