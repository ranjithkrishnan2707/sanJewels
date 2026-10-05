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

  // Mobile Navigation Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.querySelector('.nav-links');
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('mobile-active');
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        if (navLinks.classList.contains('mobile-active')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-xmark');
        } else {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      }
    });

    // Close mobile nav when clicking a nav link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('mobile-active') && !navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        navLinks.classList.remove('mobile-active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      }
    });
  }

  // Quick View Modal Close
  closeQuickView.addEventListener('click', () => quickViewModal.classList.remove('active'));

  // Close modals on backdrop click
  window.addEventListener('click', (e) => {
    if (e.target === quickViewModal) quickViewModal.classList.remove('active');
    const vipModal = document.getElementById('vipWelcomeModal');
    if (e.target === vipModal) {
      vipModal.classList.remove('active');
      localStorage.setItem('san_greeting_seen', 'true');
    }
  });

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

  // ── Checkout Modal & Flow ──────────────────────────────────────────────
  const checkoutBtn = document.getElementById('checkoutBtn');
  const checkoutModal = document.getElementById('checkoutModal');
  const closeCheckoutModal = document.getElementById('closeCheckoutModal');
  const checkoutForm = document.getElementById('checkoutForm');
  const confirmOrderBtn = document.getElementById('confirmOrderBtn');

  function openCheckout() {
    if (shoppingCart.length === 0) {
      showToast('Your shopping bag is currently empty.');
      return;
    }

    // Close cart drawer
    if (cartDrawer) cartDrawer.classList.remove('active');

    // Pre-fill user data if already known
    try {
      const currentUser = JSON.parse(localStorage.getItem('san_current_user')) || {};
      if (currentUser.name && document.getElementById('checkoutName')) {
        document.getElementById('checkoutName').value = currentUser.name;
      }
      if (currentUser.email && document.getElementById('checkoutEmail')) {
        document.getElementById('checkoutEmail').value = currentUser.email;
      }
      if (currentUser.whatsapp && document.getElementById('checkoutPhone')) {
        const cleanPhone = currentUser.whatsapp.replace(/^\+91\s*/, '').replace(/\D/g, '');
        if (cleanPhone) document.getElementById('checkoutPhone').value = cleanPhone.slice(-10);
      }
      if (currentUser.location && document.getElementById('checkoutCity')) {
        const parts = currentUser.location.split(',');
        if (parts[0] && !document.getElementById('checkoutCity').value) {
          document.getElementById('checkoutCity').value = parts[0].trim();
        }
        if (parts[1] && document.getElementById('checkoutState') && !document.getElementById('checkoutState').value) {
          document.getElementById('checkoutState').value = parts[1].trim();
        }
      }
    } catch (e) {}

    // Populate Acquisition Summary in modal
    updateCheckoutSummary();

    // Show modal
    if (checkoutModal) checkoutModal.classList.add('active');
  }

  function updateCheckoutSummary() {
    const miniItems = document.getElementById('checkoutMiniItems');
    const itemCountEl = document.getElementById('checkoutItemCount');
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const shippingEl = document.getElementById('checkoutShipping');
    const grandTotalEl = document.getElementById('checkoutGrandTotal');

    const totalQty = shoppingCart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = shoppingCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 2500 ? 0 : 199;
    const grandTotal = subtotal + shipping;

    if (itemCountEl) itemCountEl.textContent = `${totalQty} item${totalQty === 1 ? '' : 's'}`;
    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Complimentary' : `₹${shipping.toLocaleString('en-IN')}`;
    if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

    if (miniItems) {
      miniItems.innerHTML = shoppingCart.map(item => `
        <div class="checkout-item-row">
          <div class="checkout-item-info">
            <div class="checkout-item-badge">💎</div>
            <div>
              <div class="checkout-item-title">${item.name}</div>
              <div class="checkout-item-sub">Qty: ${item.quantity} · ₹${item.price.toLocaleString('en-IN')} each</div>
            </div>
          </div>
          <div class="checkout-item-amt">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
        </div>
      `).join('');
    }

    if (confirmOrderBtn) {
      confirmOrderBtn.innerHTML = `<span>Place Order &amp; Pay (₹${grandTotal.toLocaleString('en-IN')})</span> <i class="fa-solid fa-arrow-right"></i>`;
    }
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', openCheckout);
  }

  if (closeCheckoutModal) {
    closeCheckoutModal.addEventListener('click', () => {
      if (checkoutModal) checkoutModal.classList.remove('active');
    });
  }

  // Close checkout modal on backdrop click
  if (checkoutModal) {
    checkoutModal.addEventListener('click', (e) => {
      if (e.target === checkoutModal) checkoutModal.classList.remove('active');
    });
  }

  // Payment radio styling
  document.querySelectorAll('.payment-option-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.payment-option-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  // Handle Checkout Form Submission
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (shoppingCart.length === 0) {
        showToast('Your shopping bag is empty.');
        if (checkoutModal) checkoutModal.classList.remove('active');
        return;
      }

      const name = document.getElementById('checkoutName').value.trim();
      const phoneCode = document.getElementById('checkoutPhoneCode').value;
      const phone = document.getElementById('checkoutPhone').value.trim();
      const email = document.getElementById('checkoutEmail').value.trim();
      const address = document.getElementById('checkoutAddress').value.trim();
      const city = document.getElementById('checkoutCity').value.trim();
      const state = document.getElementById('checkoutState').value.trim();
      const pincode = document.getElementById('checkoutPincode').value.trim();

      const paymentInput = document.querySelector('input[name="paymentMethod"]:checked');
      const paymentMethod = paymentInput ? paymentInput.value : 'UPI / Instant Pay';

      if (!name || !phone || !email || !address || !city || !state || !pincode) {
        showToast('Please complete all required address and contact fields.');
        return;
      }

      if (!/^\d{10}$/.test(phone)) {
        showToast('Please enter a valid 10-digit mobile number.');
        return;
      }

      if (!/^\d{6}$/.test(pincode)) {
        showToast('Please enter a valid 6-digit postal PIN code.');
        return;
      }

      // Disable button & show spinner
      confirmOrderBtn.disabled = true;
      confirmOrderBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Securing Your Acquisition...';

      try {
        const orderId = 'RSA-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-6);
        const subtotal = shoppingCart.reduce((s, i) => s + i.price * i.quantity, 0);
        const shipping = subtotal >= 2500 ? 0 : 199;
        const total = subtotal + shipping;
        const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        const estDate = new Date();
        estDate.setDate(estDate.getDate() + 5);
        const estDelivery = estDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

        const fullPhone = `${phoneCode} ${phone}`;
        const fullLocation = `${city}, ${state} - ${pincode}`;

        const orderData = {
          id: orderId,
          customer: name,
          phone: fullPhone,
          email: email,
          address: address,
          city: city,
          state: state,
          pincode: pincode,
          location: fullLocation,
          items: shoppingCart.map(i => ({
            name: i.name,
            price: i.price,
            qty: i.quantity,
            category: i.category || ''
          })),
          amount: total,
          subtotal: subtotal,
          shipping: shipping,
          date: today,
          estimatedDelivery: estDelivery,
          paymentMethod: paymentMethod,
          status: 'processing'
        };

        // Persist for confirmation page
        sessionStorage.setItem('rsaura_last_order', JSON.stringify(orderData));

        // Update local user profile
        localStorage.setItem('san_current_user', JSON.stringify({
          name: name,
          whatsapp: fullPhone,
          email: email,
          location: `${city}, ${state}`
        }));

        // DB Payload
        const dbPayload = {
          id: orderId,
          customer: name,
          phone: fullPhone,
          email: email,
          address: address,
          city: city,
          state: state,
          pincode: pincode,
          product: shoppingCart.map(i => `${i.name} x${i.quantity}`).join(', '),
          amount: total,
          location: fullLocation,
          paymentMethod: paymentMethod,
          items: orderData.items,
          date: new Date().toISOString().split('T')[0],
          status: 'processing'
        };

        // Sync to API non-blocking
        API.createOrder(dbPayload).catch(err => console.warn('Order DB sync error:', err.message));
        API.createCustomer({
          name: name,
          email: email,
          whatsapp: fullPhone,
          location: `${city}, ${state}`,
          orders: 1,
          spent: total,
          since: today,
          status: 'vip'
        }).catch(err => console.warn('Customer DB sync error:', err.message));

        // Also add to local admin cache so admin page reflects immediately
        try {
          const localOrders = JSON.parse(localStorage.getItem('san_admin_orders')) || [];
          localOrders.unshift(dbPayload);
          localStorage.setItem('san_admin_orders', JSON.stringify(localOrders));
        } catch (e) {}

        // Clear shopping bag
        shoppingCart = [];
        localStorage.removeItem('san_cart');
        updateCartUI();
        if (checkoutModal) checkoutModal.classList.remove('active');

        // Redirect to order confirmation page
        window.location.href = 'order-confirmation.html';

      } catch (err) {
        console.error('Checkout error:', err);
        showToast('Something went wrong during checkout. Please try again.');
        confirmOrderBtn.disabled = false;
        confirmOrderBtn.innerHTML = '<span>Place Order &amp; Proceed</span> <i class="fa-solid fa-arrow-right"></i>';
      }
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
