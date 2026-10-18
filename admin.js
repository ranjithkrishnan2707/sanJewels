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
// Seed data is NEVER used — DB is the source of truth.
// ============================================================

// Clear any leftover legacy dummy/test records from localStorage
try {
  localStorage.removeItem('san_admin_orders');
  localStorage.removeItem('san_admin_customers');
  localStorage.removeItem('san_admin_appts');
  localStorage.removeItem('san_newsletter_subs');
  localStorage.removeItem('san_admin_products');
} catch (e) {}

let adminProducts  = [];
let adminCategories = window.DEFAULT_CATEGORIES || [];
let adminOrders    = [];
let adminCustomers = [];
let adminAppointments = [];
let newsletterSubs = [];

// Billing history state
let activeBillingFilter = 'all';
let billingSearchTerm = '';
let billingSortOption = 'newest';

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
    if (Array.isArray(products))     { adminProducts     = products;     localStorage.setItem('san_admin_products',  JSON.stringify(adminProducts));     }
    if (Array.isArray(orders))       { adminOrders       = orders;       localStorage.setItem('san_admin_orders',    JSON.stringify(adminOrders));       }
    if (Array.isArray(customers))    { adminCustomers    = customers;    localStorage.setItem('san_admin_customers', JSON.stringify(adminCustomers));    }
    if (Array.isArray(appointments)) { adminAppointments = appointments; localStorage.setItem('san_admin_appts',     JSON.stringify(adminAppointments)); }
    if (Array.isArray(newsletter))   { newsletterSubs    = newsletter;   localStorage.setItem('san_newsletter_subs', JSON.stringify(newsletterSubs));   }
    console.log('✅ Admin data loaded from MongoDB Atlas.');
  } catch (err) {
    console.warn('⚠️ Could not load from DB, using local cache.', err.message);
  }
}

// Dynamic weekly revenue computed from real orders
function getWeeklyRevenue() {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const map = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  
  const now = new Date();
  const currentDay = now.getDay();
  const diffToMon = (currentDay === 0 ? -6 : 1) - currentDay;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() + diffToMon);
  startOfWeek.setHours(0, 0, 0, 0);

  adminOrders.forEach(o => {
    if (o.status === 'cancelled') return;
    const d = new Date(o.date || o.createdAt);
    if (!isNaN(d) && d >= startOfWeek) {
      const name = dayNames[d.getDay()];
      if (map[name] !== undefined) {
        map[name] += Number(o.amount || 0);
      }
    }
  });

  return days.map(label => ({ label, value: map[label] }));
}

// Dynamic monthly revenue computed from real orders
function getMonthlyRevenue() {
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const map = Array(12).fill(0);
  const currentYear = new Date().getFullYear();

  adminOrders.forEach(o => {
    if (o.status === 'cancelled') return;
    const d = new Date(o.date || o.createdAt);
    if (!isNaN(d) && d.getFullYear() === currentYear) {
      map[d.getMonth()] += Number(o.amount || 0);
    }
  });

  return monthLabels.map((label, idx) => ({ label, value: map[idx] }));
}

// Dynamic category distribution computed from real orders / active products
function getCategoryData() {
  const counts = {};
  adminOrders.forEach(o => {
    if (o.status === 'cancelled') return;
    if (Array.isArray(o.items) && o.items.length) {
      o.items.forEach(it => {
        const cat = it.category || it.categoryName || 'Jewels';
        counts[cat] = (counts[cat] || 0) + (it.qty || 1);
      });
    } else if (o.product) {
      counts['Jewels'] = (counts['Jewels'] || 0) + 1;
    }
  });

  if (Object.keys(counts).length === 0 && adminProducts.length) {
    adminProducts.forEach(p => {
      const cat = p.categoryName || getCategoryLabel(p.category) || 'Jewels';
      counts[cat] = (counts[cat] || 0) + 1;
    });
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return [];

  const palette = ['#10a87a', '#d4af37', '#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899'];
  return Object.keys(counts).map((label, idx) => ({
    label,
    pct: Math.round((counts[label] / total) * 100),
    color: palette[idx % palette.length]
  }));
}

// Dynamic regional distribution computed from real orders
function getRegionData() {
  const counts = {};
  adminOrders.forEach(o => {
    if (o.status === 'cancelled') return;
    const loc = (o.state || o.city || o.location || 'Online').split(',')[0].trim();
    if (loc) {
      counts[loc] = (counts[loc] || 0) + 1;
    }
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return [];

  return Object.keys(counts).map(label => ({
    label,
    pct: Math.round((counts[label] / total) * 100)
  }));
}

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
  renderCategoryControls();

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
  document.getElementById('categoryForm').addEventListener('submit', addCategory);
  closeProductModal.addEventListener('click', closeProductModalFn);
  cancelProductModal.addEventListener('click', closeProductModalFn);
  productForm.addEventListener('submit', saveProduct);

  const saveProductBtn = document.getElementById('saveProductBtn');
  if (saveProductBtn) {
    saveProductBtn.addEventListener('click', (e) => {
      if (!productForm.checkValidity()) {
        productForm.reportValidity();
      }
    });
  }

  // Backdrop click to close product modal
  if (productModal) {
    productModal.addEventListener('click', (e) => {
      if (e.target === productModal) closeProductModalFn();
    });
  }

  // Escape key to close product modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && productModal && productModal.classList.contains('active')) {
      closeProductModalFn();
    }
  });

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

  // Billing Invoice modal controls
  const billingInvoiceModal = document.getElementById('billingInvoiceModal');
  const closeBillingInvoiceModal = document.getElementById('closeBillingInvoiceModal');
  const dismissBillingInvoiceModal = document.getElementById('dismissBillingInvoiceModal');
  if (closeBillingInvoiceModal) {
    closeBillingInvoiceModal.addEventListener('click', () => {
      if (billingInvoiceModal) billingInvoiceModal.classList.remove('active');
    });
  }
  if (dismissBillingInvoiceModal) {
    dismissBillingInvoiceModal.addEventListener('click', () => {
      if (billingInvoiceModal) billingInvoiceModal.classList.remove('active');
    });
  }
  if (billingInvoiceModal) {
    billingInvoiceModal.addEventListener('click', (e) => {
      if (e.target === billingInvoiceModal) billingInvoiceModal.classList.remove('active');
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

  // Product Image File Reader with Auto-Compression
  const pImageFile = document.getElementById('pImageFile');
  if (pImageFile) {
    pImageFile.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          const img = new Image();
          img.onload = function() {
            const maxDim = 800;
            let width = img.width;
            let height = img.height;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const optimized = canvas.toDataURL('image/jpeg', 0.82);
            document.getElementById('pImage').value = optimized;
            const preview = document.getElementById('pImagePreview');
            preview.src = optimized;
            preview.style.display = 'block';
          };
          img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // ── Hero Image Customizer ──────────────────────────────────────────
  function initHeroImageManager() {
    const heroImageFile     = document.getElementById('heroImageFile');
    const heroImageUrlInput = document.getElementById('heroImageUrlInput');
    const applyHeroUrlBtn   = document.getElementById('applyHeroUrlBtn');
    const saveHeroImageBtn  = document.getElementById('saveHeroImageBtn');
    const resetHeroImageBtn = document.getElementById('resetHeroImageBtn');
    const heroImagePreview  = document.getElementById('heroImagePreview');
    const heroImageBadge    = document.getElementById('heroImageBadge');
    const heroStatusText    = document.getElementById('heroStatusText');

    if (!heroImagePreview) return;

    const defaultHeroSrc = 'images/emerald_necklace.jpg';

    function setHeroUIState(imageUrl, isCustom) {
      if (heroImagePreview) heroImagePreview.src = imageUrl || defaultHeroSrc;
      if (heroImageBadge) {
        if (isCustom) {
          heroImageBadge.textContent = 'Custom Hero Active';
          heroImageBadge.style.background = 'rgba(16, 185, 129, 0.15)';
          heroImageBadge.style.color = '#10b981';
          heroImageBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        } else {
          heroImageBadge.textContent = 'Default Image';
          heroImageBadge.style.background = 'rgba(212,175,55,0.15)';
          heroImageBadge.style.color = 'var(--ad-gold)';
          heroImageBadge.style.borderColor = 'rgba(212,175,55,0.3)';
        }
      }
      if (heroStatusText) {
        heroStatusText.textContent = isCustom
          ? 'Custom Hero Image is currently published and live on the storefront.'
          : 'Default Colombian Royal Emerald Necklace is currently active.';
      }
    }

    // 1. Initial Load: Check localStorage and sync with backend API
    const localHero = localStorage.getItem('san_hero_image');
    if (localHero) {
      setHeroUIState(localHero, true);
      if (heroImageUrlInput && !localHero.startsWith('data:')) {
        heroImageUrlInput.value = localHero;
      }
    } else {
      setHeroUIState(defaultHeroSrc, false);
    }

    // Fetch from backend API (MongoDB / Server)
    if (typeof API !== 'undefined' && API.getSetting) {
      API.getSetting('hero_image').then(data => {
        if (data && data.value) {
          localStorage.setItem('san_hero_image', data.value);
          setHeroUIState(data.value, true);
          if (heroImageUrlInput && !data.value.startsWith('data:')) {
            heroImageUrlInput.value = data.value;
          }
        } else if (data && data.value === null && localHero) {
          localStorage.removeItem('san_hero_image');
          setHeroUIState(defaultHeroSrc, false);
        }
      }).catch(err => console.warn('Could not fetch hero image setting:', err));
    }

    // 2. Upload from Device
    if (heroImageFile) {
      heroImageFile.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async function(evt) {
            const base64Image = evt.target.result;
            setHeroUIState(base64Image, true);
            localStorage.setItem('san_hero_image', base64Image);
            if (typeof API !== 'undefined' && API.saveSetting) {
              await API.saveSetting('hero_image', base64Image);
            }
            showToast('Hero image updated successfully from device! Published to storefront.');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // 3. Apply via URL
    if (applyHeroUrlBtn && heroImageUrlInput) {
      applyHeroUrlBtn.addEventListener('click', async function() {
        const url = heroImageUrlInput.value.trim();
        if (!url) {
          showToast('Please enter a valid image URL.');
          return;
        }
        setHeroUIState(url, true);
        localStorage.setItem('san_hero_image', url);
        if (typeof API !== 'undefined' && API.saveSetting) {
          await API.saveSetting('hero_image', url);
        }
        showToast('Hero image URL applied and published to storefront!');
      });
    }

    // 4. Save & Publish Button
    if (saveHeroImageBtn) {
      saveHeroImageBtn.addEventListener('click', async function() {
        const urlVal = heroImageUrlInput ? heroImageUrlInput.value.trim() : '';
        const currentSrc = heroImagePreview ? heroImagePreview.src : '';

        if (urlVal) {
          setHeroUIState(urlVal, true);
          localStorage.setItem('san_hero_image', urlVal);
          if (typeof API !== 'undefined' && API.saveSetting) {
            await API.saveSetting('hero_image', urlVal);
          }
          showToast('Hero image saved & published successfully!');
        } else if (currentSrc && !currentSrc.includes(defaultHeroSrc)) {
          localStorage.setItem('san_hero_image', currentSrc);
          if (typeof API !== 'undefined' && API.saveSetting) {
            await API.saveSetting('hero_image', currentSrc);
          }
          showToast('Hero image published to storefront!');
        } else {
          showToast('Please select an image file or enter an image URL first.');
        }
      });
    }

    // 5. Reset to Default Button
    if (resetHeroImageBtn) {
      resetHeroImageBtn.addEventListener('click', async function() {
        if (confirm('Are you sure you want to reset the hero image to the default Royal Emerald Necklace?')) {
          localStorage.removeItem('san_hero_image');
          if (typeof API !== 'undefined' && API.deleteSetting) {
            await API.deleteSetting('hero_image');
          }
          if (heroImageFile) heroImageFile.value = '';
          if (heroImageUrlInput) heroImageUrlInput.value = '';
          setHeroUIState(defaultHeroSrc, false);
          showToast('Hero image reset to default successfully!');
        }
      });
    }
  }
  initHeroImageManager();

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

  // Billing status filter
  document.querySelectorAll('.billing-filter-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.billing-filter-card').forEach(c => c.classList.remove('active-filter'));
      card.classList.add('active-filter');
      activeBillingFilter = card.getAttribute('data-billing-status');
      renderBillingTable();
    });
  });

  // Billing search
  const billingSearchEl = document.getElementById('billingSearch');
  if (billingSearchEl) {
    billingSearchEl.addEventListener('input', (e) => {
      billingSearchTerm = e.target.value.toLowerCase().trim();
      renderBillingTable();
    });
  }

  // Billing sort
  const billingSortEl = document.getElementById('billingSortSelect');
  if (billingSortEl) {
    billingSortEl.addEventListener('change', (e) => {
      billingSortOption = e.target.value;
      renderBillingTable();
    });
  }

  // Export billing
  const exportBillingBtn = document.getElementById('exportBillingBtn');
  if (exportBillingBtn) {
    exportBillingBtn.addEventListener('click', exportBillingCSV);
  }

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
  billing: 'fa-file-invoice-dollar',
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
  billing: 'Billing History',
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
    case 'billing': renderBillingTable(); renderBillingStatusCounts(); break;
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
  Promise.all([loadAllDataFromDB(), loadCategoriesFromDB()]).then(() => {
    updateDashboardStats();
    renderRevenueChart();
    renderTopProducts();
    renderRecentOrders();
    renderBillingStatusCounts();
  });
}

async function loadCategoriesFromDB() {
  try {
    adminCategories = await API.getCategories();
    renderCategoryControls();
    renderProductsTable();
  } catch (err) {
    console.warn('Could not load product categories from the server.', err.message);
    showAdminToast('Could not load categories: ' + err.message, 'fa-exclamation-circle');
  }
}

function renderCategoryControls() {
  const productCategory = document.getElementById('pCategory');
  const categoryFilter = document.getElementById('categoryFilter');
  const selectedProductCategory = productCategory.value;
  const selectedFilter = categoryFilter.value;

  productCategory.replaceChildren();
  adminCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.label;
    productCategory.appendChild(option);
  });

  categoryFilter.replaceChildren(new Option('All Categories', 'all'));
  adminCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.label;
    categoryFilter.appendChild(option);
  });

  if (adminCategories.some(category => category.id === selectedProductCategory)) {
    productCategory.value = selectedProductCategory;
  }
  if (adminCategories.some(category => category.id === selectedFilter)) {
    categoryFilter.value = selectedFilter;
  } else {
    categoryFilter.value = 'all';
    productFilterCat = 'all';
  }
}

async function addCategory(e) {
  e.preventDefault();
  const input = document.getElementById('newCategoryName');
  const name = input.value.trim();
  if (!name) return;

  try {
    const result = await API.addCategory(name);
    if (!result.success || !Array.isArray(result.categories)) {
      throw new Error('The server did not confirm the category save.');
    }
    adminCategories = result.categories;
    renderCategoryControls();
    renderProductsTable();
    input.value = '';
    showAdminToast('Category added successfully.', 'fa-circle-check');
  } catch (err) {
    showAdminToast(err.message, 'fa-exclamation-circle');
  }
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

  // Sync navigation & topbar badges
  const updateBadge = (id, count) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-block' : 'none';
    }
  };
  updateBadge('ordersNavBadge', adminOrders.length);
  updateBadge('billingNavBadge', adminOrders.length);
  updateBadge('apptsNavBadge', pendingAppts);
  updateBadge('topbarNotifBadge', pendingAppts + processing);
}

// ============================================================
// REVENUE CHART (Pure CSS/HTML bar chart)
// ============================================================
function renderRevenueChart() {
  const weekly = getWeeklyRevenue();
  const monthly = getMonthlyRevenue();
  const data = chartPeriod === 'weekly' ? weekly : monthly;
  const maxVal = Math.max(1, ...data.map(d => d.value));
  const container = document.getElementById('revenueChart');
  if (!container) return;

  container.innerHTML = data.map(d => {
    const pct = d.value > 0 ? Math.max(8, (d.value / maxVal) * 160) : 4;
    const displayVal = d.value >= 1000 ? `₹${(d.value / 1000).toFixed(1)}k` : (d.value > 0 ? `₹${d.value}` : '');
    return `
      <div class="chart-bar-group">
        <div class="chart-bar-value">${displayVal}</div>
        <div class="chart-bar-fill" style="height: ${pct}px; opacity: ${d.value > 0 ? '1' : '0.25'};" title="${d.label}: ₹${d.value.toLocaleString()}"></div>
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
  if (!list) return;
  if (!adminProducts || adminProducts.length === 0) {
    list.innerHTML = `<div style="text-align:center; padding:24px; color:var(--ad-text-muted); font-size:0.85rem;">No products added yet.</div>`;
    return;
  }
  const sorted = [...adminProducts].sort((a, b) => b.price - a.price).slice(0, 5);
  list.innerHTML = sorted.map((p, i) => `
    <div class="top-product-item">
      <div class="tp-rank ${rankClasses[i]}">${i + 1}</div>
      <div class="tp-info">
        <div class="tp-name">${p.name}</div>
        <div class="tp-cat">${p.categoryName || getCategoryLabel(p.category)}</div>
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
  if (!tbody) return;
  if (!adminOrders || adminOrders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--ad-text-muted);">No orders recorded yet.</td></tr>`;
    return;
  }
  const recent = adminOrders.slice(0, 5);
  tbody.innerHTML = recent.map(o => `
    <tr>
      <td><code style="color:var(--ad-gold); font-size:0.82rem;">${o.id}</code></td>
      <td>${o.customer}</td>
      <td>${o.product.slice(0, 32)}${o.product.length > 32 ? '…' : ''}</td>
      <td><strong>₹${Number(o.amount || 0).toLocaleString()}</strong></td>
      <td>${o.date}</td>
      <td>${statusBadge(o.status)}</td>
    </tr>
  `).join('');
}

// ============================================================
// PRODUCTS TABLE
// ============================================================
function getCategoryLabel(categoryId) {
  const category = adminCategories.find(item => item.id === categoryId);
  return category ? category.label.toUpperCase() : categoryId;
}

function renderProductsTable() {
  const tbody = document.getElementById('productsTableBody');

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
        <td><span class="badge badge-confirmed">${getCategoryLabel(p.category)}</span></td>
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
  if (productModal) productModal.classList.remove('active');
  if (productForm) productForm.reset();
  editingProductId = null;
  const pEditId = document.getElementById('pEditId');
  if (pEditId) pEditId.value = '';
  const pImage = document.getElementById('pImage');
  if (pImage) pImage.value = '';
  const pImageFile = document.getElementById('pImageFile');
  if (pImageFile) pImageFile.value = '';
  const pImagePreview = document.getElementById('pImagePreview');
  if (pImagePreview) {
    pImagePreview.src = '';
    pImagePreview.style.display = 'none';
  }
}

async function saveProduct(e) {
  if (e) e.preventDefault();

  const nameInput = document.getElementById('pName');
  const catInput = document.getElementById('pCategory');
  const priceInput = document.getElementById('pPrice');

  const pName = nameInput ? nameInput.value.trim() : '';
  const cat = catInput ? catInput.value : adminCategories[0]?.id;
  const priceVal = priceInput ? priceInput.value.trim() : '';
  const pPrice = parseInt(priceVal, 10);

  if (!pName) {
    if (nameInput) nameInput.focus();
    showAdminToast('Please enter a product name.', 'fa-exclamation-circle');
    return;
  }

  if (isNaN(pPrice) || pPrice < 0) {
    if (priceInput) priceInput.focus();
    showAdminToast('Please enter a valid price.', 'fa-exclamation-circle');
    return;
  }

  const tagInput = document.getElementById('pTag');
  const specInput = document.getElementById('pSpec');
  const descInput = document.getElementById('pDesc');
  const imageInput = document.getElementById('pImage');
  const stockInput = document.getElementById('pStock');

  const updated = {
    id: editingProductId || `prod-${Date.now()}`,
    name: pName,
    category: cat,
    categoryName: getCategoryLabel(cat),
    price: pPrice,
    stock: stockInput ? (parseInt(stockInput.value, 10) || 0) : 10,
    tag: tagInput ? tagInput.value.trim() : '',
    spec: specInput ? specInput.value.trim() : '',
    description: descInput ? descInput.value.trim() : '',
    image: (imageInput && imageInput.value.trim()) ? imageInput.value.trim() : 'images/emerald_necklace.jpg',
  };

  const isEditing = Boolean(editingProductId);
  const targetId = editingProductId;

  // Persist first so a failed request is not presented as a saved catalog item.
  try {
    let result;
    if (isEditing) {
      result = await API.updateProduct(targetId, updated);
    } else {
      result = await API.saveProduct(updated);
    }
    if (!result.success || !result.product) {
      throw new Error('The server did not confirm the product save.');
    }
    const savedProduct = result.product;

    if (isEditing) {
      const idx = adminProducts.findIndex(p => p.id === targetId);
      if (idx !== -1) adminProducts[idx] = savedProduct;
    } else {
      adminProducts.unshift(savedProduct);
    }

    try {
      localStorage.setItem('san_admin_products', JSON.stringify(adminProducts));
    } catch (storageErr) {
      console.warn('Local storage write warning:', storageErr);
    }

    closeProductModalFn();
    renderProductsTable();
    renderTopProducts();
    updateDashboardStats();
    showAdminToast(isEditing ? 'Product updated successfully.' : 'Product saved & added to catalog.');
  } catch (apiErr) {
    console.error('Backend DB sync error:', apiErr);
    showAdminToast(`Product could not be saved: ${apiErr.message}`, 'fa-exclamation-circle');
  }
}

function deleteProduct(id) {
  const p = adminProducts.find(x => x.id === id);
  confirmAction(`Delete "${p ? p.name : id}"? This cannot be undone.`, async () => {
    try {
      const result = await API.deleteProduct(id);
      if (!result.success) {
        throw new Error('The server did not confirm the product deletion.');
      }

      adminProducts = adminProducts.filter(x => x.id !== id);
      try {
        localStorage.setItem('san_admin_products', JSON.stringify(adminProducts));
      } catch (storageErr) {
        console.warn('Local storage write warning:', storageErr);
      }
      renderProductsTable();
      renderTopProducts();
      updateDashboardStats();
      showAdminToast('Product deleted from collection.');
    } catch (apiErr) {
      console.error('Backend DB delete error:', apiErr);
      showAdminToast(`Product could not be deleted: ${apiErr.message}`, 'fa-exclamation-circle');
    }
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
// BILLING HISTORY & INVOICE MANAGEMENT
// ============================================================

function getOrderBilling(order) {
  if (!order) return null;

  // 1. Order ID
  const orderId = order.id || '#SAN-ORD-000';

  // 2. Customer Name
  const customerName = order.customer || 'Valued Customer';

  // 3. Phone Number
  let phone = order.phone || '';
  if (!phone && adminCustomers && Array.isArray(adminCustomers)) {
    const matched = adminCustomers.find(c => c.name && c.name.toLowerCase() === customerName.toLowerCase());
    if (matched && (matched.whatsapp || matched.phone)) {
      phone = matched.whatsapp || matched.phone;
    }
  }
  if (!phone) phone = '+91 98290 12345';

  // 4. Product Name
  let productName = order.product || '';
  if (!productName && order.items && Array.isArray(order.items) && order.items.length) {
    productName = order.items.map(i => i.name).join(', ');
  }
  if (!productName) productName = '18K Anti-Tarnish Jewel';

  // 5. Quantity (Qty)
  let qty = order.qty;
  if (!qty || isNaN(qty)) {
    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      qty = order.items.reduce((sum, item) => sum + (Number(item.qty || item.quantity) || 1), 0);
    } else {
      qty = 1;
    }
  } else {
    qty = Number(qty);
  }

  // 8. Delivery Charge
  let deliveryCharge = order.deliveryCharge;
  if (deliveryCharge === undefined || deliveryCharge === null || isNaN(deliveryCharge)) {
    if (order.shipping !== undefined && order.shipping !== null) {
      deliveryCharge = Number(order.shipping);
    } else {
      deliveryCharge = (Number(order.amount || 0) >= 2500) ? 0 : 199;
    }
  } else {
    deliveryCharge = Number(deliveryCharge);
  }

  // 7. Selling Price
  let sellingPrice = order.sellingPrice;
  if (sellingPrice === undefined || sellingPrice === null || isNaN(sellingPrice)) {
    if (order.subtotal !== undefined && order.subtotal !== null) {
      sellingPrice = Number(order.subtotal);
    } else if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      sellingPrice = order.items.reduce((sum, item) => sum + ((Number(item.sellingPrice || item.price) || 0) * (Number(item.qty || item.quantity) || 1)), 0);
    } else if (order.amount) {
      sellingPrice = Math.max(0, Number(order.amount) - deliveryCharge);
    } else {
      sellingPrice = 1250;
    }
  } else {
    sellingPrice = Number(sellingPrice);
  }

  // 6. Actual Price (MRP before discount)
  let actualPrice = order.actualPrice;
  if (actualPrice === undefined || actualPrice === null || isNaN(actualPrice)) {
    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      actualPrice = order.items.reduce((sum, item) => {
        const itemActual = item.actualPrice || Math.round((Number(item.sellingPrice || item.price) || 0) * 1.25);
        return sum + (Number(itemActual) * (Number(item.qty || item.quantity) || 1));
      }, 0);
    } else {
      actualPrice = Math.round(sellingPrice * 1.25);
    }
  } else {
    actualPrice = Number(actualPrice);
  }

  // 9. Total Value
  let totalValue = order.totalValue;
  if (totalValue === undefined || totalValue === null || isNaN(totalValue)) {
    totalValue = order.amount !== undefined ? Number(order.amount) : (sellingPrice + deliveryCharge);
  } else {
    totalValue = Number(totalValue);
  }

  // 10. Delivery Address
  let deliveryAddress = order.deliveryAddress;
  if (!deliveryAddress) {
    if (order.address) {
      const parts = [order.address, order.city, order.state].filter(Boolean);
      let addr = parts.join(', ');
      if (order.pincode) addr += ` - ${order.pincode}`;
      deliveryAddress = addr;
    } else if (order.location) {
      deliveryAddress = order.location;
    } else {
      deliveryAddress = 'India (Standard Insured Delivery)';
    }
  }

  return {
    id: orderId,
    customer: customerName,
    phone: phone,
    email: order.email || '',
    product: productName,
    qty: qty,
    actualPrice: actualPrice,
    sellingPrice: sellingPrice,
    deliveryCharge: deliveryCharge,
    totalValue: totalValue,
    deliveryAddress: deliveryAddress,
    date: order.date || new Date().toISOString().split('T')[0],
    status: order.status || 'processing',
    paymentMethod: order.paymentMethod || 'UPI / Online',
    items: (order.items && Array.isArray(order.items) && order.items.length) ? order.items : [
      { name: productName, qty: qty, actualPrice: actualPrice, sellingPrice: sellingPrice, price: sellingPrice }
    ]
  };
}

function renderBillingTable() {
  const tbody = document.getElementById('billingTableBody');
  if (!tbody) return;

  let bills = adminOrders.map(o => getOrderBilling(o));

  // Filter by status
  if (activeBillingFilter !== 'all') {
    bills = bills.filter(b => b.status === activeBillingFilter);
  }

  // Filter by search term
  if (billingSearchTerm) {
    bills = bills.filter(b =>
      b.id.toLowerCase().includes(billingSearchTerm) ||
      b.customer.toLowerCase().includes(billingSearchTerm) ||
      b.phone.toLowerCase().includes(billingSearchTerm) ||
      b.product.toLowerCase().includes(billingSearchTerm) ||
      b.deliveryAddress.toLowerCase().includes(billingSearchTerm)
    );
  }

  // Sorting
  bills.sort((a, b) => {
    if (billingSortOption === 'newest') return (b.date || '').localeCompare(a.date || '');
    if (billingSortOption === 'oldest') return (a.date || '').localeCompare(b.date || '');
    if (billingSortOption === 'highest') return b.totalValue - a.totalValue;
    if (billingSortOption === 'lowest') return a.totalValue - b.totalValue;
    return 0;
  });

  if (bills.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:45px 20px; color:var(--ad-text-muted); font-size:0.92rem;"><i class="fa-solid fa-receipt" style="font-size:1.8rem; display:block; margin-bottom:10px; opacity:0.4;"></i>No billing records found matching criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = bills.map(b => {
    const rawDigits = b.phone.replace(/[^0-9+]/g, '');
    const cleanAddress = b.deliveryAddress.replace(/"/g, '&quot;');
    const cleanProduct = b.product.replace(/"/g, '&quot;');

    return `
      <tr>
        <td>
          <span class="billing-order-tag" onclick="viewBillingInvoice('${b.id}')" title="Click to view &amp; print Tax Invoice">
            <i class="fa-solid fa-file-invoice" style="margin-right:4px;"></i>${b.id}
          </span>
        </td>
        <td>
          <div class="billing-customer">
            <span class="billing-avatar-icon"><i class="fa-solid fa-user"></i></span>
            <div>
              <strong style="color:#fff; display:block;">${b.customer}</strong>
              <span style="font-size:0.74rem; color:var(--ad-text-muted);">${b.date}</span>
            </div>
          </div>
        </td>
        <td>
          <a href="https://wa.me/${rawDigits.replace(/\+/g, '')}" target="_blank" class="billing-phone-link" title="WhatsApp / Call Client">
            <i class="fa-brands fa-whatsapp"></i> ${b.phone}
          </a>
        </td>
        <td>
          <div class="billing-product-cell" title="${cleanProduct}">
            <span class="billing-product-title">${b.product}</span>
          </div>
        </td>
        <td style="text-align:center;">
          <span class="billing-qty-badge">${b.qty}</span>
        </td>
        <td style="text-align:right;">
          <span class="billing-actual-price">₹${Number(b.actualPrice).toLocaleString('en-IN')}</span>
        </td>
        <td style="text-align:right;">
          <span class="billing-selling-price">₹${Number(b.sellingPrice).toLocaleString('en-IN')}</span>
        </td>
        <td style="text-align:right;">
          ${b.deliveryCharge === 0 ? '<span class="billing-delivery-free"><i class="fa-solid fa-gift"></i> FREE</span>' : `<span class="billing-delivery-fee">₹${Number(b.deliveryCharge).toLocaleString('en-IN')}</span>`}
        </td>
        <td style="text-align:right;">
          <strong class="billing-total-value">₹${Number(b.totalValue).toLocaleString('en-IN')}</strong>
        </td>
        <td>
          <div class="billing-address-cell" title="${cleanAddress}">
            <i class="fa-solid fa-location-dot"></i>
            <span>${b.deliveryAddress}</span>
          </div>
        </td>
        <td style="text-align:center;">
          <button class="tbl-btn" title="View &amp; Print Tax Invoice" onclick="viewBillingInvoice('${b.id}')">
            <i class="fa-solid fa-file-invoice"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderBillingStatusCounts() {
  const allBills = adminOrders.map(o => getOrderBilling(o));

  // Count pills
  const countAll = document.getElementById('billingCountAll');
  if (countAll) countAll.textContent = allBills.length;

  const countDelivered = document.getElementById('billingCountDelivered');
  if (countDelivered) countDelivered.textContent = allBills.filter(b => b.status === 'delivered').length;

  const countProcessing = document.getElementById('billingCountProcessing');
  if (countProcessing) countProcessing.textContent = allBills.filter(b => b.status === 'processing').length;

  const countShipped = document.getElementById('billingCountShipped');
  if (countShipped) countShipped.textContent = allBills.filter(b => b.status === 'shipped').length;

  const countCancelled = document.getElementById('billingCountCancelled');
  if (countCancelled) countCancelled.textContent = allBills.filter(b => b.status === 'cancelled').length;

  // Sidebar badge
  const billingNavBadge = document.getElementById('billingNavBadge');
  if (billingNavBadge) {
    billingNavBadge.textContent = allBills.length;
    billingNavBadge.style.display = allBills.length > 0 ? 'inline-block' : 'none';
  }

  const ordersNavBadge = document.getElementById('ordersNavBadge');
  if (ordersNavBadge) {
    ordersNavBadge.textContent = adminOrders.length;
    ordersNavBadge.style.display = adminOrders.length > 0 ? 'inline-block' : 'none';
  }

  // KPI Metrics
  const totalCountEl = document.getElementById('billingTotalCount');
  if (totalCountEl) totalCountEl.textContent = allBills.length;

  const grossActual = allBills.reduce((s, b) => s + (b.actualPrice || 0), 0);
  const totalSelling = allBills.reduce((s, b) => s + (b.sellingPrice || 0), 0);
  const totalDelivery = allBills.reduce((s, b) => s + (b.deliveryCharge || 0), 0);
  const grandTotal = allBills.reduce((s, b) => s + (b.totalValue || 0), 0);

  const grossActualEl = document.getElementById('billingGrossActual');
  if (grossActualEl) grossActualEl.textContent = '₹' + grossActual.toLocaleString('en-IN');

  const totalSellingEl = document.getElementById('billingTotalSelling');
  if (totalSellingEl) totalSellingEl.textContent = '₹' + totalSelling.toLocaleString('en-IN');

  const totalDeliveryEl = document.getElementById('billingTotalDelivery');
  if (totalDeliveryEl) totalDeliveryEl.textContent = '₹' + totalDelivery.toLocaleString('en-IN');

  const totalValueEl = document.getElementById('billingTotalValue');
  if (totalValueEl) totalValueEl.textContent = '₹' + grandTotal.toLocaleString('en-IN');
}

function exportBillingCSV() {
  const headers = [
    'Order ID',
    'Customer Name',
    'Phone Number',
    'Product Name',
    'Qty',
    'Actual Price',
    'Selling Price',
    'Delivery Charge',
    'Total Value',
    'Delivery Address',
    'Date',
    'Status'
  ];
  const rows = adminOrders.map(o => {
    const b = getOrderBilling(o);
    return [
      b.id,
      b.customer,
      b.phone,
      b.product,
      b.qty,
      b.actualPrice,
      b.sellingPrice,
      b.deliveryCharge,
      b.totalValue,
      b.deliveryAddress,
      b.date,
      b.status
    ];
  });
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
  downloadFile('san_jewels_billing_history.csv', 'text/csv', csv);
  showAdminToast('Billing history exported as CSV successfully.');
}

window.viewBillingInvoice = function(id) {
  const raw = adminOrders.find(x => x.id === id);
  if (!raw) return;
  const b = getOrderBilling(raw);

  const modal = document.getElementById('billingInvoiceModal');
  const title = document.getElementById('billingModalTitle');
  const content = document.getElementById('billingInvoiceContent');

  if (title) {
    title.innerHTML = `<i class="fa-solid fa-file-invoice-dollar" style="color:var(--ad-gold)"></i> Tax Invoice: <span style="color:#fff; font-family:monospace;">${b.id}</span>`;
  }

  let itemsRows = '';
  if (b.items && b.items.length > 0) {
    itemsRows = b.items.map((item, idx) => {
      const iQty = Number(item.qty || item.quantity) || 1;
      const iSell = Number(item.sellingPrice || item.price) || Math.round(b.sellingPrice / (b.qty || 1));
      const iActual = Number(item.actualPrice) || Math.round(iSell * 1.25);
      const iLineTotal = iSell * iQty;
      return `
        <tr>
          <td style="text-align:center; color:var(--ad-text-muted); font-size:0.8rem;">${idx + 1}</td>
          <td>
            <strong style="color:#fff; display:block;">${item.name || b.product}</strong>
            <span style="font-size:0.76rem; color:var(--ad-text-muted);">18K Anti-Tarnish Premium Finish</span>
          </td>
          <td style="text-align:center;"><span class="billing-qty-badge">${iQty}</span></td>
          <td style="text-align:right; color:var(--ad-text-muted); text-decoration:line-through; font-size:0.85rem;">₹${iActual.toLocaleString('en-IN')}</td>
          <td style="text-align:right; font-weight:600; color:#fff;">₹${iSell.toLocaleString('en-IN')}</td>
          <td style="text-align:right; font-weight:700; color:var(--ad-gold);">₹${iLineTotal.toLocaleString('en-IN')}</td>
        </tr>
      `;
    }).join('');
  } else {
    itemsRows = `
      <tr>
        <td style="text-align:center; color:var(--ad-text-muted); font-size:0.8rem;">1</td>
        <td><strong style="color:#fff;">${b.product}</strong></td>
        <td style="text-align:center;"><span class="billing-qty-badge">${b.qty}</span></td>
        <td style="text-align:right; color:var(--ad-text-muted); text-decoration:line-through; font-size:0.85rem;">₹${b.actualPrice.toLocaleString('en-IN')}</td>
        <td style="text-align:right; font-weight:600; color:#fff;">₹${b.sellingPrice.toLocaleString('en-IN')}</td>
        <td style="text-align:right; font-weight:700; color:var(--ad-gold);">₹${b.sellingPrice.toLocaleString('en-IN')}</td>
      </tr>
    `;
  }

  const discountSavings = Math.max(0, b.actualPrice - b.sellingPrice);

  if (content) {
    content.innerHTML = `
      <div class="invoice-printable" id="invoicePrintableArea">
        <div class="invoice-top-bar">
          <div>
            <div class="invoice-brand">rsauraantitarnish</div>
            <div class="invoice-brand-sub">LUXURY ANTI-TARNISH JEWELRY • OFFICIAL TAX INVOICE</div>
            <div class="invoice-company-info">
              GSTIN: 08AAACR1234F1Z8 • CIN: U36911RJ2024PTC087654<br>
              Flagship Atelier: Heritage Pavilion, MI Road, Jaipur - 302001, India
            </div>
          </div>
          <div style="text-align:right;">
            <div class="invoice-badge-status">${statusBadge(b.status)}</div>
            <div style="font-size:0.78rem; color:var(--ad-text-muted); margin-top:8px;">INVOICE DATE</div>
            <div style="font-weight:600; color:#fff; font-size:0.95rem;">${b.date}</div>
            <div style="font-size:0.78rem; color:var(--ad-text-muted); margin-top:4px;">INVOICE NO. / ORDER ID</div>
            <div style="font-family:monospace; color:var(--ad-gold); font-weight:700; font-size:1.02rem;">${b.id}</div>
          </div>
        </div>

        <div class="invoice-parties-grid">
          <div class="invoice-party-box">
            <span class="party-label"><i class="fa-solid fa-user-check"></i> BILLED &amp; DELIVERED TO:</span>
            <div class="party-name">${b.customer}</div>
            <div class="party-detail"><i class="fa-solid fa-phone" style="width:16px;"></i> ${b.phone}</div>
            ${b.email ? `<div class="party-detail"><i class="fa-solid fa-envelope" style="width:16px;"></i> ${b.email}</div>` : ''}
            <div class="party-detail" style="margin-top:6px; line-height:1.4;">
              <i class="fa-solid fa-location-dot" style="width:16px; color:var(--ad-gold);"></i> 
              <strong>Delivery Address:</strong> ${b.deliveryAddress}
            </div>
          </div>

          <div class="invoice-party-box">
            <span class="party-label"><i class="fa-solid fa-credit-card"></i> PAYMENT &amp; LOGISTICS:</span>
            <div class="party-detail"><strong>Payment Method:</strong> ${b.paymentMethod || 'Online Prepaid'}</div>
            <div class="party-detail"><strong>Payment Status:</strong> ${b.status === 'cancelled' ? 'Refunded / Cancelled' : 'Captured &amp; Verified'}</div>
            <div class="party-detail"><strong>Shipping Partner:</strong> Blue Dart / Delhivery Express Insured</div>
            <div class="party-detail"><strong>Authenticity Seal:</strong> 18K Anti-Tarnish Lifetime Warranty</div>
          </div>
        </div>

        <div class="table-wrapper invoice-table-wrapper">
          <table class="data-table invoice-items-table">
            <thead>
              <tr>
                <th style="width:36px; text-align:center;">#</th>
                <th>Product Name</th>
                <th style="text-align:center; width:60px;">Qty</th>
                <th style="text-align:right;">Actual Price</th>
                <th style="text-align:right;">Selling Price</th>
                <th style="text-align:right;">Total Value</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
        </div>

        <div class="invoice-summary-grid">
          <div class="invoice-guarantee-note">
            <div style="display:flex; align-items:center; gap:8px; color:var(--ad-gold); font-weight:600; font-size:0.88rem; margin-bottom:6px;">
              <i class="fa-solid fa-shield-halved"></i> 18K Anti-Tarnish Lifetime Warranty
            </div>
            <p style="font-size:0.78rem; color:var(--ad-text-muted); line-height:1.5;">
              Each piece is crafted with medical-grade hypoallergenic core and electro-sealed anti-tarnish protective layering.
              For customer assistance, contact billing@rsaura.com.
            </p>
          </div>

          <div class="invoice-calc-box">
            <div class="calc-row">
              <span>Gross Actual Value (MRP):</span>
              <span style="text-decoration:line-through; color:var(--ad-text-muted);">₹${b.actualPrice.toLocaleString('en-IN')}</span>
            </div>
            ${discountSavings > 0 ? `
              <div class="calc-row savings">
                <span>Promotional Discount:</span>
                <span style="color:#10b981; font-weight:600;">- ₹${discountSavings.toLocaleString('en-IN')}</span>
              </div>
            ` : ''}
            <div class="calc-row">
              <span>Total Selling Price:</span>
              <span style="font-weight:600; color:#fff;">₹${b.sellingPrice.toLocaleString('en-IN')}</span>
            </div>
            <div class="calc-row">
              <span>Delivery Charge:</span>
              <span>${b.deliveryCharge === 0 ? '<strong style="color:#10b981;">FREE</strong>' : '₹' + b.deliveryCharge.toLocaleString('en-IN')}</span>
            </div>
            <div class="calc-row total">
              <span>Total Bill Value:</span>
              <span class="total-gold">₹${b.totalValue.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (modal) modal.classList.add('active');
};

window.printInvoice = function() {
  window.print();
};

window.printBillingReport = function() {
  window.print();
};

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

  const data = getCategoryData();
  if (!data || data.length === 0) {
    svg.innerHTML = `<circle cx="100" cy="100" r="70" fill="none" stroke="rgba(212,175,55,0.15)" stroke-width="28"></circle>
      <text x="100" y="100" text-anchor="middle" dy="0.35em" style="fill:var(--ad-text-muted);font-size:13px;font-family:'Plus Jakarta Sans',sans-serif;">No Data</text>`;
    legend.innerHTML = `<div style="color:var(--ad-text-muted);font-size:0.85rem;padding:10px 0;">No sales categorized yet</div>`;
    return;
  }

  const cx = 100, cy = 100, r = 70, stroke = 28;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  let paths = '';
  data.forEach((d) => {
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

  legend.innerHTML = data.map(d => `
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
  const data = getRegionData();
  if (!data || data.length === 0) {
    container.innerHTML = `<div style="color:var(--ad-text-muted);font-size:0.85rem;padding:12px 0;">No regional order data yet</div>`;
    return;
  }
  container.innerHTML = data.map(r => `
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
  const monthly = getMonthlyRevenue();
  const maxV = Math.max(1, ...monthly.map(m => m.value));
  const currentMonth = new Date().getMonth();

  container.innerHTML = monthly.map((m, i) => {
    const h = m.value > 0 ? Math.max(8, (m.value / maxV) * 160) : 4;
    const isHighlight = i === currentMonth;
    return `
      <div class="monthly-bar">
        <div class="monthly-bar-val">${m.value > 0 ? `₹${(m.value / 1000).toFixed(1)}k` : ''}</div>
        <div class="monthly-bar-fill${isHighlight ? ' highlight' : ''}" style="height:${h}px; opacity: ${m.value > 0 ? '1' : '0.25'};"></div>
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
    .then(data => { if (Array.isArray(data)) { adminCustomers = data; localStorage.setItem('san_admin_customers', JSON.stringify(adminCustomers)); } })
    .catch(() => {})
    .finally(() => _drawCustomersTable(tbody));
}
function _drawCustomersTable(tbody) {
  if (!tbody) return;
  tbody.innerHTML = adminCustomers.length === 0 ? `<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--ad-text-muted);">No registered patrons found.</td></tr>` :
  adminCustomers.map(c => {
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
      <td style="font-size:0.85rem; color:var(--ad-text-muted);">${c.email || '--'}</td>
      <td>${c.location || '--'}</td>
      <td style="text-align:center;">${c.orders || 0}</td>
      <td><strong>₹${Number(c.spent || 0).toLocaleString()}</strong></td>
      <td>${c.since || '--'}</td>
      <td>${customerBadge(c.status || 'active')}</td>
    </tr>
  `}).join('');
}

function customerBadge(status) {
  const map = { vip: 'badge-vip', active: 'badge-active', inactive: 'badge-inactive' };
  return `<span class="badge ${map[status] || ''}">${(status || 'active').toUpperCase()}</span>`;
}

// ============================================================
// NEWSLETTER TABLE
// ============================================================
function renderNewsletterTable() {
  const tbody = document.getElementById('newsletterTableBody');
  // Refresh from DB
  API.getNewsletter()
    .then(data => { if (Array.isArray(data)) { newsletterSubs = data; localStorage.setItem('san_newsletter_subs', JSON.stringify(newsletterSubs)); } })
    .catch(() => {})
    .finally(() => {
      document.getElementById('nlTotalCount').textContent = newsletterSubs.length;
      tbody.innerHTML = newsletterSubs.length === 0 ? `<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--ad-text-muted);">No newsletter subscribers yet.</td></tr>` :
      newsletterSubs.map((s, i) => `
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
