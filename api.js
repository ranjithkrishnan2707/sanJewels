/* ==========================================================================
   rsauraantitarnish – Frontend API Client
   Thin wrapper around fetch() for all MongoDB-backed REST endpoints.
   ========================================================================== */

const API_BASE = window.location.origin; // same server serves the site

const API = {

  /* ── Products ─────────────────────────────────────────────────── */
  async getProducts() {
    const res = await fetch(`${API_BASE}/api/products`);
    return res.json();
  },
  async saveProduct(product) {
    // POST = upsert by id
    const res = await fetch(`${API_BASE}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return res.json();
  },
  async updateProduct(id, data) {
    const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  /* ── Orders ───────────────────────────────────────────────────── */
  async getOrders() {
    const res = await fetch(`${API_BASE}/api/orders`);
    return res.json();
  },
  async createOrder(order) {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    return res.json();
  },
  async updateOrder(id, data) {
    const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  /* ── Customers ────────────────────────────────────────────────── */
  async getCustomers() {
    const res = await fetch(`${API_BASE}/api/customers`);
    return res.json();
  },
  async createCustomer(customer) {
    const res = await fetch(`${API_BASE}/api/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer),
    });
    return res.json();
  },

  /* ── Appointments ─────────────────────────────────────────────── */
  async getAppointments() {
    const res = await fetch(`${API_BASE}/api/appointments`);
    return res.json();
  },
  async createAppointment(appt) {
    const res = await fetch(`${API_BASE}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appt),
    });
    return res.json();
  },
  async updateAppointment(id, data) {
    const res = await fetch(`${API_BASE}/api/appointments/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  /* ── Newsletter ───────────────────────────────────────────────── */
  async getNewsletter() {
    const res = await fetch(`${API_BASE}/api/newsletter`);
    return res.json();
  },
  async subscribeNewsletter(email) {
    const res = await fetch(`${API_BASE}/api/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, date: new Date().toISOString().split('T')[0] }),
    });
    return res.json();
  },
  async unsubscribeNewsletter(email) {
    const res = await fetch(`${API_BASE}/api/newsletter/${encodeURIComponent(email)}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  /* ── Settings / Theme Display ────────────────────────────────── */
  async getSetting(key) {
    try {
      const res = await fetch(`${API_BASE}/api/settings/${encodeURIComponent(key)}`);
      return res.json();
    } catch (e) {
      console.warn('API.getSetting error:', e);
      return null;
    }
  },
  async saveSetting(key, value) {
    try {
      const res = await fetch(`${API_BASE}/api/settings/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      return res.json();
    } catch (e) {
      console.warn('API.saveSetting error:', e);
      return null;
    }
  },
  async deleteSetting(key) {
    try {
      const res = await fetch(`${API_BASE}/api/settings/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      return res.json();
    } catch (e) {
      console.warn('API.deleteSetting error:', e);
      return null;
    }
  },
};

// Make globally available
window.API = API;
