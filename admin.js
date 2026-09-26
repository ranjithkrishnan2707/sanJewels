/* ==========================================================================
   SAN JEWELS - Admin Dashboard Engine
   ========================================================================== */

// ============================================================
// ADMIN CREDENTIALS
// ============================================================
const ADMIN_CREDS = { username: 'admin', password: 'admin123' };

// ============================================================
// MOCK DATA
// ============================================================

// Products (seeded from storefront — managed here)
let adminProducts = JSON.parse(localStorage.getItem('san_admin_products')) || [
  { id: 'prod-1', name: 'The Sovereign Royal Emerald Necklace', category: 'emerald', categoryName: 'EMERALD COUTURE', price: 24500, image: 'images/emerald_necklace.jpg', tag: 'Royal Heritage', spec: '24.8 ct Colombian Emerald & 18K Solid Gold', description: 'An extraordinary haute joaillerie masterpiece featuring a rare pear-cut Colombian emerald surrounded by concentric tiers of brilliant round diamonds and hand-burnished 18K gold.' },
  { id: 'prod-2', name: 'Empress Emerald Cut Halo Ring', category: 'rings', categoryName: 'ROYAL RINGS', price: 8750, image: 'images/emerald_ring.jpg', tag: 'Bespoke Cut', spec: '3.2 ct Emerald Cut • 18K Yellow Gold', description: 'A striking emerald-cut solitaire stone cradled in a delicate diamond halo, set on a solid 18K yellow gold band with polished mirror finish.' },
  { id: 'prod-3', name: 'Crown Teardrop Emerald Earrings', category: 'earrings', categoryName: 'HIGH EARRINGS', price: 6400, image: 'images/emerald_earrings.jpg', tag: 'Signature Piece', spec: '4.5 ct Emerald Drops with Gold Leaf Clusters', description: 'Lavish chandelier dangle earrings featuring pear-shaped deep green emerald gemstones suspended from hand-sculpted gold leaf diamond clusters.' },
  { id: 'prod-4', name: 'Verdant Palace Emerald Bracelet', category: 'heritage', categoryName: 'GOLD HERITAGE', price: 14200, image: 'images/emerald_necklace.jpg', tag: '24K Artisan Gold', spec: '12.0 ct Oval Emeralds • 24K Carved Gold', description: 'Hand-carved solid gold cuff bracelet inlaid with alternating oval Zambian emeralds and micro-pave white diamond stars.' },
  { id: 'prod-5', name: 'Royal Cushion Emerald Solitaire', category: 'rings', categoryName: 'ROYAL RINGS', price: 11800, image: 'images/emerald_ring.jpg', tag: 'Single Origin', spec: '4.0 ct Cushion Emerald • Platinum 950', description: 'Sustainably mined Muzo emerald showcasing vivid green hue and high clarity, set in handcrafted Platinum 950 with hidden diamond bezel.' },
  { id: 'prod-6', name: 'Duchess Emerald Chandelier Earrings', category: 'earrings', categoryName: 'HIGH EARRINGS', price: 7900, image: 'images/emerald_earrings.jpg', tag: 'Haute Joaillerie', spec: '5.2 ct Colombian Emeralds • 18K Gold', description: 'Statement drop earrings created for red carpet galas, catching ambient light with every step with radiant golden reflections.' }
];

// Orders
let adminOrders = JSON.parse(localStorage.getItem('san_admin_orders')) || [
  { id: '#SAN-2026-001', customer: 'Lady Victoria Rothschild', product: 'The Sovereign Royal Emerald Necklace', amount: 24500, location: 'Geneva, CH', date: '2026-09-25', status: 'delivered' },
  { id: '#SAN-2026-002', customer: 'Prince Karim Al-Rashid', product: 'Royal Cushion Emerald Solitaire', amount: 11800, location: 'Dubai, UAE', date: '2026-09-24', status: 'shipped' },
  { id: '#SAN-2026-003', customer: 'Ms. Evelyn Hargrove', product: 'Empress Emerald Cut Halo Ring', amount: 8750, location: 'New York, US', date: '2026-09-24', status: 'processing' },
  { id: '#SAN-2026-004', customer: 'Mrs. Aisha Okonkwo', product: 'Crown Teardrop Emerald Earrings', amount: 6400, location: 'London, UK', date: '2026-09-23', status: 'processing' },
  { id: '#SAN-2026-005', customer: 'Maharani Sushila Rao', product: 'Verdant Palace Emerald Bracelet', amount: 14200, location: 'Jaipur, IN', date: '2026-09-22', status: 'delivered' },
  { id: '#SAN-2026-006', customer: 'Dr. Camille Fontaine', product: 'Duchess Emerald Chandelier Earrings', amount: 7900, location: 'Paris, FR', date: '2026-09-21', status: 'cancelled' },
  { id: '#SAN-2026-007', customer: 'Lady Helena Weston', product: 'The Sovereign Royal Emerald Necklace', amount: 24500, location: 'Edinburgh, UK', date: '2026-09-20', status: 'shipped' },
  { id: '#SAN-2026-008', customer: 'Ms. Sofia Andreessen', product: 'Empress Emerald Cut Halo Ring', amount: 8750, location: 'Stockholm, SE', date: '2026-09-19', status: 'delivered' },
];

// Appointments
const adminAppointments = [
  { client: 'Lady Helena Weston', email: 'h.weston@noble.co.uk', salon: 'Geneva Flagship Salon', datetime: '2026-10-02 14:00', status: 'confirmed' },
  { client: 'Mr. Antoine Beaumont', email: 'a.beaumont@atelier.fr', salon: 'Virtual Live Consultation', datetime: '2026-10-03 10:30', status: 'pending' },
  { client: 'Princess Noor Al-Hamdan', email: 'noor@alhamdan.ae', salon: 'New York Boutique', datetime: '2026-10-05 16:00', status: 'pending' },
  { client: 'Mrs. Rajni Kapoor', email: 'rajni@kapoorhomes.in', salon: 'Jaipur Heritage Palace', datetime: '2026-10-06 11:00', status: 'confirmed' },
  { client: 'Ms. Chiara Romano', email: 'c.romano@milanstyle.it', salon: 'Virtual Live Consultation', datetime: '2026-09-28 09:00', status: 'pending' },
];

// Customers
const defaultAdminCustomers = [
  { name: 'Lady Victoria Rothschild', email: 'v.rothschild@noble.ch', whatsapp: '+41 79 123 4567', location: 'Geneva, CH', orders: 4, spent: 68900, since: '2024-03', status: 'vip' },
  { name: 'Prince Karim Al-Rashid', email: 'karim@rashid-palace.ae', whatsapp: '+971 50 987 6543', location: 'Dubai, UAE', orders: 3, spent: 45300, since: '2024-06', status: 'vip' },
  { name: 'Ms. Evelyn Hargrove', email: 'evelyn@sinclair.com', whatsapp: '+1 212 555 0192', location: 'New York, US', orders: 2, spent: 17500, since: '2025-01', status: 'active' },
  { name: 'Mrs. Aisha Okonkwo', email: 'a.okonkwo@royalgroup.uk', whatsapp: '+44 7700 900123', location: 'London, UK', orders: 1, spent: 6400, since: '2025-08', status: 'active' },
  { name: 'Maharani Sushila Rao', email: 'sushila@raopalace.in', whatsapp: '+91 98290 12345', location: 'Jaipur, IN', orders: 5, spent: 89200, since: '2023-11', status: 'vip' },
  { name: 'Dr. Camille Fontaine', email: 'c.fontaine@fontaine.fr', whatsapp: '+33 6 12 34 56 78', location: 'Paris, FR', orders: 1, spent: 0, since: '2026-07', status: 'inactive' },
];

let adminCustomers = JSON.parse(localStorage.getItem('san_admin_customers')) || defaultAdminCustomers;

// Auto-fill WhatsApp numbers for existing mock records if previously stored without it
adminCustomers = adminCustomers.map(c => {
  if (!c.whatsapp) {
    const match = defaultAdminCustomers.find(d => d.name === c.name || d.email === c.email);
    if (match && match.whatsapp) {
      c.whatsapp = match.whatsapp;
    }
  }
  return c;
});
localStorage.setItem('san_admin_customers', JSON.stringify(adminCustomers));

// Newsletter Subscribers
let newsletterSubs = JSON.parse(localStorage.getItem('san_newsletter_subs')) || [
  { email: 'victoria@rothschild.ch', date: '2026-08-15', status: 'active' },
  { email: 'evelyn@sinclair.com', date: '2026-08-20', status: 'active' },
  { email: 'noor@alhamdan.ae', date: '2026-09-01', status: 'active' },
  { email: 'sushila@raopalace.in', date: '2026-07-11', status: 'active' },
  { email: 'chiara@milanstyle.it', date: '2026-09-14', status: 'active' },
  { email: 'h.weston@noble.co.uk', date: '2026-09-18', status: 'active' },
];

// Pull storefront newsletter subs
const storefrontSubs = JSON.parse(localStorage.getItem('san_newsletter')) || [];
storefrontSubs.forEach(email => {
  if (!newsletterSubs.find(s => s.email === email)) {
    newsletterSubs.push({ email, date: new Date().toISOString().split('T')[0], status: 'active' });
  }
});

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
  { label: 'Emerald Couture', pct: 38, color: '#10a87a' },
  { label: 'Royal Rings', pct: 29, color: '#d4af37' },
  { label: 'High Earrings', pct: 20, color: '#8b5cf6' },
  { label: 'Gold Heritage', pct: 13, color: '#f59e0b' },
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
let productFilterCat = 'all';
let productSearchTerm = '';
let confirmCallback = null;
let editingProductId = null;
let chartPeriod = 'weekly';

// ============================================================
// DOM
// ============================================================
const loginOverlay = document.getElementById('loginOverlay');
const loginForm    = document.getElementById('loginForm');
const loginUser    = document.getElementById('loginUser');
const loginPass    = document.getElementById('loginPass');
const loginError   = document.getElementById('loginError');
const pwToggle     = document.getElementById('pwToggle');
const sidebar      = document.getElementById('sidebar');
const mainWrapper  = document.getElementById('mainWrapper');
const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
const mobileSidebarBtn   = document.getElementById('mobileSidebarBtn');
const breadcrumb   = document.getElementById('breadcrumb');
const adminToast   = document.getElementById('adminToast');
const adminToastMsg= document.getElementById('adminToastMsg');

// Product modal
const productModal    = document.getElementById('productModal');
const productModalTitle = document.getElementById('productModalTitle');
const productForm     = document.getElementById('productForm');
const closeProductModal = document.getElementById('closeProductModal');
const cancelProductModal = document.getElementById('cancelProductModal');

// Confirm modal
const confirmModal   = document.getElementById('confirmModal');
const confirmMessage = document.getElementById('confirmMessage');
const confirmOkBtn   = document.getElementById('confirmOkBtn');
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

  // Product search & filter
  document.getElementById('productSearch').addEventListener('input', (e) => {
    productSearchTerm = e.target.value.toLowerCase();
    renderProductsTable();
  });
  document.getElementById('categoryFilter').addEventListener('change', (e) => {
    productFilterCat = e.target.value;
    renderProductsTable();
  });

  // Orders status filter
  document.querySelectorAll('.order-status-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.order-status-card').forEach(c => c.classList.remove('active-filter'));
      card.classList.add('active-filter');
      activeOrderFilter = card.getAttribute('data-filter-status');
      renderOrdersTable();
    });
  });

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
  updateDashboardStats();
  renderRevenueChart();
  renderTopProducts();
  renderRecentOrders();
}

function updateDashboardStats() {
  const totalRev = adminOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.amount, 0);

  document.getElementById('totalRevenue').textContent = `$${totalRev.toLocaleString()}`;
  document.getElementById('totalOrders').textContent = adminOrders.length;
  document.getElementById('totalProducts').textContent = adminProducts.length;
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
        <div class="chart-bar-value">$${(d.value/1000).toFixed(0)}k</div>
        <div class="chart-bar-fill" style="height: ${pct}px;" title="${d.label}: $${d.value.toLocaleString()}"></div>
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
      <div class="tp-price">$${p.price.toLocaleString()}</div>
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
      <td><strong>$${o.amount.toLocaleString()}</strong></td>
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
  const catMap = { emerald: 'EMERALD COUTURE', rings: 'ROYAL RINGS', earrings: 'HIGH EARRINGS', heritage: 'GOLD HERITAGE' };

  const filtered = adminProducts.filter(p => {
    const matchesCat = productFilterCat === 'all' || p.category === productFilterCat;
    const matchesSearch = !productSearchTerm || p.name.toLowerCase().includes(productSearchTerm) || (p.spec || '').toLowerCase().includes(productSearchTerm);
    return matchesCat && matchesSearch;
  });

  tbody.innerHTML = filtered.length === 0 ? `<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--ad-text-muted);">No products found.</td></tr>` :
    filtered.map(p => `
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
        <td><strong>$${p.price.toLocaleString()}</strong></td>
        <td>${p.tag || '—'}</td>
        <td style="max-width:200px; font-size:0.82rem; color:var(--ad-text-muted);">${(p.spec || '').slice(0, 45)}${(p.spec || '').length > 45 ? '…' : ''}</td>
        <td>
          <div class="table-actions">
            <button class="tbl-btn" title="Edit" onclick="editProduct('${p.id}')"><i class="fa-solid fa-pen"></i></button>
            <button class="tbl-btn danger" title="Delete" onclick="deleteProduct('${p.id}')"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
}

// ============================================================
// PRODUCT MODAL
// ============================================================
function openAddProductModal() {
  editingProductId = null;
  productModalTitle.textContent = 'Add New Product';
  productForm.reset();
  document.getElementById('pEditId').value = '';
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
  document.getElementById('pTag').value = p.tag || '';
  document.getElementById('pSpec').value = p.spec || '';
  document.getElementById('pDesc').value = p.description || '';
  document.getElementById('pImage').value = p.image || '';
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
  const catMap = { emerald: 'EMERALD COUTURE', rings: 'ROYAL RINGS', earrings: 'HIGH EARRINGS', heritage: 'GOLD HERITAGE' };
  const cat = document.getElementById('pCategory').value;
  const updated = {
    id: editingProductId || `prod-${Date.now()}`,
    name: document.getElementById('pName').value.trim(),
    category: cat,
    categoryName: catMap[cat] || cat.toUpperCase(),
    price: parseInt(document.getElementById('pPrice').value),
    tag: document.getElementById('pTag').value.trim(),
    spec: document.getElementById('pSpec').value.trim(),
    description: document.getElementById('pDesc').value.trim(),
    image: document.getElementById('pImage').value.trim() || 'images/emerald_necklace.jpg',
  };

  if (editingProductId) {
    const idx = adminProducts.findIndex(p => p.id === editingProductId);
    if (idx !== -1) adminProducts[idx] = updated;
    showAdminToast('Product updated successfully.');
  } else {
    adminProducts.push(updated);
    showAdminToast('Product added to the collection.');
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
  const filtered = activeOrderFilter === 'all' ? adminOrders : adminOrders.filter(o => o.status === activeOrderFilter);

  tbody.innerHTML = filtered.length === 0 ? `<tr><td colspan="8" style="text-align:center; padding:40px; color:var(--ad-text-muted);">No orders found.</td></tr>` :
    filtered.map(o => `
      <tr>
        <td><code style="color:var(--ad-gold); font-size:0.82rem;">${o.id}</code></td>
        <td>${o.customer}</td>
        <td style="max-width:180px; font-size:0.85rem;">${o.product.slice(0,30)}${o.product.length>30?'…':''}</td>
        <td><strong>$${o.amount.toLocaleString()}</strong></td>
        <td>${o.location}</td>
        <td>${o.date}</td>
        <td>${statusBadge(o.status)}</td>
        <td>
          <div class="table-actions">
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
    renderOrdersTable();
    renderOrderStatusCounts();
    showAdminToast(`Order ${id} cancelled.`);
  });
}

function exportOrdersCSV() {
  const headers = ['Order ID', 'Customer', 'Product', 'Amount', 'Location', 'Date', 'Status'];
  const rows = adminOrders.map(o => [o.id, o.customer, o.product, `$${o.amount}`, o.location, o.date, o.status]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  downloadFile('san_jewels_orders.csv', 'text/csv', csv);
  showAdminToast('Orders exported as CSV.');
}

// ============================================================
// APPOINTMENTS TABLE
// ============================================================
function renderAppointmentsTable() {
  const tbody = document.getElementById('appointmentsTableBody');
  tbody.innerHTML = adminAppointments.map(a => `
    <tr>
      <td><strong>${a.client}</strong></td>
      <td style="font-size:0.85rem; color:var(--ad-text-muted);">${a.email}</td>
      <td>${a.salon}</td>
      <td>${a.datetime}</td>
      <td>${statusBadge(a.status)}</td>
      <td>
        <div class="table-actions">
          <button class="tbl-btn" title="Confirm"><i class="fa-solid fa-check"></i></button>
          <button class="tbl-btn danger" title="Cancel"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

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
        <div class="monthly-bar-val">${m.value > 0 ? `$${(m.value/1000).toFixed(0)}k` : ''}</div>
        <div class="monthly-bar-fill${isHighlight?' highlight':''}" style="height:${h}px;"></div>
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
  // Re-read from localStorage in case a new visitor just joined on storefront
  adminCustomers = JSON.parse(localStorage.getItem('san_admin_customers')) || adminCustomers;
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
      <td><strong>$${c.spent.toLocaleString()}</strong></td>
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
}

function unsubscribeEmail(email) {
  confirmAction(`Remove "${email}" from newsletter list?`, () => {
    newsletterSubs = newsletterSubs.filter(s => s.email !== email);
    localStorage.setItem('san_newsletter_subs', JSON.stringify(newsletterSubs));
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
