/* ==========================================================================
   rsauraantitarnish - Admin Dashboard Engine
   ========================================================================== */

// ============================================================
// ADMIN CREDENTIALS
// ============================================================
const ADMIN_CREDS = { username: 'admin', password: 'admin123' };

// ============================================================
// DATA – loaded from MongoDB Atlas via REST API
// localStorage used only as a fast fallback cache.
// ============================================================

const seedProducts = (typeof window !== 'undefined' && window.SAMPLE_PRODUCTS) ? window.SAMPLE_PRODUCTS : [];
let adminProducts  = JSON.parse(localStorage.getItem('san_admin_products'))  || seedProducts;
let adminOrders    = JSON.parse(localStorage.getItem('san_admin_orders'))    || [];
let adminCustomers = JSON.parse(localStorage.getItem('san_admin_customers')) || [];
let adminAppointments = JSON.parse(localStorage.getItem('san_admin_appts'))  || [];
let newsletterSubs = JSON.parse(localStorage.getItem('san_newsletter_subs')) || [];

// Fetch all data from DB and refresh the in-memory + cache state
async function loadAllDataFromDB() {
  try {
    const [products, orders, customers, appointments, newsletter] = await Promise.all([
      API.getProducts(),
      API.getOrders(),
      API.getCustomers(),
      API.getAppointments(),
      API.getNewsletter(),
    ]);
    if (Array.isArray(products)     && products.length)     { adminProducts     = products;     localStorage.setItem('san_admin_products',  JSON.stringify(adminProducts));     }
    if (Array.isArray(orders)       && orders.length)       { adminOrders       = orders;       localStorage.setItem('san_admin_orders',    JSON.stringify(adminOrders));       }
    if (Array.isArray(customers)    && customers.length)    { adminCustomers    = customers;    localStorage.setItem('san_admin_customers', JSON.stringify(adminCustomers));    }
    if (Array.isArray(appointments) && appointments.length) { adminAppointments = appointments; localStorage.setItem('san_admin_appts',     JSON.stringify(adminAppointments)); }
    if (Array.isArray(newsletter)   && newsletter.length)   { newsletterSubs    = newsletter;   localStorage.setItem('san_newsletter_subs', JSON.stringify(newsletterSubs));   }
    console.log('✅ Admin data loaded from MongoDB Atlas.');
  } catch (err) {
    console.warn('⚠️ Could not load from DB, using local cache.', err.message);
  }
}

// Weekly revenue data
const weeklyRevenue = [
  { label: 'Mon', value: 14500 },
  { label: 'Tue', value: 22400 },
  { label: 'Wed', value: 8750 },
  { label: 'Thu', value: 31200 },
  { label: 'Fri', value: 24500 },
  { label: 'Sat', value: 41800 },
  { label: 'Sun', value: 18900 },
];

const monthlyRevenue = [
  { label: 'Jan', value: 48000 },
  { label: 'Feb', value: 62500 },
  { label: 'Mar', value: 55200 },
  { label: 'Apr', value: 71800 },
  { label: 'May', value: 89400 },
  { label: 'Jun', value: 76100 },
  { label: 'Jul', value: 93800 },
  { label: 'Aug', value: 118500 },
  { label: 'Sep', value: 136200 },
  { label: 'Oct', value: 0 },
  { label: 'Nov', value: 0 },
  { label: 'Dec', value: 0 },
];

// Category breakdown
const categoryData = [
  { label: 'Emerald Couture', pct: 30, color: '#10a87a' },
  { label: 'Royal Rings', pct: 25, color: '#d4af37' },
  { label: 'High Earrings', pct: 20, color: '#8b5cf6' },
  { label: 'Bracelets & Cuffs', pct: 15, color: '#06b6d4' },
  { label: 'Gold Heritage', pct: 10, color: '#f59e0b' },
];

// Regional data
const regionData = [
  { label: 'Europe', pct: 44 },
  { label: 'Middle East', pct: 28 },
  { label: 'North America', pct: 16 },
  { label: 'South Asia', pct: 10 },
  { label: 'East Asia', pct: 2 },
];

// ============================================================
// STATE
// ============================================================
let currentPage = 'dashboard';
let activeOrderFilter = 'all';
let orderSearchTerm = '';
let productFilterCat = 'all';
let productSearchTerm = '';
let confirmCallback = null;
let editingProductId = null;
let chartPeriod = 'weekly';

// ============================================================
// DOM
// ============================================================
const loginOverlay = document.getElementById('loginOverlay');
const loginForm = document.getElementById('loginForm');
const loginUser = document.getElementById('loginUser');
const loginPass = document.getElementById('loginPass');
const loginError = document.getElementById('loginError');
const pwToggle = document.getElementById('pwToggle');
const sidebar = document.getElementById('sidebar');
const mainWrapper = document.getElementById('mainWrapper');
const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
const mobileSidebarBtn = document.getElementById('mobileSidebarBtn');
const breadcrumb = document.getElementById('breadcrumb');
const adminToast = document.getElementById('adminToast');
const adminToastMsg = document.getElementById('adminToastMsg');

// Product modal
const productModal = document.getElementById('productModal');
const productModalTitle = document.getElementById('productModalTitle');
const productForm = document.getElementById('productForm');
const closeProductModal = document.getElementById('closeProductModal');
const cancelProductModal = document.getElementById('cancelProductModal');

// Confirm modal
const confirmModal = document.getElementById('confirmModal');
const confirmMessage = document.getElementById('confirmMessage');
const confirmOkBtn = document.getElementById('confirmOkBtn');
const confirmCancelBtn = document.getElementById('confirmCancelBtn');
const closeConfirmModal = document.getElementById('closeConfirmModal');

const navItems = document.querySelectorAll('.nav-item[data-page]');

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Check session
  const session = sessionStorage.getItem('san_admin_auth');
  if (session === 'true') {
    loginOverlay.classList.add('hidden');
    initDashboard();
  }

  // Login form
  loginForm.addEventListener('submit', handleLogin);

  // Password toggle
  pwToggle.addEventListener('click', () => {
    const isPass = loginPass.type === 'password';
    loginPass.type = isPass ? 'text' : 'password';
    pwToggle.innerHTML = isPass ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
  });

  // Sidebar collapse
  sidebarCollapseBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    mainWrapper.classList.toggle('sidebar-collapsed');
  });

  // Mobile sidebar
  mobileSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
  });

  // Nav items
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.getAttribute('data-page');
      if (page) navigateTo(page);
      if (window.innerWidth <= 768) sidebar.classList.remove('mobile-open');
    });
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.removeItem('san_admin_auth');
    loginOverlay.classList.remove('hidden');
    loginForm.reset();
    loginError.textContent = '';
  });

  // View All (card action buttons)
  document.querySelectorAll('.card-action-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.getAttribute('data-page')));
  });

  // Product modal controls
  document.getElementById('addProductBtn').addEventListener('click', openAddProductModal);
  closeProductModal.addEventListener('click', closeProductModalFn);
  cancelProductModal.addEventListener('click', closeProductModalFn);
  productForm.addEventListener('submit', saveProduct);

  // Confirm modal controls
  confirmCancelBtn.addEventListener('click', closeConfirmFn);
  closeConfirmModal.addEventListener('click', closeConfirmFn);
  confirmOkBtn.addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
    closeConfirmFn();
  });

  // Order Detail modal controls
  const orderDetailModal = document.getElementById('orderDetailModal');
  const closeOrderDetailModal = document.getElementById('closeOrderDetailModal');
  const dismissOrderDetailModal = document.getElementById('dismissOrderDetailModal');
  if (closeOrderDetailModal) {
    closeOrderDetailModal.addEventListener('click', () => {
      if (orderDetailModal) orderDetailModal.classList.remove('active');
    });
  }
  if (dismissOrderDetailModal) {
    dismissOrderDetailModal.addEventListener('click', () => {
      if (orderDetailModal) orderDetailModal.classList.remove('active');
    });
  }
  if (orderDetailModal) {
    orderDetailModal.addEventListener('click', (e) => {
      if (e.target === orderDetailModal) orderDetailModal.classList.remove('active');
    });
  }

  // Product search & filter
  document.getElementById('productSearch').addEventListener('input', (e) => {
    productSearchTerm = e.target.value.toLowerCase();
    renderProductsTable();
  });
  document.getElementById('categoryFilter').addEventListener('change', (e) => {
    productFilterCat = e.target.value;
    renderProductsTable();
  });

  // Product Image File Reader
  const pImageFile = document.getElementById('pImageFile');
  if (pImageFile) {
    pImageFile.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          document.getElementById('pImage').value = evt.target.result;
          document.getElementById('pImagePreview').src = evt.target.result;
          document.getElementById('pImagePreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Orders status filter
  document.querySelectorAll('.order-status-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.order-status-card').forEach(c => c.classList.remove('active-filter'));
      card.classList.add('active-filter');
      activeOrderFilter = card.getAttribute('data-filter-status');
      renderOrdersTable();
    });
  });

  // Order search
  const orderSearchEl = document.getElementById('orderSearch');
  if (orderSearchEl) {
    orderSearchEl.addEventListener('input', (e) => {
      orderSearchTerm = e.target.value.toLowerCase().trim();
      renderOrdersTable();
    });
  }

  // Period toggle
  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      chartPeriod = btn.getAttribute('data-period');
      renderRevenueChart();
    });
  });

  // Export orders
  document.getElementById('exportOrdersBtn').addEventListener('click', exportOrdersCSV);

  // Export newsletter
  document.getElementById('exportNewsletterBtn').addEventListener('click', exportNewsletter);

  // Settings forms
  document.getElementById('storeSettingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    showAdminToast('Store settings saved successfully.');
  });
  document.getElementById('securityForm').addEventListener('submit', (e) => {
    e.preventDefault();
    showAdminToast('Password updated successfully.');
  });

  // Data management
  document.getElementById('clearCartDataBtn').addEventListener('click', () => {
    confirmAction('Clear all shopping cart data from local storage?', () => {
      localStorage.removeItem('san_cart');
      showAdminToast('Cart data cleared.');
    });
  });
  document.getElementById('resetDataBtn').addEventListener('click', () => {
    confirmAction('Reset all store data? This action cannot be undone.', () => {
      localStorage.clear();
      showAdminToast('Store data reset. Page will reload...');
      setTimeout(() => location.reload(), 1500);
    });
  });

  // Global search
  document.getElementById('globalSearch').addEventListener('input', (e) => {
    const term = e.target.value.trim().toLowerCase();
    if (term.length > 1) {
      const match = adminProducts.find(p => p.name.toLowerCase().includes(term));
      if (match) {
        navigateTo('products');
        document.getElementById('productSearch').value = term;
        productSearchTerm = term;
        renderProductsTable();
      }
    }
  });
});

// ============================================================
// LOGIN
// ============================================================
function handleLogin(e) {
  e.preventDefault();
  const u = loginUser.value.trim();
  const p = loginPass.value;
  loginError.textContent = '';

  if (u === ADMIN_CREDS.username && p === ADMIN_CREDS.password) {
    sessionStorage.setItem('san_admin_auth', 'true');
    loginOverlay.classList.add('hidden');
    initDashboard();
    showAdminToast('Welcome back, Administrator!');
  } else {
    loginError.textContent = 'Invalid credentials. Please try again.';
    loginPass.value = '';
    loginUser.focus();
  }
}

// ============================================================
// NAVIGATION
// ============================================================
const PAGE_ICONS = {
  dashboard: 'fa-gauge-high',
  products: 'fa-gem',
  orders: 'fa-bag-shopping',
  appointments: 'fa-calendar-check',
  analytics: 'fa-chart-line',
  customers: 'fa-users',
  newsletter: 'fa-envelope-open-text',
  settings: 'fa-sliders',
};
const PAGE_NAMES = {
  dashboard: 'Dashboard',
  products: 'Product Management',
  orders: 'Order Management',
  appointments: 'Appointments & Consultations',
  analytics: 'Analytics & Insights',
  customers: 'Customer Management',
  newsletter: 'Newsletter Subscribers',
  settings: 'Store Settings',
};

function navigateTo(page) {
  currentPage = page;

  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`page${capitalize(page)}`);
  if (target) target.classList.add('active');

  // Update nav active state
  navItems.forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-page') === page);
  });

  // Breadcrumb
  const icon = PAGE_ICONS[page] || 'fa-circle';
  breadcrumb.innerHTML = `<i class="fa-solid ${icon}"></i> ${PAGE_NAMES[page] || page}`;

  // Lazy render
  switch (page) {
    case 'products': renderProductsTable(); break;
    case 'orders': renderOrdersTable(); renderOrderStatusCounts(); break;
    case 'appointments': renderAppointmentsTable(); break;
    case 'analytics': renderAnalytics(); break;
    case 'customers': renderCustomersTable(); break;
    case 'newsletter': renderNewsletterTable(); break;
  }
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ============================================================
// DASHBOARD INIT
// ============================================================
function initDashboard() {
  // Load fresh data from DB then render
  loadAllDataFromDB().then(() => {
    updateDashboardStats();
    renderRevenueChart();
    renderTopProducts();
    renderRecentOrders();
  });
}

function updateDashboardStats() {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Revenue (non-cancelled)
  const totalRev = adminOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  // Today
  const todayOrders = adminOrders.filter(o => (o.date || '').startsWith(todayStr));
  const todaySales = todayOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.amount || 0), 0);

  // Monthly
  const monthlyOrders = adminOrders.filter(o => {
    const d = new Date(o.date || '');
    return !isNaN(d) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthlySales = monthlyOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.amount || 0), 0);

  // Order statuses
  const processing = adminOrders.filter(o => o.status === 'processing').length;
  const shipped = adminOrders.filter(o => o.status === 'shipped').length;
  const delivered = adminOrders.filter(o => o.status === 'delivered').length;
  const cancelled = adminOrders.filter(o => o.status === 'cancelled').length;

  // Stock (using stock field if available, otherwise flag products with low/no stock)
  const lowStock = adminProducts.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outStock = adminProducts.filter(p => p.stock === 0).length;

  // Pending appointments
  const pendingAppts = adminAppointments.filter(a => a.status === 'pending').length;

  // Set DOM
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('totalRevenue', `₹${totalRev.toLocaleString('en-IN')}`);
  set('totalOrders', adminOrders.length);
  set('totalProducts', adminProducts.length);
  set('totalCustomers', adminCustomers.length);
  set('todayOrders', todayOrders.length);
  set('todaySales', `₹${todaySales.toLocaleString('en-IN')}`);
  set('monthlySales', `₹${monthlySales.toLocaleString('en-IN')}`);
  set('totalAppointments', pendingAppts);
  set('dashProcessing', processing);
  set('dashShipped', shipped);
  set('dashDelivered', delivered);
  set('dashCancelled', cancelled);
  set('dashLowStock', lowStock);
  set('dashOutStock', outStock);
}

// ============================================================
// REVENUE CHART (Pure CSS/HTML bar chart)
// ============================================================
function renderRevenueChart() {
  const data = chartPeriod === 'weekly' ? weeklyRevenue : monthlyRevenue.filter(m => m.value > 0);
  const maxVal = Math.max(...data.map(d => d.value));
  const container = document.getElementById('revenueChart');

  container.innerHTML = data.map(d => {
    const pct = maxVal > 0 ? (d.value / maxVal) * 160 : 0;
    return `
      <div class="chart-bar-group">
        <div class="chart-bar-value">₹${(d.value / 1000).toFixed(0)}k</div>
        <div class="chart-bar-fill" style="height: ${pct}px;" title="${d.label}: ₹${d.value.toLocaleString()}"></div>
        <div class="chart-bar-label">${d.label}</div>
      </div>
    `;
  }).join('');
}

// ============================================================
// TOP PRODUCTS
// ============================================================
function renderTopProducts() {
  const rankClasses = ['gold', 'silver', 'bronze', 'other', 'other', 'other'];
  const list = document.getElementById('topProductsList');
  const sorted = [...adminProducts].sort((a, b) => b.price - a.price).slice(0, 5);
  list.innerHTML = sorted.map((p, i) => `
    <div class="top-product-item">
      <div class="tp-rank ${rankClasses[i]}">${i + 1}</div>
      <div class="tp-info">
        <div class="tp-name">${p.name}</div>
        <div class="tp-cat">${p.categoryName}</div>
      </div>
      <div class="tp-price">₹${p.price.toLocaleString()}</div>
    </div>
  `).join('');
}

// ============================================================
// RECENT ORDERS
// ============================================================
function renderRecentOrders() {
  const tbody = document.getElementById('recentOrdersBody');
  const recent = adminOrders.slice(0, 5);
  tbody.innerHTML = recent.map(o => `
    <tr>
      <td><code style="color:var(--ad-gold); font-size:0.82rem;">${o.id}</code></td>
      <td>${o.customer}</td>
      <td>${o.product.slice(0, 32)}${o.product.length > 32 ? '…' : ''}</td>
      <td><strong>₹${o.amount.toLocaleString()}</strong></td>
      <td>${o.date}</td>
      <td>${statusBadge(o.status)}</td>
    </tr>
  `).join('');
}

// ============================================================
// PRODUCTS TABLE
// ============================================================
function renderProductsTable() {
  const tbody = document.getElementById('productsTableBody');
  const catMap = { emerald: 'EMERALD COUTURE', rings: 'ROYAL RINGS', earrings: 'HIGH EARRINGS', bracelets: 'BRACELETS & CUFFS', heritage: 'GOLD HERITAGE' };

  const filtered = adminProducts.filter(p => {
    const matchesCat = productFilterCat === 'all' || p.category === productFilterCat;
    const matchesSearch = !productSearchTerm || p.name.toLowerCase().includes(productSearchTerm) || (p.spec || '').toLowerCase().includes(productSearchTerm);
    return matchesCat && matchesSearch;
  });

  tbody.innerHTML = filtered.length === 0 ? `<tr><td colspan="7" style="text-align:center; padding:40px; color:var(--ad-text-muted);">No products found.</td></tr>` :
    filtered.map(p => {
      const stock = p.stock !== undefined ? p.stock : null;
      let stockBadge = '';
      if (stock === null) stockBadge = `<span class="badge" style="background:rgba(255,255,255,0.05);color:var(--ad-text-muted);">—</span>`;
      else if (stock === 0) stockBadge = `<span class="badge badge-cancelled"><i class="fa-solid fa-circle-xmark"></i> Out of Stock</span>`;
      else if (stock <= 5) stockBadge = `<span class="badge badge-processing"><i class="fa-solid fa-triangle-exclamation"></i> Low (${stock})</span>`;
      else stockBadge = `<span class="badge badge-delivered"><i class="fa-solid fa-circle-check"></i> ${stock}</span>`;
      return `
      <tr>
        <td>
          <div class="td-product">
            <img src="${p.image}" alt="${p.name}" class="td-product-img" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22><rect width=%2248%22 height=%2248%22 fill=%22%23162118%22/><text y=%2230%22 x=%2210%22 fill=%22%23d4af37%22 font-size=%2218%22>💎</text></svg>'">
            <div>
              <div class="td-product-name">${p.name}</div>
              <div class="td-product-spec">${p.id}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-confirmed">${catMap[p.category] || p.category}</span></td>
        <td><strong>₹${p.price.toLocaleString()}</strong></td>
        <td>${p.tag || '—'}</td>
        <td style="max-width:200px; font-size:0.82rem; color:var(--ad-text-muted);">${(p.spec || '').slice(0, 45)}${(p.spec || '').length > 45 ? '…' : ''}</td>
        <td>${stockBadge}</td>
        <td>
          <div class="table-actions">
            <button class="tbl-btn" title="Edit" onclick="editProduct('${p.id}')"><i class="fa-solid fa-pen"></i></button>
            <button class="tbl-btn danger" title="Delete" onclick="deleteProduct('${p.id}')"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `}).join('');
}

// ============================================================
// PRODUCT MODAL
// ============================================================
function openAddProductModal() {
  editingProductId = null;
  productModalTitle.textContent = 'Add New Product';
  productForm.reset();
  document.getElementById('pEditId').value = '';
  document.getElementById('pImage').value = '';
  document.getElementById('pImagePreview').src = '';
  document.getElementById('pImagePreview').style.display = 'none';
  productModal.classList.add('active');
}

function editProduct(id) {
  const p = adminProducts.find(x => x.id === id);
  if (!p) return;
  editingProductId = id;
  productModalTitle.textContent = 'Edit Product';
  document.getElementById('pName').value = p.name;
  document.getElementById('pCategory').value = p.category;
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pStock').value = p.stock !== undefined ? p.stock : 10;
  document.getElementById('pTag').value = p.tag || '';
  document.getElementById('pSpec').value = p.spec || '';
  document.getElementById('pDesc').value = p.description || '';
  document.getElementById('pImage').value = p.image || '';
  
  if (p.image) {
    document.getElementById('pImagePreview').src = p.image;
    document.getElementById('pImagePreview').style.display = 'block';
  } else {
    document.getElementById('pImagePreview').src = '';
    document.getElementById('pImagePreview').style.display = 'none';
  }
  
  document.getElementById('pEditId').value = p.id;
  productModal.classList.add('active');
}

function closeProductModalFn() {
  productModal.classList.remove('active');
  productForm.reset();
  editingProductId = null;
}

function saveProduct(e) {
  e.preventDefault();
  const catMap = { emerald: 'EMERALD COUTURE', rings: 'ROYAL RINGS', earrings: 'HIGH EARRINGS', bracelets: 'BRACELETS & CUFFS', heritage: 'GOLD HERITAGE' };
  const cat = document.getElementById('pCategory').value;
  const updated = {
    id: editingProductId || `prod-${Date.now()}`,
    name: document.getElementById('pName').value.trim(),
    category: cat,
    categoryName: catMap[cat] || cat.toUpperCase(),
    price: parseInt(document.getElementById('pPrice').value),
    stock: parseInt(document.getElementById('pStock').value) || 0,
    tag: document.getElementById('pTag').value.trim(),
    spec: document.getElementById('pSpec').value.trim(),
    description: document.getElementById('pDesc').value.trim(),
    image: document.getElementById('pImage').value.trim() || 'images/emerald_necklace.jpg',
  };

  if (editingProductId) {
    const idx = adminProducts.findIndex(p => p.id === editingProductId);
    if (idx !== -1) adminProducts[idx] = updated;
    // Persist to DB
    API.updateProduct(editingProductId, updated)
      .then(() => showAdminToast('Product updated successfully.'))
      .catch(() => showAdminToast('Product updated locally (DB sync failed).', 'fa-exclamation-triangle'));
  } else {
    adminProducts.push(updated);
    // Persist to DB
    API.saveProduct(updated)
      .then(() => showAdminToast('Product added to the collection.'))
      .catch(() => showAdminToast('Product added locally (DB sync failed).', 'fa-exclamation-triangle'));
  }

  localStorage.setItem('san_admin_products', JSON.stringify(adminProducts));
  closeProductModalFn();
  renderProductsTable();
  renderTopProducts();
  updateDashboardStats();
}

function deleteProduct(id) {
  const p = adminProducts.find(x => x.id === id);
  confirmAction(`Delete "${p ? p.name : id}"? This cannot be undone.`, () => {
    adminProducts = adminProducts.filter(x => x.id !== id);
    localStorage.setItem('san_admin_products', JSON.stringify(adminProducts));
    // Persist deletion to DB
    API.deleteProduct(id).catch(err => console.warn('DB delete failed:', err.message));
    renderProductsTable();
    renderTopProducts();
    updateDashboardStats();
    showAdminToast('Product deleted from collection.');
  });
}

// ============================================================
// ORDERS TABLE
// ============================================================
function renderOrdersTable() {
  const tbody = document.getElementById('ordersTableBody');
  let filtered = activeOrderFilter === 'all' ? adminOrders : adminOrders.filter(o => o.status === activeOrderFilter);
  if (orderSearchTerm) {
    filtered = filtered.filter(o =>
      (o.id || '').toLowerCase().includes(orderSearchTerm) ||
      (o.customer || '').toLowerCase().includes(orderSearchTerm) ||
      (o.product || '').toLowerCase().includes(orderSearchTerm) ||
      (o.location || '').toLowerCase().includes(orderSearchTerm)
    );
  }
  tbody.innerHTML = filtered.length === 0 ? `<tr><td colspan="8" style="text-align:center; padding:40px; color:var(--ad-text-muted);">No orders found.</td></tr>` :
    filtered.map(o => `
      <tr>
        <td><code style="color:var(--ad-gold); font-size:0.82rem;">${o.id}</code></td>
        <td>${o.customer}</td>
        <td style="max-width:180px; font-size:0.85rem;">${o.product.slice(0, 30)}${o.product.length > 30 ? '…' : ''}</td>
        <td><strong>₹${Number(o.amount).toLocaleString()}</strong></td>
        <td>${o.location}</td>
        <td>${o.date}</td>
        <td>${statusBadge(o.status)}</td>
        <td>
          <div class="table-actions">
            <button class="tbl-btn" title="View Order & Delivery Details" onclick="viewOrderDetails('${o.id}')"><i class="fa-solid fa-eye"></i></button>
            <button class="tbl-btn" title="Change Status" onclick="cycleOrderStatus('${o.id}')"><i class="fa-solid fa-rotate"></i></button>
            <button class="tbl-btn danger" title="Cancel Order" onclick="cancelOrder('${o.id}')"><i class="fa-solid fa-ban"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
}

function renderOrderStatusCounts() {
  const statuses = ['processing', 'shipped', 'delivered', 'cancelled'];
  document.getElementById('orderCountAll').textContent = adminOrders.length;
  statuses.forEach(s => {
    const el = document.getElementById(`orderCount${capitalize(s)}`);
    if (el) el.textContent = adminOrders.filter(o => o.status === s).length;
  });
}

function cycleOrderStatus(id) {
  const cycle = ['processing', 'shipped', 'delivered'];
  const o = adminOrders.find(x => x.id === id);
  if (!o || o.status === 'cancelled') return;
  const idx = cycle.indexOf(o.status);
  o.status = cycle[(idx + 1) % cycle.length];
  localStorage.setItem('san_admin_orders', JSON.stringify(adminOrders));
  // Persist to DB
  API.updateOrder(id, { status: o.status }).catch(err => console.warn('DB order update failed:', err.message));
  renderOrdersTable();
  renderOrderStatusCounts();
  renderRecentOrders();
  showAdminToast(`Order ${id} status updated to ${o.status}.`);
}

function cancelOrder(id) {
  confirmAction(`Cancel order ${id}?`, () => {
    const o = adminOrders.find(x => x.id === id);
    if (o) o.status = 'cancelled';
    localStorage.setItem('san_admin_orders', JSON.stringify(adminOrders));
    // Persist to DB
    API.updateOrder(id, { status: 'cancelled' }).catch(err => console.warn('DB cancel failed:', err.message));
    renderOrdersTable();
    renderOrderStatusCounts();
    showAdminToast(`Order ${id} cancelled.`);
  });
}

window.viewOrderDetails = function(id) {
  const o = adminOrders.find(x => x.id === id);
  if (!o) return;

  const modal = document.getElementById('orderDetailModal');
  const title = document.getElementById('orderModalTitle');
  const content = document.getElementById('orderModalContent');

  if (title) title.innerHTML = `<i class="fa-solid fa-receipt" style="color: var(--ad-gold);"></i> Acquisition Reference: ${o.id}`;

  const fullAddr = o.address ? `${o.address}, ${o.city || ''}, ${o.state || ''} ${o.pincode ? '- ' + o.pincode : ''}`.replace(/,\s*,/g, ',').trim() : (o.location || 'India');

  let itemsHtml = '';
  if (o.items && Array.isArray(o.items) && o.items.length > 0) {
    itemsHtml = o.items.map(i => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-size:0.86rem;">
        <span><strong>${i.name}</strong> <span style="color:var(--ad-text-muted);">x${i.qty || 1}</span></span>
        <span style="color:var(--ad-gold); font-weight:600;">₹${Number((i.price || 0) * (i.qty || 1)).toLocaleString('en-IN')}</span>
      </div>
    `).join('');
  } else {
    itemsHtml = `<div style="padding:8px 0; color:var(--ad-text-muted); font-size:0.88rem;">${o.product || 'Fine Jewelry Collection'}</div>`;
  }

  if (content) {
    content.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid rgba(212,175,55,0.2);">
        <div>
          <span style="font-size:0.78rem; color:var(--ad-text-muted); display:block; margin-bottom:4px;">STATUS</span>
          <div>${statusBadge(o.status)}</div>
        </div>
        <div style="text-align:right;">
          <span style="font-size:0.78rem; color:var(--ad-text-muted); display:block; margin-bottom:4px;">ORDER DATE</span>
          <div style="font-weight:600; color:#fff;">${o.date || '—'}</div>
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(212,175,55,0.2); border-radius:8px; padding:14px; margin-bottom:16px;">
        <h4 style="font-size:0.82rem; color:var(--ad-gold); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:10px;"><i class="fa-solid fa-truck"></i> Customer & Insured Delivery Details</h4>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:0.85rem;">
          <div><span style="color:var(--ad-text-muted); font-size:0.78rem; display:block;">Recipient Name</span> <strong style="color:#fff;">${o.customer}</strong></div>
          <div><span style="color:var(--ad-text-muted); font-size:0.78rem; display:block;">Phone / WhatsApp</span> <span style="color:#fff;">${o.phone || '—'}</span></div>
          <div><span style="color:var(--ad-text-muted); font-size:0.78rem; display:block;">Email</span> <span style="color:#fff;">${o.email || '—'}</span></div>
          <div><span style="color:var(--ad-text-muted); font-size:0.78rem; display:block;">Payment Method</span> <span style="color:#fff;">${o.paymentMethod || 'Paid Online'}</span></div>
          <div style="grid-column: 1 / -1; margin-top:4px;"><span style="color:var(--ad-text-muted); font-size:0.78rem; display:block;">Delivery Address</span> <span style="color:#fff; line-height:1.4;">${fullAddr}</span></div>
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(212,175,55,0.2); border-radius:8px; padding:14px;">
        <h4 style="font-size:0.82rem; color:var(--ad-gold); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:10px;"><i class="fa-solid fa-gem"></i> Purchased Items</h4>
        ${itemsHtml}
        <div style="display:flex; justify-content:space-between; margin-top:12px; padding-top:10px; border-top:1px solid rgba(212,175,55,0.25); font-weight:700; font-size:1.05rem;">
          <span>Total Order Value</span>
          <span style="color:var(--ad-gold);">₹${Number(o.amount || 0).toLocaleString('en-IN')}</span>
        </div>
      </div>
    `;
  }

  if (modal) modal.classList.add('active');
};

function exportOrdersCSV() {
  const headers = ['Order ID', 'Customer', 'Product', 'Amount', 'Location', 'Date', 'Status'];
  const rows = adminOrders.map(o => [o.id, o.customer, o.product, `₹${o.amount}`, o.location, o.date, o.status]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  downloadFile('san_jewels_orders.csv', 'text/csv', csv);
  showAdminToast('Orders exported as CSV.');
}

// ============================================================
// APPOINTMENTS TABLE
// ============================================================
function renderAppointmentsTable() {
  const tbody = document.getElementById('appointmentsTableBody');
  if (!adminAppointments.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--ad-text-muted);">No appointments found.</td></tr>`;
    return;
  }
  tbody.innerHTML = adminAppointments.map(a => `
    <tr>
      <td><strong>${a.client}</strong></td>
      <td style="font-size:0.85rem; color:var(--ad-text-muted);">${a.email || '—'}</td>
      <td>${a.salon || '—'}</td>
      <td>${a.datetime || '—'}</td>
      <td>${statusBadge(a.status)}</td>
      <td>
        <div class="table-actions">
          <button class="tbl-btn" title="Confirm Appointment" onclick="confirmAppointment('${a._id || a.id || ''}')"><i class="fa-solid fa-check"></i></button>
          <button class="tbl-btn danger" title="Cancel Appointment" onclick="cancelAppointment('${a._id || a.id || ''}')"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.confirmAppointment = function(id) {
  const a = adminAppointments.find(x => (x._id || x.id) === id);
  if (!a || a.status === 'confirmed') return;
  a.status = 'confirmed';
  localStorage.setItem('san_admin_appts', JSON.stringify(adminAppointments));
  API.updateAppointment(id, { status: 'confirmed' }).catch(err => console.warn('DB appt update failed:', err.message));
  renderAppointmentsTable();
  updateDashboardStats();
  showAdminToast('Appointment confirmed.');
};

window.cancelAppointment = function(id) {
  confirmAction('Cancel this appointment?', () => {
    const a = adminAppointments.find(x => (x._id || x.id) === id);
    if (a) a.status = 'cancelled';
    localStorage.setItem('san_admin_appts', JSON.stringify(adminAppointments));
    API.updateAppointment(id, { status: 'cancelled' }).catch(err => console.warn('DB appt cancel failed:', err.message));
    renderAppointmentsTable();
    updateDashboardStats();
    showAdminToast('Appointment cancelled.');
  });
};

// ============================================================
// ANALYTICS
// ============================================================
function renderAnalytics() {
  renderDonutChart();
  renderRegionBars();
  renderMonthlyBars();
}

function renderDonutChart() {
  const svg = document.getElementById('donutSvg');
  const legend = document.getElementById('donutLegend');
  if (!svg || !legend) return;

  const cx = 100, cy = 100, r = 70, stroke = 28;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  let paths = '';
  categoryData.forEach((d, i) => {
    const dashLen = (d.pct / 100) * circumference;
    const gap = circumference - dashLen;
    paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${d.color}" stroke-width="${stroke}"
      stroke-dasharray="${dashLen} ${gap}"
      stroke-dashoffset="${-offset}"
      style="transition: stroke-dasharray 0.8s ease;"
      transform="rotate(-90 ${cx} ${cy})"></circle>`;
    offset += dashLen;
  });

  svg.innerHTML = paths + `<text x="${cx}" y="${cy}" text-anchor="middle" dy="0.35em"
    style="fill:#d4af37; font-size:18px; font-family:'Cormorant Garamond',serif; font-weight:700;">Sales</text>`;

  legend.innerHTML = categoryData.map(d => `
    <div class="donut-legend-item">
      <div class="legend-color" style="background:${d.color};"></div>
      <span>${d.label}</span>
      <span class="legend-pct">${d.pct}%</span>
    </div>
  `).join('');
}

function renderRegionBars() {
  const container = document.getElementById('regionBars');
  if (!container) return;
  container.innerHTML = regionData.map(r => `
    <div class="region-bar-row">
      <div class="region-bar-label">
        <span>${r.label}</span>
        <span style="color:var(--ad-gold);">${r.pct}%</span>
      </div>
      <div class="region-bar-track">
        <div class="region-bar-fill" style="width: ${r.pct}%;"></div>
      </div>
    </div>
  `).join('');
}

function renderMonthlyBars() {
  const container = document.getElementById('barChartArea');
  if (!container) return;
  const active = monthlyRevenue.filter(m => m.value > 0);
  const maxV = Math.max(...active.map(m => m.value));
  const currentMonth = new Date().getMonth();

  container.innerHTML = monthlyRevenue.map((m, i) => {
    const h = m.value > 0 ? Math.max(8, (m.value / maxV) * 160) : 0;
    const isHighlight = i === currentMonth - 1;
    return `
      <div class="monthly-bar">
        <div class="monthly-bar-val">${m.value > 0 ? `₹${(m.value / 1000).toFixed(0)}k` : ''}</div>
        <div class="monthly-bar-fill${isHighlight ? ' highlight' : ''}" style="height:${h}px;"></div>
        <div class="monthly-bar-label">${m.label}</div>
      </div>
    `;
  }).join('');
}

// ============================================================
// CUSTOMERS TABLE
// ============================================================
function renderCustomersTable() {
  const tbody = document.getElementById('customersTableBody');
  // Refresh from DB, then re-render
  API.getCustomers()
    .then(data => { if (Array.isArray(data) && data.length) { adminCustomers = data; localStorage.setItem('san_admin_customers', JSON.stringify(adminCustomers)); } })
    .catch(() => {})
    .finally(() => _drawCustomersTable(tbody));
}
function _drawCustomersTable(tbody) {
  if (!tbody) return;
  tbody.innerHTML = adminCustomers.map(c => {
    const cleanPhone = (c.whatsapp || '').replace(/[^0-9]/g, '');
    const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : '#';
    return `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td>
        ${c.whatsapp ? `
          <a href="${waLink}" target="_blank" class="wa-link-btn" title="Open WhatsApp Chat with ${c.name}">
            <i class="fa-brands fa-whatsapp"></i> ${c.whatsapp}
          </a>
        ` : `<span style="color:var(--ad-text-muted);">--</span>`}
      </td>
      <td style="font-size:0.85rem; color:var(--ad-text-muted);">${c.email}</td>
      <td>${c.location}</td>
      <td style="text-align:center;">${c.orders}</td>
      <td><strong>₹${c.spent.toLocaleString()}</strong></td>
      <td>${c.since}</td>
      <td>${customerBadge(c.status)}</td>
    </tr>
  `}).join('');
}

function customerBadge(status) {
  const map = { vip: 'badge-vip', active: 'badge-active', inactive: 'badge-inactive' };
  return `<span class="badge ${map[status] || ''}">${status.toUpperCase()}</span>`;
}

// ============================================================
// NEWSLETTER TABLE
// ============================================================
function renderNewsletterTable() {
  const tbody = document.getElementById('newsletterTableBody');
  // Refresh from DB
  API.getNewsletter()
    .then(data => { if (Array.isArray(data) && data.length) { newsletterSubs = data; localStorage.setItem('san_newsletter_subs', JSON.stringify(newsletterSubs)); } })
    .catch(() => {})
    .finally(() => {
      document.getElementById('nlTotalCount').textContent = newsletterSubs.length;
      tbody.innerHTML = newsletterSubs.map((s, i) => `
    <tr>
      <td style="color:var(--ad-text-dim);">${i + 1}</td>
      <td>${s.email}</td>
      <td>${s.date}</td>
      <td><span class="badge badge-active">Active</span></td>
      <td>
        <button class="tbl-btn danger" title="Unsubscribe" onclick="unsubscribeEmail('${s.email}')"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
    });
}


function unsubscribeEmail(email) {
  confirmAction(`Remove "${email}" from newsletter list?`, () => {
    newsletterSubs = newsletterSubs.filter(s => s.email !== email);
    localStorage.setItem('san_newsletter_subs', JSON.stringify(newsletterSubs));
    // Persist to DB
    API.unsubscribeNewsletter(email).catch(err => console.warn('DB unsub failed:', err.message));
    renderNewsletterTable();
    showAdminToast(`${email} removed from newsletter.`);
  });
}

function exportNewsletter() {
  const csv = ['Email,Date,Status', ...newsletterSubs.map(s => `"${s.email}","${s.date}","${s.status}"`)].join('\n');
  downloadFile('san_jewels_newsletter.csv', 'text/csv', csv);
  showAdminToast('Newsletter list exported.');
}

// ============================================================
// HELPERS
// ============================================================
function statusBadge(status) {
  const map = {
    processing: 'badge-processing',
    shipped: 'badge-shipped',
    delivered: 'badge-delivered',
    cancelled: 'badge-cancelled',
    pending: 'badge-pending',
    confirmed: 'badge-confirmed',
  };
  const icons = {
    processing: 'fa-spinner', shipped: 'fa-truck', delivered: 'fa-circle-check',
    cancelled: 'fa-ban', pending: 'fa-clock', confirmed: 'fa-check',
  };
  return `<span class="badge ${map[status] || ''}"><i class="fa-solid ${icons[status] || 'fa-circle'}"></i> ${capitalize(status)}</span>`;
}

function showAdminToast(message, icon = 'fa-circle-check') {
  adminToastMsg.textContent = message;
  adminToast.querySelector('i').className = `fa-solid ${icon}`;
  adminToast.classList.add('active');
  setTimeout(() => adminToast.classList.remove('active'), 3500);
}

function confirmAction(message, callback) {
  confirmMessage.textContent = message;
  confirmCallback = callback;
  confirmModal.classList.add('active');
}

function closeConfirmFn() {
  confirmModal.classList.remove('active');
  confirmCallback = null;
}

function downloadFile(filename, type, content) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}
