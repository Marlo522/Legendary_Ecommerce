const baseUrl = (import.meta.env?.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
let csrfToken = null;
let csrfRequest = null;
let refreshRequest = null;

export class ApiError extends Error {
  constructor(message, status, errors = {}, code = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.code = code;
  }
}

async function send(path, options = {}) {
  let response;
  try {
    response = await fetch(baseUrl + '/' + path.replace(/^\/+/, ''), {
      credentials: 'include',
      ...options,
      headers: { Accept: 'application/json', ...options.headers },
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('We could not connect to the store. Please try again.', 0);
  }
  let data = null;
  if (response.status !== 204) {
    try {
      data = await response.json();
    } catch {
      throw new ApiError('The store returned an unexpected response. Please try again.', response.status);
    }
  }
  if (!response.ok) {
    throw new ApiError(data?.message || 'This request could not be completed.', response.status, data?.errors, data?.code);
  }
  if (data?.csrf_token) csrfToken = data.csrf_token;
  return data;
}

async function ensureCsrf() {
  if (csrfToken) return csrfToken;
  if (!csrfRequest) {
    csrfRequest = send('auth/csrf').then(data => {
      csrfToken = data.csrf_token;
      return csrfToken;
    }).finally(() => { csrfRequest = null; });
  }
  return csrfRequest;
}

async function refreshSession() {
  if (!refreshRequest) {
    refreshRequest = (async () => {
      const token = await ensureCsrf();
      return send('auth/refresh', { method: 'POST', headers: { 'X-CSRF-TOKEN': token } });
    })().finally(() => { refreshRequest = null; });
  }
  return refreshRequest;
}

export function clearCsrf() {
  csrfToken = null;
}

export async function apiRequest(path, { method = 'GET', body, signal, authenticate = true } = {}) {
  async function perform() {
    const headers = {};
    if (method !== 'GET') headers['X-CSRF-TOKEN'] = await ensureCsrf();
    const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
    if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
    const result = await send(path, { method, headers, signal, ...(body === undefined ? {} : { body: isForm ? body : JSON.stringify(body) }) });
    if (method !== 'GET' && path !== 'auth/refresh') window.dispatchEvent(new Event('api:mutated'));
    return result;
  }

  try {
    return await perform();
  } catch (error) {
    if (error.status === 419) {
      clearCsrf();
      return perform();
    }
    if (error.status !== 401 || !authenticate || signal?.aborted) throw error;
    if (error.code === 'session_missing') {
      clearCsrf();
      window.dispatchEvent(new Event('auth:expired'));
      throw error;
    }
    try {
      await refreshSession();
    } catch (refreshError) {
      if (refreshError.status === 401) {
        clearCsrf();
        window.dispatchEvent(new Event('auth:expired'));
      }
      throw refreshError;
    }
    return perform();
  }
}
