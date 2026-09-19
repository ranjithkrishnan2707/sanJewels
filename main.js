/* ==========================================================================
   SAN JEWELS - Main Interactive Engine
   ========================================================================== */

// 1. Curated Product Data
const PRODUCTS = [
  {
    id: 'prod-1',
    name: 'The Sovereign Royal Emerald Necklace',
    category: 'emerald',
    categoryName: 'EMERALD COUTURE',
    price: 24500,
    image: 'images/emerald_necklace.jpg',
    tag: 'Royal Heritage',
    spec: '24.8 ct Colombian Emerald & 18K Solid Gold',
    description: 'An extraordinary haute joaillerie masterpiece featuring a rare pear-cut Colombian emerald surrounded by concentric tiers of brilliant round diamonds and hand-burnished 18K gold.'
  },
  {
    id: 'prod-2',
    name: 'Empress Emerald Cut Halo Ring',
    category: 'rings',
    categoryName: 'ROYAL RINGS',
    price: 8750,
    image: 'images/emerald_ring.jpg',
    tag: 'Bespoke Cut',
    spec: '3.2 ct Emerald Cut • 18K Yellow Gold',
    description: 'A striking emerald-cut solitaire stone cradled in a delicate diamond halo, set on a solid 18K yellow gold band with polished mirror finish.'
  },
  {
    id: 'prod-3',
    name: 'Crown Teardrop Emerald Earrings',
    category: 'earrings',
    categoryName: 'HIGH EARRINGS',
    price: 6400,
    image: 'images/emerald_earrings.jpg',
    tag: 'Signature Piece',
    spec: '4.5 ct Emerald Drops with Gold Leaf Clusters',
    description: 'Lavish chandelier dangle earrings featuring pear-shaped deep green emerald gemstones suspended from hand-sculpted gold leaf diamond clusters.'
  },
  {
    id: 'prod-4',
    name: 'Verdant Palace Emerald Bracelet',
    category: 'heritage',
    categoryName: 'GOLD HERITAGE',
    price: 14200,
    image: 'images/emerald_necklace.jpg',
    tag: '24K Artisan Gold',
    spec: '12.0 ct Oval Emeralds • 24K Carved Gold',
    description: 'Hand-carved solid gold cuff bracelet inlaid with alternating oval Zambian emeralds and micro-pave white diamond stars.'
  },
  {
    id: 'prod-5',
    name: 'Royal Cushion Emerald Solitaire',
    category: 'rings',
    categoryName: 'ROYAL RINGS',
    price: 11800,
    image: 'images/emerald_ring.jpg',
    tag: 'Single Origin',
    spec: '4.0 ct Cushion Emerald • Platinum 950',
    description: 'Sustainably mined Muzo emerald showcasing vivid green hue and high clarity, set in handcrafted Platinum 950 with hidden diamond bezel.'
  },
  {
    id: 'prod-6',
    name: 'Duchess Emerald Chandelier Earrings',
    category: 'earrings',
    categoryName: 'HIGH EARRINGS',
    price: 7900,
    image: 'images/emerald_earrings.jpg',
    tag: 'Haute Joaillerie',
    spec: '5.2 ct Colombian Emeralds • 18K Gold',
    description: 'Statement drop earrings created for red carpet galas, catching ambient light with every step with radiant golden reflections.'
  }
];

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
      showToast('Thank you for subscribing to SAN Jewels Private Vault.');
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
          <div class="product-price">$${item.price.toLocaleString()}</div>
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
  modalPrice.textContent = `$${product.price.toLocaleString()}`;
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
  cartSubtotal.textContent = `$${subtotal.toLocaleString()}`;

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
        <div class="item-price">$${(item.price * item.quantity).toLocaleString()}</div>
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
  const basePricePerCarat = 3200;
  const calculated = Math.round(
    bespokeState.carat * basePricePerCarat * bespokeState.metalFactor * bespokeState.cutMultiplier
  );
  if (configPrice) {
    configPrice.textContent = `$${calculated.toLocaleString()}`;
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
