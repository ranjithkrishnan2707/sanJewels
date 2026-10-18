/* ==========================================================================
   rsauraantitarnish - Main Interactive Engine
   ========================================================================== */

// 1. Curated Product Data – loaded from MongoDB Atlas via API
// Falls back to localStorage cache if server is temporarily unreachable.
// Seed data (products_data.js) is NEVER shown to end-users; DB is the source of truth.
let storedAdminProducts = null;
try {
  const cached = JSON.parse(localStorage.getItem('san_admin_products'));
  if (Array.isArray(cached) && cached.length > 0 && cached[0]._id) {
    storedAdminProducts = cached;
  } else {
    localStorage.removeItem('san_admin_products');
  }
} catch (e) {
  storedAdminProducts = null;
}

// Start with cached products or fallback sample products so the UI is immediately interactive
let PRODUCTS = storedAdminProducts || (typeof SAMPLE_PRODUCTS !== 'undefined' ? SAMPLE_PRODUCTS : []);

// Async: load fresh products from DB and re-render
// Shimmer skeleton shown while DB fetch is in progress if no products in cache
function showProductsLoading() {
  if (!productGrid) return;
  if (PRODUCTS && PRODUCTS.length > 0) return; // Keep existing items visible while refreshing
  const skeletonCard = `
    <div class="product-card skeleton-card" aria-hidden="true" style="pointer-events:none;">
      <div class="product-img-wrapper" style="background:rgba(255,255,255,0.04);border-radius:12px 12px 0 0;overflow:hidden;">
        <div class="skeleton-shimmer" style="width:100%;height:260px;"></div>
      </div>
      <div class="product-info" style="padding:16px;">
        <div class="skeleton-shimmer" style="height:12px;width:50%;border-radius:6px;margin-bottom:10px;"></div>
        <div class="skeleton-shimmer" style="height:18px;width:80%;border-radius:6px;margin-bottom:8px;"></div>
        <div class="skeleton-shimmer" style="height:12px;width:65%;border-radius:6px;margin-bottom:16px;"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div class="skeleton-shimmer" style="height:20px;width:30%;border-radius:6px;"></div>
          <div class="skeleton-shimmer" style="height:36px;width:36%;border-radius:8px;"></div>
        </div>
      </div>
    </div>
  `;
  productGrid.innerHTML = skeletonCard.repeat(6);
}

async function loadProductsFromDB() {
  try {
    const products = await API.getProducts();
    if (Array.isArray(products) && products.length > 0) {
      PRODUCTS = products;
      localStorage.setItem('san_admin_products', JSON.stringify(PRODUCTS));
    } else if (Array.isArray(products) && products.length === 0) {
      if ((!PRODUCTS || PRODUCTS.length === 0) && typeof SAMPLE_PRODUCTS !== 'undefined') {
        PRODUCTS = SAMPLE_PRODUCTS;
      }
    }
  } catch (err) {
    console.warn('Could not load products from DB, using fallback.', err.message);
    if ((!PRODUCTS || PRODUCTS.length === 0) && typeof SAMPLE_PRODUCTS !== 'undefined') {
      PRODUCTS = SAMPLE_PRODUCTS;
    }
  } finally {
    renderProducts();
  }
}

// State Management: Clean & sanitize shopping cart on initialization
let shoppingCart = [];
try {
  const rawCart = JSON.parse(localStorage.getItem('san_cart'));
  if (Array.isArray(rawCart)) {
    shoppingCart = rawCart
      .filter(item => item && (item.name || item.id || item._id))
      .map((item, idx) => ({
        id: String(item.id || item._id || `cart-item-${idx}`),
        name: item.name || 'Anti-Tarnish Jewel Piece',
        price: Number(item.price) || 0,
        image: item.image || 'images/emerald_necklace.jpg',
        quantity: Math.max(1, parseInt(item.quantity, 10) || 1)
      }));
  }
} catch (e) {
  shoppingCart = [];
}
let activeFilter = 'all';

// Cart Drawer Open/Close Helpers
function openCart() {
  if (cartDrawer) cartDrawer.classList.add('active');
  const cartOverlay = document.getElementById('cartOverlay');
  if (cartOverlay) cartOverlay.classList.add('active');
}

function closeCart() {
  if (cartDrawer) cartDrawer.classList.remove('active');
  const cartOverlay = document.getElementById('cartOverlay');
  if (cartOverlay) cartOverlay.classList.remove('active');
}
window.openCart = openCart;
window.closeCart = closeCart;

// Bespoke Configurator State
let bespokeState = {
  metal: '18K Anti-Tarnish Jewel',
  metalFactor: 1.0,
  cut: 'Emerald Cut',
  cutMultiplier: 1.0,
  carat: 2.5,
  engraving: ''
};

// DOM Elements
const productGrid = document.getElementById('productGrid');
const filterTabs = document.querySelector('.filter-tabs');
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

// Sync Hero Image from backend / localStorage
async function syncHeroImage() {
  const heroImg = document.getElementById('heroImage');
  if (!heroImg) return;

  // 1. Instant check from localStorage
  const localHero = localStorage.getItem('san_hero_image');
  if (localHero && heroImg.src !== localHero) {
    heroImg.src = localHero;
  }

  // 2. Fresh check from backend / MongoDB Atlas
  try {
    if (typeof API !== 'undefined' && API.getSetting) {
      const data = await API.getSetting('hero_image');
      if (data && data.value) {
        if (heroImg.src !== data.value) {
          heroImg.src = data.value;
        }
        localStorage.setItem('san_hero_image', data.value);
      } else if (data && data.value === null) {
        localStorage.removeItem('san_hero_image');
        if (!heroImg.src.includes('images/emerald_necklace.jpg')) {
          heroImg.src = 'images/emerald_necklace.jpg';
        }
      }
    }
  } catch (err) {
    console.warn('Could not sync hero image from server, using local fallback:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  syncHeroImage();
  showProductsLoading(); // show skeleton while DB loads
  updateCartUI();
  initBespokeConfigurator();
  loadProductsFromDB(); // async: refresh products from MongoDB
  loadCategoriesFromDB();

  // Sticky Navbar Scroll Listener
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Filter Buttons Event
  filterTabs.addEventListener('click', (e) => {
    const button = e.target.closest('.filter-btn');
    if (!button || !filterTabs.contains(button)) return;
    filterTabs.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    activeFilter = button.dataset.filter;
    renderProducts();
  });

  // Cart Drawer Toggle
  if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  const cartOverlay = document.getElementById('cartOverlay');
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Prevent clicks inside the cart drawer from bubbling to the document
  if (cartDrawer) {
    cartDrawer.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Close cart drawer when clicking on the page backdrop outside the drawer
  document.addEventListener('click', (e) => {
    if (cartDrawer && cartDrawer.classList.contains('active')) {
      if (e.composedPath && e.composedPath().includes(cartDrawer)) return;
      if (cartDrawer.contains(e.target)) return;
      if (
        (cartToggleBtn && (cartToggleBtn === e.target || cartToggleBtn.contains(e.target))) ||
        e.target.closest('#mobNavCart') ||
        e.target.closest('.add-cart-btn') ||
        e.target.closest('.quick-action-btn') ||
        e.target.closest('#modalAddCartBtn') ||
        e.target.closest('#cartOverlay')
      ) {
        return;
      }
      closeCart();
    }
  });

  // ── Mobile Navigation Drawer Toggle ───────────────────────────────────────
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');
  const mobileDrawerClose = document.getElementById('mobileDrawerClose');

  function openMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.add('active');
    if (mobileNavBackdrop) mobileNavBackdrop.classList.add('active');
    document.body.classList.add('menu-open');
    if (mobileMenuBtn) {
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      }
    }
  }

  function closeMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove('active');
    if (mobileNavBackdrop) mobileNavBackdrop.classList.remove('active');
    document.body.classList.remove('menu-open');
    if (mobileMenuBtn) {
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    }
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (mobileDrawer && mobileDrawer.classList.contains('active')) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });
  }

  if (mobileDrawerClose) {
    mobileDrawerClose.addEventListener('click', closeMobileDrawer);
  }

  if (mobileNavBackdrop) {
    mobileNavBackdrop.addEventListener('click', closeMobileDrawer);
  }

  // Close mobile drawer when clicking any link inside it
  if (mobileDrawer) {
    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileDrawer);
    });
  }

  // ── Live Search Modal & Filtering ──────────────────────────────────────────
  const searchBtn = document.getElementById('searchBtn');
  const searchModal = document.getElementById('searchModal');
  const closeSearchModal = document.getElementById('closeSearchModal');
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const searchResultsList = document.getElementById('searchResultsList');
  const searchPlaceholder = document.getElementById('searchPlaceholder');
  const mobNavSearch = document.getElementById('mobNavSearch');

  function openSearchModal() {
    if (searchModal) {
      searchModal.classList.add('active');
      document.body.classList.add('search-open');
      setTimeout(() => {
        if (searchInput) {
          searchInput.focus();
          if (searchInput.value.trim().length > 0) {
            executeSearch(searchInput.value.trim());
          }
        }
      }, 100);
    }
  }

  function closeSearchModalWindow() {
    if (searchModal) {
      searchModal.classList.remove('active');
      document.body.classList.remove('search-open');
    }
  }
  // Expose both globally so any inline onclick attribute can call them safely
  window.openSearchModal = openSearchModal;
  window.closeSearchModalWindow = closeSearchModalWindow;

  function executeSearch(query) {
    const q = (query || '').toLowerCase().trim();
    if (!searchResultsList) return;

    if (!q) {
      if (searchPlaceholder) searchPlaceholder.style.display = 'block';
      searchResultsList.innerHTML = '';
      if (searchClearBtn) searchClearBtn.style.display = 'none';
      return;
    }

    if (searchClearBtn) searchClearBtn.style.display = 'flex';
    if (searchPlaceholder) searchPlaceholder.style.display = 'none';

    let matches = PRODUCTS;
    if (q !== 'all') {
      matches = PRODUCTS.filter(p => {
        const name = (p.name || '').toLowerCase();
        const cat = (p.categoryName || '').toLowerCase();
        const catKey = (p.category || '').toLowerCase();
        const spec = (p.spec || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        return name.includes(q) || cat.includes(q) || catKey.includes(q) || spec.includes(q) || desc.includes(q);
      });
    }

    if (matches.length === 0) {
      searchResultsList.innerHTML = `
        <div class="search-empty-state">
          <i class="fa-solid fa-gem"></i>
          <h4>No Jewels Found</h4>
          <p>We couldn't find any pieces matching "${query}". Try searching for "Emerald", "Ring", or "Waterproof".</p>
        </div>
      `;
      return;
    }

    searchResultsList.innerHTML = matches.map(item => {
      const itemId = String(item.id || item._id);
      return `
      <div class="search-result-item" onclick="openQuickView('${itemId}'); closeSearchModalWindow();">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
        <div class="search-result-info">
          <span class="search-result-cat">${item.categoryName || 'Masterpiece'}</span>
          <h5>${item.name}</h5>
          <div class="search-result-price">₹${Number(item.price).toLocaleString('en-IN')}</div>
        </div>
        <button type="button" class="search-result-add-btn" onclick="event.stopPropagation(); addToCart('${itemId}');" title="Add to Bag" aria-label="Add to Bag">
          <i class="fa-solid fa-bag-shopping"></i>
        </button>
      </div>
    `;
    }).join('');
  }

  if (searchBtn) searchBtn.addEventListener('click', openSearchModal);
  if (mobNavSearch) mobNavSearch.addEventListener('click', openSearchModal);
  if (closeSearchModal) closeSearchModal.addEventListener('click', closeSearchModalWindow);

  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        executeSearch(e.target.value);
      }, 150);
    });
  }

  if (searchClearBtn && searchInput) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      executeSearch('');
      searchInput.focus();
    });
  }

  // Search filter chips
  document.querySelectorAll('.search-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-query');
      if (searchInput) {
        searchInput.value = q === 'all' ? '' : q;
      }
      executeSearch(q);
    });
  });

  // Shortcut key: Cmd/Ctrl + K opens search
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearchModal();
    }
    if (e.key === 'Escape') {
      closeSearchModalWindow();
      closeMobileDrawer();
    }
  });

  // ── Mobile Bottom Navigation Active State & Cart Sync ──────────────────────
  const mobNavCart = document.getElementById('mobNavCart');
  if (mobNavCart) {
    mobNavCart.addEventListener('click', openCart);
  }

  // Update active state in bottom nav on scroll
  const bottomNavLinks = document.querySelectorAll('.mobile-bottom-nav .mobile-nav-btn');
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 200;
    const collectionsSection = document.getElementById('collections');
    const heroSection = document.getElementById('hero');

    if (collectionsSection && scrollPos >= collectionsSection.offsetTop) {
      document.getElementById('mobNavShop')?.classList.add('active');
      document.getElementById('mobNavHome')?.classList.remove('active');
    } else {
      document.getElementById('mobNavHome')?.classList.add('active');
      document.getElementById('mobNavShop')?.classList.remove('active');
    }
  }, { passive: true });

  // Quick View Modal Close
  if (closeQuickView) {
    closeQuickView.addEventListener('click', () => quickViewModal.classList.remove('active'));
  }

  // Close modals on backdrop click
  window.addEventListener('click', (e) => {
    if (e.target === quickViewModal) quickViewModal.classList.remove('active');
    if (e.target === searchModal) closeSearchModalWindow();
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

        const totalQty = shoppingCart.reduce((s, i) => s + (i.quantity || 1), 0);
        const actualPriceTotal = shoppingCart.reduce((s, i) => s + (i.actualPrice || Math.round((i.price || 0) * 1.25)) * (i.quantity || 1), 0);
        const fullDeliveryAddress = `${address}, ${city}, ${state} - ${pincode}`;

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
          deliveryAddress: fullDeliveryAddress,
          qty: totalQty,
          actualPrice: actualPriceTotal,
          sellingPrice: subtotal,
          deliveryCharge: shipping,
          totalValue: total,
          items: shoppingCart.map(i => ({
            name: i.name,
            price: i.price,
            sellingPrice: i.price,
            actualPrice: i.actualPrice || Math.round((i.price || 0) * 1.25),
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
          deliveryAddress: fullDeliveryAddress,
          product: shoppingCart.map(i => `${i.name} x${i.quantity}`).join(', '),
          qty: totalQty,
          actualPrice: actualPriceTotal,
          sellingPrice: subtotal,
          deliveryCharge: shipping,
          totalValue: total,
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

async function loadCategoriesFromDB() {
  try {
    const categories = await API.getCategories();
    filterTabs.replaceChildren();

    const allButton = document.createElement('button');
    allButton.type = 'button';
    allButton.className = 'filter-btn';
    allButton.dataset.filter = 'all';
    allButton.textContent = 'All Masterpieces';
    filterTabs.appendChild(allButton);

    categories.forEach(category => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter-btn';
      button.dataset.filter = category.id;
      button.textContent = category.label;
      filterTabs.appendChild(button);
    });

    if (activeFilter !== 'all' && !categories.some(category => category.id === activeFilter)) {
      activeFilter = 'all';
    }
    const selectedButton = Array.from(filterTabs.querySelectorAll('.filter-btn'))
      .find(button => button.dataset.filter === activeFilter);
    if (selectedButton) selectedButton.classList.add('active');
    renderProducts();
  } catch (err) {
    console.warn('Could not load product categories from the server.', err.message);
  }
}

function normalizeCategory(cat) {
  if (!cat) return '';
  return String(cat).toLowerCase().trim().replace(/['"’]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function setCategoryFilter(categoryKey) {
  activeFilter = categoryKey || 'all';
  if (filterTabs) {
    const buttons = filterTabs.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
      if (btn.dataset.filter === activeFilter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  renderProducts();
}
window.setCategoryFilter = setCategoryFilter;

function renderProducts() {
  const normFilter = normalizeCategory(activeFilter);
  const filtered = activeFilter === 'all'
    ? PRODUCTS
    : PRODUCTS.filter(p => {
        const catSlug = normalizeCategory(p.category);
        const catNameSlug = normalizeCategory(p.categoryName);
        return catSlug === normFilter || catNameSlug === normFilter || p.category === activeFilter;
      });

  if (!productGrid) return;

  if (filtered.length === 0) {
    productGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; color: var(--text-muted);">
        <i class="fa-solid fa-gem text-gold" style="font-size: 2.5rem; margin-bottom: 12px; opacity: 0.6;"></i>
        <h3 style="color: #fff; margin-bottom: 8px;">No Jewels Found</h3>
        <p>No masterpieces currently listed in this category. Please check another collection.</p>
      </div>
    `;
    return;
  }

  productGrid.innerHTML = filtered.map(item => {
    const itemId = String(item.id || item._id);
    return `
    <div class="product-card" data-product-id="${itemId}" onclick="handleProductCardClick(event, '${itemId}')">
      <div class="product-img-wrapper">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
        <span class="product-tag">${item.tag || '18K Anti-Tarnish'}</span>
        <div class="product-actions-overlay">
          <button type="button" class="quick-action-btn" onclick="event.stopPropagation(); openQuickView('${itemId}')" title="Quick View" aria-label="Quick View">
            <i class="fa-regular fa-eye"></i>
          </button>
          <button type="button" class="quick-action-btn" onclick="event.stopPropagation(); addToCart('${itemId}')" title="Add to Bag" aria-label="Add to Bag">
            <i class="fa-solid fa-bag-shopping"></i>
          </button>
        </div>
      </div>
      <div class="product-info">
        <span class="product-category">${item.categoryName || 'Haute Joaillerie'}</span>
        <h3 title="${item.name}">${item.name}</h3>
        <p class="product-spec">${item.spec || ''}</p>
        <div class="product-bottom">
          <div class="product-price">₹${Number(item.price).toLocaleString('en-IN')}</div>
          <button type="button" class="add-cart-btn" onclick="event.stopPropagation(); addToCart('${itemId}')" aria-label="Add ${item.name} to bag">
            <span class="add-btn-label">Add To Bag</span>
            <i class="fa-solid fa-plus add-btn-icon-mob"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

function handleProductCardClick(e, id) {
  // If user clicked inside a button, do nothing (already handled)
  if (e.target.closest('button')) return;
  openQuickView(id);
}

function openQuickView(id) {
  const targetId = String(id);
  const product = PRODUCTS.find(p => String(p.id) === targetId || String(p._id) === targetId);
  if (!product) return;

  const productId = String(product.id || product._id || targetId);
  currentModalProduct = product;
  if (modalImg) modalImg.src = product.image;
  if (modalCategory) modalCategory.textContent = product.categoryName || 'HAUTE JOAILLERIE';
  if (modalTitle) modalTitle.textContent = product.name;
  if (modalPrice) modalPrice.textContent = `₹${Number(product.price).toLocaleString('en-IN')}`;
  if (modalDesc) modalDesc.textContent = product.description || '';

  if (modalAddCartBtn) {
    modalAddCartBtn.onclick = (e) => {
      if (e) e.stopPropagation();
      addToCart(productId);
      if (quickViewModal) quickViewModal.classList.remove('active');
    };
  }

  if (quickViewModal) quickViewModal.classList.add('active');
}

/* ==========================================================================
   Shopping Bag & Storage Management
   ========================================================================== */

function addToCart(id) {
  if (!id) return;
  const targetId = String(id);
  const product = PRODUCTS.find(p => String(p.id) === targetId || String(p._id) === targetId);
  if (!product) {
    showToast('Product not found. Please refresh the page.');
    return;
  }

  const productId = String(product.id || product._id || targetId);
  const existing = shoppingCart.find(i => String(i.id) === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    shoppingCart.push({
      id: productId,
      name: product.name || 'Anti-Tarnish Jewel Piece',
      price: Number(product.price) || 0,
      image: product.image || 'images/emerald_necklace.jpg',
      quantity: 1
    });
  }

  saveAndUpdateCart();
  openCart();
  showToast(`Added "${product.name}" to your bag.`);
}

function updateCartQuantity(id, change) {
  const targetId = String(id);
  const item = shoppingCart.find(i => String(i.id) === targetId);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    shoppingCart = shoppingCart.filter(i => String(i.id) !== targetId);
  }

  saveAndUpdateCart();
}

function removeFromCart(id) {
  const targetId = String(id);
  shoppingCart = shoppingCart.filter(i => String(i.id) !== targetId);
  saveAndUpdateCart();
  showToast('Item removed from your bag.');
}

function saveAndUpdateCart() {
  localStorage.setItem('san_cart', JSON.stringify(shoppingCart));
  updateCartUI();
}

function updateCartUI() {
  // Update badge counters
  const totalCount = shoppingCart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) cartCount.textContent = totalCount;
  const mobCartCount = document.getElementById('mobCartCount');
  if (mobCartCount) mobCartCount.textContent = totalCount;

  // Update total subtotal
  const subtotal = shoppingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (cartSubtotal) cartSubtotal.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

  // Render items
  if (!cartBody) return;

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
        <div class="item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
        <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
          <div style="display: flex; align-items: center; border: 1px solid rgba(212,175,55,0.3); border-radius: 4px; overflow: hidden;">
            <button type="button" class="cart-qty-btn" onclick="event.stopPropagation(); updateCartQuantity('${item.id}', -1)" aria-label="Decrease quantity">-</button>
            <span style="font-size: 0.85rem; padding: 0 8px; min-width: 20px; text-align: center;">${item.quantity}</span>
            <button type="button" class="cart-qty-btn" onclick="event.stopPropagation(); updateCartQuantity('${item.id}', 1)" aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="cart-remove-btn" onclick="event.stopPropagation(); removeFromCart('${item.id}')" aria-label="Remove item">Remove</button>
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
  if (!toast || !toastMsg) return; // guard: toast elements may not exist on all pages
  if (showToast._timer) clearTimeout(showToast._timer); // cancel any running dismiss timer
  toastMsg.textContent = message;
  toast.classList.add('active');
  showToast._timer = setTimeout(() => {
    toast.classList.remove('active');
    showToast._timer = null;
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

// Expose all interactive functions globally for inline HTML attributes
window.PRODUCTS = PRODUCTS;
window.getShoppingCart = () => shoppingCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.openQuickView = openQuickView;
window.renderProducts = renderProducts;
window.showToast = showToast;
window.openCart = openCart;
window.closeCart = closeCart;
window.setCategoryFilter = setCategoryFilter;
if (typeof openSearchModal !== 'undefined') window.openSearchModal = openSearchModal;
if (typeof closeSearchModalWindow !== 'undefined') window.closeSearchModalWindow = closeSearchModalWindow;
