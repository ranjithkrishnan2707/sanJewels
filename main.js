/* ==========================================================================
   rsauraantitarnish - Main Interactive Engine
   ========================================================================== */

// 1. Curated Product Data – loaded from MongoDB Atlas via API
// Falls back to localStorage cache / seed data if server is unreachable.
let storedAdminProducts = null;
try {
  storedAdminProducts = JSON.parse(localStorage.getItem('san_admin_products'));
} catch (e) {
  storedAdminProducts = null;
}

const seedProducts = (typeof window !== 'undefined' && window.SAMPLE_PRODUCTS) ? window.SAMPLE_PRODUCTS : [];
let PRODUCTS = storedAdminProducts && storedAdminProducts.length >= 50
  ? storedAdminProducts
  : seedProducts;

// Async: load fresh products from DB and re-render if different
async function loadProductsFromDB() {
  try {
    const products = await API.getProducts();
    if (Array.isArray(products) && products.length > 0) {
      PRODUCTS = products;
      localStorage.setItem('san_admin_products', JSON.stringify(PRODUCTS));
      renderProducts(); // refresh UI with live DB data
    }
  } catch (err) {
    console.warn('Could not load products from DB, using local cache.', err.message);
  }
}

// State Management
let shoppingCart = JSON.parse(localStorage.getItem('san_cart')) || [];
let activeFilter = 'all';

// Bespoke Configurator State
let bespokeState = {
  metal: '18K Yellow Gold',
  metalFactor: 1.0,
  cut: 'Emerald Cut',
  cutMultiplier: 1.0,
  carat: 2.5,
  engraving: ''
};

// DOM Elements
const productGrid = document.getElementById('productGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
const cartDrawer = document.getElementById('cartDrawer');
const cartToggleBtn = document.getElementById('cartToggleBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartBody = document.getElementById('cartBody');
const cartCount = document.getElementById('cartCount');
const cartSubtotal = document.getElementById('cartSubtotal');
const navbar = document.getElementById('navbar');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');

// Quick View Modal Elements
const quickViewModal = document.getElementById('quickViewModal');
const closeQuickView = document.getElementById('closeQuickView');
const modalImg = document.getElementById('modalImg');
const modalCategory = document.getElementById('modalCategory');
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const modalDesc = document.getElementById('modalDesc');
const modalAddCartBtn = document.getElementById('modalAddCartBtn');
let currentModalProduct = null;

// Appointment Modal Elements
const appointmentModal = document.getElementById('appointmentModal');
const bookModalBtn = document.getElementById('bookModalBtn');
const heroBookBtn = document.getElementById('heroBookBtn');
const footerBookBtn = document.getElementById('footerBookBtn');
const closeAppointment = document.getElementById('closeAppointment');
const bookingForm = document.getElementById('bookingForm');

// Bespoke Controls
const caratSlider = document.getElementById('caratSlider');
const caratVal = document.getElementById('caratVal');
const configPrice = document.getElementById('configPrice');
const engravingInput = document.getElementById('engravingInput');
const addBespokeBtn = document.getElementById('addBespokeBtn');

/* ==========================================================================
   Initialization & Event Listeners
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCartUI();
  initBespokeConfigurator();
  loadProductsFromDB(); // async: refresh products from MongoDB

  // Sticky Navbar Scroll Listener
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Filter Buttons Event
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeFilter = e.target.getAttribute('data-filter');
      renderProducts();
    });
  });

  // Cart Drawer Toggle
  cartToggleBtn.addEventListener('click', () => cartDrawer.classList.add('active'));
  closeCartBtn.addEventListener('click', () => cartDrawer.classList.remove('active'));

  // Quick View Modal Close
  closeQuickView.addEventListener('click', () => quickViewModal.classList.remove('active'));

  // Appointment Modal Triggers & Close
  [bookModalBtn, heroBookBtn, footerBookBtn].forEach(btn => {
    if (btn) btn.addEventListener('click', () => appointmentModal.classList.add('active'));
  });
  closeAppointment.addEventListener('click', () => appointmentModal.classList.remove('active'));

  // Close modals on backdrop click
  window.addEventListener('click', (e) => {
    if (e.target === quickViewModal) quickViewModal.classList.remove('active');
    if (e.target === appointmentModal) appointmentModal.classList.remove('active');
    const vipModal = document.getElementById('vipWelcomeModal');
    if (e.target === vipModal) {
      vipModal.classList.remove('active');
      localStorage.setItem('san_greeting_seen', 'true');
    }
  });

  // Booking Form Submission
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      appointmentModal.classList.remove('active');
      showToast('Concierge Appointment Request Received! Our Salon Ambassador will contact you shortly.');
      bookingForm.reset();
    });
  }

  // Newsletter Form Submission
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      const email = emailInput ? emailInput.value.trim() : '';
      if (email) {
        API.subscribeNewsletter(email).catch(() => {});
      }
      showToast('Thank you for subscribing to rsauraantitarnish Private Vault.');
      newsletterForm.reset();
    });
  }

  // Checkout Button Trigger
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (shoppingCart.length === 0) {
        showToast('Your shopping bag is currently empty.');
        return;
      }
      showToast('Redirecting to SSL Encrypted Insured Checkout...');
    });
  }
});

/* ==========================================================================
   Product Rendering & Quick View Logic
   ========================================================================== */

function renderProducts() {
  const filtered = activeFilter === 'all'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeFilter);

  productGrid.innerHTML = filtered.map(item => `
    <div class="product-card">
      <div class="product-img-wrapper">
        <img src="${item.image}" alt="${item.name}">
        <span class="product-tag">${item.tag}</span>
        <div class="product-actions-overlay">
          <button class="quick-action-btn" onclick="openQuickView('${item.id}')" title="Quick View">
            <i class="fa-regular fa-eye"></i>
          </button>
          <button class="quick-action-btn" onclick="addToCart('${item.id}')" title="Add to Bag">
            <i class="fa-solid fa-bag-shopping"></i>
          </button>
        </div>
      </div>
      <div class="product-info">
        <span class="product-category">${item.categoryName}</span>
        <h3>${item.name}</h3>
        <p class="product-spec">${item.spec}</p>
        <div class="product-bottom">
          <div class="product-price">₹${item.price.toLocaleString()}</div>
          <button class="add-cart-btn" onclick="addToCart('${item.id}')">Add To Bag</button>
        </div>
      </div>
    </div>
  `).join('');
}

function openQuickView(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;

  currentModalProduct = product;
  modalImg.src = product.image;
  modalCategory.textContent = product.categoryName;
  modalTitle.textContent = product.name;
  modalPrice.textContent = `₹${product.price.toLocaleString()}`;
  modalDesc.textContent = product.description;

  modalAddCartBtn.onclick = () => {
    addToCart(product.id);
    quickViewModal.classList.remove('active');
  };

  quickViewModal.classList.add('active');
}

/* ==========================================================================
   Shopping Bag & Storage Management
   ========================================================================== */

function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;

  const existing = shoppingCart.find(i => i.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    shoppingCart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  saveAndUpdateCart();
  showToast(`Added "${product.name}" to your bag.`);
}

function updateCartQuantity(id, change) {
  const item = shoppingCart.find(i => i.id === id);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    shoppingCart = shoppingCart.filter(i => i.id !== id);
  }

  saveAndUpdateCart();
}

function removeFromCart(id) {
  shoppingCart = shoppingCart.filter(i => i.id !== id);
  saveAndUpdateCart();
  showToast('Item removed from your bag.');
}

function saveAndUpdateCart() {
  localStorage.setItem('san_cart', JSON.stringify(shoppingCart));
  updateCartUI();
}

function updateCartUI() {
  // Update badge counter
  const totalCount = shoppingCart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalCount;

  // Update total subtotal
  const subtotal = shoppingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartSubtotal.textContent = `₹${subtotal.toLocaleString()}`;

  // Render items
  if (shoppingCart.length === 0) {
    cartBody.innerHTML = `
      <div style="text-align: center; padding: 60px 0; color: var(--text-muted);">
        <i class="fa-solid fa-gem" style="font-size: 3rem; color: var(--gold-primary); margin-bottom: 16px; opacity: 0.5;"></i>
        <p style="font-family: var(--font-serif); font-size: 1.2rem; margin-bottom: 8px;">Your Shopping Bag is Empty</p>
        <p style="font-size: 0.85rem;">Discover our master collections and add high jewelry pieces to your bag.</p>
      </div>
    `;
    return;
  }

  cartBody.innerHTML = shoppingCart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <div class="item-price">₹${(item.price * item.quantity).toLocaleString()}</div>
        <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
          <div style="display: flex; align-items: center; border: 1px solid rgba(212,175,55,0.3); border-radius: 4px;">
            <button onclick="updateCartQuantity('${item.id}', -1)" style="background: none; border: none; color: #fff; padding: 2px 8px; cursor: pointer;">-</button>
            <span style="font-size: 0.85rem; padding: 0 4px;">${item.quantity}</span>
            <button onclick="updateCartQuantity('${item.id}', 1)" style="background: none; border: none; color: #fff; padding: 2px 8px; cursor: pointer;">+</button>
          </div>
          <button onclick="removeFromCart('${item.id}')" style="background: none; border: none; color: #ff6b6b; font-size: 0.75rem; cursor: pointer;">Remove</button>
        </div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   Bespoke Atelier Ring Customizer
   ========================================================================== */

function initBespokeConfigurator() {
  const metalOpts = document.querySelectorAll('#metalOptions .pill-opt');
  const cutOpts = document.querySelectorAll('#cutOptions .pill-opt');

  // Metal option click listener
  metalOpts.forEach(btn => {
    btn.addEventListener('click', (e) => {
      metalOpts.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      bespokeState.metal = e.target.getAttribute('data-metal');
      bespokeState.metalFactor = parseFloat(e.target.getAttribute('data-factor'));
      calculateBespokePrice();
    });
  });

  // Cut option click listener
  cutOpts.forEach(btn => {
    btn.addEventListener('click', (e) => {
      cutOpts.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      bespokeState.cut = e.target.getAttribute('data-cut');
      bespokeState.cutMultiplier = parseFloat(e.target.getAttribute('data-multiplier'));
      calculateBespokePrice();
    });
  });

  // Carat slider listener
  if (caratSlider) {
    caratSlider.addEventListener('input', (e) => {
      bespokeState.carat = parseFloat(e.target.value);
      caratVal.textContent = `${bespokeState.carat.toFixed(1)} ct`;
      calculateBespokePrice();
    });
  }

  // Engraving listener
  if (engravingInput) {
    engravingInput.addEventListener('input', (e) => {
      bespokeState.engraving = e.target.value;
    });
  }

  // Add Bespoke to Bag listener
  if (addBespokeBtn) {
    addBespokeBtn.addEventListener('click', () => {
      const price = calculateBespokePrice();
      const bespokeItem = {
        id: `bespoke-${Date.now()}`,
        name: `Bespoke ${bespokeState.carat}ct ${bespokeState.cut} Ring (${bespokeState.metal})`,
        price: price,
        image: 'images/emerald_ring.jpg',
        quantity: 1
      };

      shoppingCart.push(bespokeItem);
      saveAndUpdateCart();
      cartDrawer.classList.add('active');
      showToast('Your custom Bespoke Ring was added to your bag!');
    });
  }

  calculateBespokePrice();
}

function calculateBespokePrice() {
  const basePricePerCarat = 210;
  const calculated = Math.round(
    bespokeState.carat * basePricePerCarat * bespokeState.metalFactor * bespokeState.cutMultiplier
  );
  if (configPrice) {
    configPrice.textContent = `₹${calculated.toLocaleString()}`;
  }
  return calculated;
}

/* ==========================================================================
   Toast Notification Helper
   ========================================================================== */

function showToast(message) {
  toastMsg.textContent = message;
  toast.classList.add('active');
  setTimeout(() => {
    toast.classList.remove('active');
  }, 3500);
}

/* ==========================================================================
   VIP Concierge Onboarding (New User Welcome Experience)
   ========================================================================== */

function initVipOnboarding() {
  const vipModal = document.getElementById('vipWelcomeModal');
  const vipForm = document.getElementById('vipWelcomeForm');
  const closeBtn = document.getElementById('closeVipWelcome');
  const skipBtn = document.getElementById('vipSkipBtn');
  const vipProfileBtn = document.getElementById('vipProfileBtn');
  const vipStatusDot = document.getElementById('vipStatusDot');
  const vipNameInput = document.getElementById('vipName');
  const vipPhoneInput = document.getElementById('vipPhone');
  const vipPhoneCode = document.getElementById('vipPhoneCode');

  // Check if visitor has already been greeted or entered credentials
  const existingUser = JSON.parse(localStorage.getItem('san_current_user'));
  const hasSeenGreeting = localStorage.getItem('san_greeting_seen');

  if (existingUser && existingUser.name) {
    if (vipStatusDot) vipStatusDot.classList.add('active');
  }

  // If first time user (neither greeted nor registered), present the invitation
  if (!existingUser && !hasSeenGreeting && vipModal) {
    setTimeout(() => {
      vipModal.classList.add('active');
    }, 1800); // 1.8s delay after luxurious initial hero load
  }

  // Close / Dismiss functions
  const dismissModal = () => {
    if (vipModal) vipModal.classList.remove('active');
    localStorage.setItem('san_greeting_seen', 'true');
  };

  if (closeBtn) closeBtn.addEventListener('click', dismissModal);
  if (skipBtn) skipBtn.addEventListener('click', dismissModal);

  // Allow clicking on profile button to view/update profile
  if (vipProfileBtn) {
    vipProfileBtn.addEventListener('click', () => {
      const user = JSON.parse(localStorage.getItem('san_current_user'));
      if (user) {
        showToast(`Welcome back, ${user.name}! WhatsApp: ${user.whatsapp}`);
      } else if (vipModal) {
        vipModal.classList.add('active');
      }
    });
  }

  // Submission handler
  if (vipForm) {
    vipForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = vipNameInput.value.trim();
      const code = vipPhoneCode ? vipPhoneCode.value : '+91';
      const rawPhone = vipPhoneInput.value.trim();
      const fullWhatsapp = `${code} ${rawPhone}`;

      if (!name || !rawPhone) return;

      const newUser = {
        name: name,
        whatsapp: fullWhatsapp,
        joinedAt: new Date().toISOString(),
        status: 'vip'
      };

      // 1. Save in storefront localStorage
      localStorage.setItem('san_current_user', JSON.stringify(newUser));
      localStorage.setItem('san_greeting_seen', 'true');

      // 2. Also register into MongoDB Customers collection
      const customerPayload = {
        name: name,
        email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@patron.rsauraantitarnish.com`,
        whatsapp: fullWhatsapp,
        location: code === '+91' ? 'Jaipur, IN' : (code === '+1' ? 'New York, US' : (code === '+41' ? 'Geneva, CH' : 'London, UK')),
        orders: 0,
        spent: 0,
        since: new Date().toISOString().slice(0, 7),
        status: 'vip'
      };
      API.createCustomer(customerPayload).catch(err => console.warn('Customer DB sync error:', err.message));

      // Also keep localStorage admin customer list in sync
      try {
        const adminCustomers = JSON.parse(localStorage.getItem('san_admin_customers')) || [];
        const exists = adminCustomers.find(c => c.whatsapp === fullWhatsapp || c.name.toLowerCase() === name.toLowerCase());
        if (!exists) {
          adminCustomers.unshift(customerPayload);
          localStorage.setItem('san_admin_customers', JSON.stringify(adminCustomers));
        }
      } catch (err) { console.error('Customer local sync error:', err); }

      // 3. Update UI
      if (vipStatusDot) vipStatusDot.classList.add('active');
      vipModal.classList.remove('active');

      // 4. Luxurious personalized toast
      showToast(`Welcome to Haute Joaillerie Privé, ${name}. Your concierge privileges are activated!`);
    });
  }
}

// Call onboarding initialization
initVipOnboarding();
