// Cliente API compatible con la interfaz de PocketBase SDK
// Reemplaza PocketBase → Express + MySQL

const API_BASE = '/api';

// ── Auth store (JWT en localStorage) ──────────────────────────────────────
let _authChangeCallbacks = [];

const authStore = {
  get model() {
    try { return JSON.parse(localStorage.getItem('safaria_auth_model')); } catch { return null; }
  },
  get isValid() {
    const token = localStorage.getItem('safaria_auth_token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch { return false; }
  },
  clear() {
    localStorage.removeItem('safaria_auth_token');
    localStorage.removeItem('safaria_auth_model');
    _authChangeCallbacks.forEach(cb => cb());
  },
  onChange(callback) {
    _authChangeCallbacks.push(callback);
    return () => { _authChangeCallbacks = _authChangeCallbacks.filter(c => c !== callback); };
  },
};

// ── Helper fetch con auth header ───────────────────────────────────────────
async function fetchApi(path, options = {}) {
  const token = localStorage.getItem('safaria_auth_token');
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(err.message || 'Error del servidor');
  }
  return response.json();
}

// ── Colecciones ────────────────────────────────────────────────────────────
const normalizeProduct = (p) => p ? { ...p, price: parseFloat(p.price) || 0 } : p;

const collections = {
  products: {
    // Retorna { items, totalPages, totalItems }
    async getList(page, perPage, options = {}) {
      const { sort = '-created', _params = {} } = options;
      const params = new URLSearchParams({ page, perPage, sort });
      Object.entries(_params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') params.set(k, v); });
      const data = await fetchApi(`/products?${params}`);
      return { ...data, items: (data.items || []).map(normalizeProduct) };
    },
    // Retorna array plano
    async getFullList(options = {}) {
      const { sort = '-created', _params = {} } = options;
      const params = new URLSearchParams({ sort });
      Object.entries(_params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') params.set(k, v); });
      const data = await fetchApi(`/products/all?${params}`);
      return Array.isArray(data) ? data.map(normalizeProduct) : data;
    },
    async getOne(id) {
      return normalizeProduct(await fetchApi(`/products/${id}`));
    },
    async delete(id) {
      return fetchApi(`/products/${id}`, { method: 'DELETE' });
    },
    async create(data) {
      return fetchApi('/products', { method: 'POST', body: JSON.stringify(data) });
    },
    async update(id, data) {
      return fetchApi(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    },
  },
  orders: {
    async getList(page, perPage, options = {}) {
      const { sort = '-created' } = options;
      return fetchApi(`/orders?page=${page}&perPage=${perPage}&sort=${sort}`);
    },
    async create(data) {
      return fetchApi('/orders', { method: 'POST', body: JSON.stringify(data) });
    },
    async update(id, data) {
      return fetchApi(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    },
  },
  users: {
    async authWithPassword(email, password) {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('safaria_auth_token', data.token);
      localStorage.setItem('safaria_auth_model', JSON.stringify(data.user));
      _authChangeCallbacks.forEach(cb => cb());
      return { record: data.user, token: data.token };
    },
  },
};

// ── Files helper ───────────────────────────────────────────────────────────
const files = {
  getUrl(record, filename) {
    if (!filename) return '';
    if (filename.startsWith('http')) return filename;
    return `/uploads/${filename}`;
  },
};

// ── Export compatible con "import pb from '@/lib/pocketbaseClient'" ────────
const apiClient = {
  collection: (name) => collections[name],
  files,
  authStore,
};

export default apiClient;
export { apiClient };

