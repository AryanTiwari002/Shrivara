/**
 * SHRIVARA - Complete Store Catalog & Controller (All 214 Products)
 * Replicated 1:1 from https://shrivara.co/
 */

// Cart & Wishlist State
let cart = [];
let wishlist = new Set();
let currentSlide = 0;
let slideInterval = null;

// Catalog Filter & Pagination State
let activeCategory = 'all';
let activeSort = 'featured';
let searchQuery = '';
let visibleProductCount = 16;
const PRODUCTS_PER_PAGE = 16;

// Quick View State
let currentQuickViewProduct = null;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Initial sample cart item if cart empty
  if (cart.length === 0 && ALL_PRODUCTS.length > 0) {
    const firstP = ALL_PRODUCTS.find(p => p.price > 0 && !p.isSoldOut) || ALL_PRODUCTS[0];
    cart.push({
      id: firstP.id,
      title: firstP.title,
      price: firstP.price,
      qty: 1,
      image: firstP.image
    });
  }

  initHeroSlider();
  renderFeaturedCarousels();
  renderCatalog();
  updateCartUI();
  initEventListeners();
  initThemeSwitcher();
});

// Render Featured Carousels (Bestsellers & New Arrivals)
function renderFeaturedCarousels() {
  const bestsellersGrid = document.getElementById('bestsellersGrid');
  const newArrivalsGrid = document.getElementById('newArrivalsGrid');

  // Specific top products from shrivara.co
  const topBestsellers = ALL_PRODUCTS.filter(p => 
    p.title.includes('Hazoorilal') || 
    p.title.includes('Premium collection') || 
    p.title.includes('Navratna')
  ).slice(0, 10);

  const topNewArrivals = ALL_PRODUCTS.filter(p => 
    p.title.includes('Empress') || 
    p.title.includes('Regalia') || 
    p.title.includes('Vintage Heritage') ||
    p.title.includes('Royal')
  ).slice(0, 10);

  if (bestsellersGrid) {
    bestsellersGrid.innerHTML = topBestsellers.map(p => createProductCardHTML(p)).join('');
  }
  if (newArrivalsGrid) {
    newArrivalsGrid.innerHTML = topNewArrivals.map(p => createProductCardHTML(p)).join('');
  }
}

// Generate Product Card HTML
function createProductCardHTML(product) {
  const isWish = wishlist.has(product.id);
  const priceDisplay = product.price > 0 ? `Rs. ${product.price.toLocaleString('en-IN')}.00` : 'Sold Out';
  const compareDisplay = product.comparePrice > product.price && product.price > 0 ? `Rs. ${product.comparePrice.toLocaleString('en-IN')}.00` : '';

  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-media">
        <img src="${product.image}" alt="${product.title}" loading="lazy" onclick="openQuickView(${product.id})">
        ${product.isSoldOut ? `<span class="product-badge badge-sold-out">Sold Out</span>` : (product.discount && product.price > 0 ? `<span class="product-badge">${product.discount}</span>` : '')}
        <button class="wishlist-btn ${isWish ? 'active' : ''}" onclick="toggleWishlist(${product.id})" aria-label="Wishlist">
          <i class="${isWish ? 'fas fa-heart' : 'far fa-heart'}"></i>
        </button>
      </div>
      <div class="product-details">
        <span class="product-category">${product.category}</span>
        <h3 class="product-title" onclick="openQuickView(${product.id})" title="${product.title}">${product.title}</h3>
        <div class="product-rating">
          <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
          <span>(5.0)</span>
        </div>
        <div class="product-price-row">
          <span class="product-price">${priceDisplay}</span>
          ${compareDisplay ? `<span class="product-compare-price">${compareDisplay}</span>` : ''}
        </div>
        <button class="add-to-cart-btn ${product.isSoldOut ? 'disabled' : ''}" onclick="${product.isSoldOut ? '' : `addToCart(${product.id})`}">
          ${product.isSoldOut ? 'Sold Out' : '<i class="fas fa-shopping-bag"></i> Add to Cart'}
        </button>
      </div>
    </div>
  `;
}

// Filter and Render Full Catalog
function renderCatalog() {
  const grid = document.getElementById('catalogGrid');
  const countEl = document.getElementById('catalogProductCount');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (!grid) return;

  // 1. Filter by category
  let filtered = ALL_PRODUCTS.filter(p => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'anti-tarnish') return p.isAntiTarnish;
    return p.category.toLowerCase() === activeCategory.toLowerCase();
  });

  // 2. Filter by search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q)
    );
  }

  // 3. Sort
  if (activeSort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (activeSort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (activeSort === 'title-asc') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  if (countEl) {
    countEl.textContent = `Showing ${Math.min(visibleProductCount, filtered.length)} of ${filtered.length} products`;
  }

  // 4. Slice for pagination
  const visible = filtered.slice(0, visibleProductCount);

  if (visible.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #888;">
        <i class="fas fa-gem" style="font-size: 40px; color: #ccc; margin-bottom: 12px;"></i>
        <h3>No jewellery pieces found</h3>
        <p>Try selecting a different collection or clearing your search.</p>
        <button class="view-all-btn" style="margin-top: 16px;" onclick="setCategory('all')">View All Jewellery</button>
      </div>
    `;
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    return;
  }

  grid.innerHTML = visible.map(p => createProductCardHTML(p)).join('');

  if (loadMoreBtn) {
    if (visibleProductCount >= filtered.length) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'inline-block';
      loadMoreBtn.textContent = `Load More (${filtered.length - visibleProductCount} remaining)`;
    }
  }
}

// Category filter trigger
function setCategory(cat) {
  activeCategory = cat;
  visibleProductCount = PRODUCTS_PER_PAGE;
  
  // Update active pill
  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === cat);
  });

  renderCatalog();

  // Scroll to catalog section smoothly
  const catalogSec = document.getElementById('catalog');
  if (catalogSec) {
    catalogSec.scrollIntoView({ behavior: 'smooth' });
  }
}

// Sort trigger
function handleSortChange(sortVal) {
  activeSort = sortVal;
  renderCatalog();
}

// Load more trigger
function loadMoreProducts() {
  visibleProductCount += PRODUCTS_PER_PAGE;
  renderCatalog();
}

// Hero Slider
function initHeroSlider() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.slider-dot');
  if (!slides.length) return;

  function showSlide(index) {
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
    currentSlide = index;
  }

  window.nextSlide = () => {
    let next = (currentSlide + 1) % slides.length;
    showSlide(next);
  };

  window.prevSlide = () => {
    let prev = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prev);
  };

  window.goToSlide = (idx) => {
    showSlide(idx);
    resetAutoPlay();
  };

  function startAutoPlay() {
    slideInterval = setInterval(window.nextSlide, 6000);
  }

  function resetAutoPlay() {
    clearInterval(slideInterval);
    startAutoPlay();
  }

  startAutoPlay();
}

// Carousel horizontal scroll navigation
function scrollCarousel(containerId, distance) {
  const container = document.getElementById(containerId);
  if (container) {
    container.scrollBy({ left: distance, behavior: 'smooth' });
  }
}

// Wishlist Functionality
function toggleWishlist(productId) {
  if (wishlist.has(productId)) {
    wishlist.delete(productId);
    showToast("Item removed from wishlist");
  } else {
    wishlist.add(productId);
    showToast("Item added to wishlist! ❤️");
  }
  const countEl = document.getElementById('wishlistCount');
  if (countEl) countEl.textContent = wishlist.size;

  // Update hearts across all visible cards
  document.querySelectorAll(`.product-card[data-id="${productId}"] .wishlist-btn`).forEach(btn => {
    btn.classList.toggle('active', wishlist.has(productId));
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = wishlist.has(productId) ? 'fas fa-heart' : 'far fa-heart';
    }
  });
}

// Cart Functionality
function addToCart(productId, qty = 1) {
  const product = ALL_PRODUCTS.find(p => p.id === productId);
  if (!product || product.isSoldOut) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      qty: qty,
      image: product.image
    });
  }

  updateCartUI();
  openCartDrawer();
  showToast(`Added "${product.title}" to cart! 🛍️`);
}

function updateQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  updateCartUI();
  showToast("Item removed from cart");
}

function updateCartUI() {
  const cartCountEl = document.getElementById('cartCount');
  const cartItemsContainer = document.getElementById('cartItems');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const progressFill = document.getElementById('shippingProgress');
  const shippingText = document.getElementById('shippingText');

  const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  if (cartCountEl) cartCountEl.textContent = totalQty;
  if (cartSubtotalEl) cartSubtotalEl.textContent = `Rs. ${subtotal.toLocaleString('en-IN')}.00`;

  // Free shipping threshold (Rs. 1,999)
  const FREE_SHIPPING_LIMIT = 1999;
  if (progressFill && shippingText) {
    if (subtotal >= FREE_SHIPPING_LIMIT) {
      progressFill.style.width = '100%';
      shippingText.innerHTML = `🎉 You've unlocked <strong>FREE Shipping!</strong>`;
    } else {
      const remaining = FREE_SHIPPING_LIMIT - subtotal;
      const percent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_LIMIT) * 100));
      progressFill.style.width = `${percent}%`;
      shippingText.innerHTML = `Add <strong>Rs. ${remaining.toLocaleString('en-IN')}</strong> more for <strong>FREE Shipping!</strong>`;
    }
  }

  if (cartItemsContainer) {
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <i class="fas fa-shopping-bag" style="font-size: 48px; color: #ccc; margin-bottom: 16px;"></i>
          <p>Your shopping bag is currently empty.</p>
        </div>
      `;
    } else {
      cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.title}" class="cart-item-img">
          <div class="cart-item-info">
            <h5 class="cart-item-title">${item.title}</h5>
            <div class="cart-item-price">Rs. ${item.price.toLocaleString('en-IN')}.00</div>
            <div class="qty-controls">
              <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
            </div>
          </div>
          <button class="remove-item-btn" onclick="removeFromCart(${item.id})" title="Remove item">
            <i class="far fa-trash-alt"></i>
          </button>
        </div>
      `).join('');
    }
  }
}

// Quick View Modal
function openQuickView(productId) {
  const product = ALL_PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  currentQuickViewProduct = product;

  const modal = document.getElementById('quickViewModal');
  const content = document.getElementById('quickViewContent');
  if (!modal || !content) return;

  const images = product.images.length > 0 ? product.images : [product.image];

  content.innerHTML = `
    <div class="quick-view-grid">
      <div class="quick-view-gallery">
        <div class="quick-view-main-img">
          <img id="qvMainImg" src="${images[0]}" alt="${product.title}">
        </div>
        ${images.length > 1 ? `
          <div class="quick-view-thumbs">
            ${images.map((img, idx) => `
              <img src="${img}" class="${idx === 0 ? 'active' : ''}" onclick="setQuickViewImg('${img}', this)">
            `).join('')}
          </div>
        ` : ''}
      </div>
      <div class="quick-view-info">
        <span class="product-category">${product.category}</span>
        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px; color: #121212;">${product.title}</h2>
        <div class="product-rating" style="margin-bottom: 14px;">
          <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
          <span>(125+ reviews)</span>
        </div>
        <div class="product-price-row" style="margin-bottom: 18px;">
          <span style="font-size: 22px; font-weight: 700; color: var(--color-primary);">
            ${product.price > 0 ? `Rs. ${product.price.toLocaleString('en-IN')}.00` : 'Sold Out'}
          </span>
          ${product.comparePrice > product.price ? `
            <span style="font-size: 15px; color: #888; text-decoration: line-through;">
              Rs. ${product.comparePrice.toLocaleString('en-IN')}.00
            </span>
          ` : ''}
          ${product.discount && product.price > 0 ? `<span class="product-discount">${product.discount}</span>` : ''}
        </div>
        
        <p style="font-size: 14px; line-height: 1.7; color: #555; margin-bottom: 20px;">
          Handcrafted statement jewellery by Shrivara. Premium finish, skin-friendly, anti-tarnish coating, and designed with high-grade polkis and stones.
        </p>

        <ul style="list-style: none; margin-bottom: 24px; font-size: 13px; color: #333;">
          <li style="margin-bottom: 6px;"><i class="fas fa-check" style="color: var(--color-primary); margin-right: 8px;"></i> 100% Anti-Tarnish Coating</li>
          <li style="margin-bottom: 6px;"><i class="fas fa-check" style="color: var(--color-primary); margin-right: 8px;"></i> High Grade Polki & Gemstones</li>
          <li style="margin-bottom: 6px;"><i class="fas fa-check" style="color: var(--color-primary); margin-right: 8px;"></i> Made in India with Heritage Craft</li>
        </ul>

        <div style="display: flex; gap: 12px; align-items: center;">
          <div class="qty-controls" style="padding: 8px 12px;">
            <button class="qty-btn" onclick="adjustQuickViewQty(-1)">-</button>
            <span class="qty-val" id="qvQtyVal">1</span>
            <button class="qty-btn" onclick="adjustQuickViewQty(1)">+</button>
          </div>
          <button class="add-to-cart-btn ${product.isSoldOut ? 'disabled' : ''}" style="padding: 14px 28px; font-size: 13px; flex-grow: 1;" onclick="${product.isSoldOut ? '' : `addQuickViewToCart(${product.id})`}">
            ${product.isSoldOut ? 'Sold Out' : 'Add to Shopping Bag'}
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');
}

function closeQuickView() {
  const modal = document.getElementById('quickViewModal');
  if (modal) modal.classList.remove('open');
}

function setQuickViewImg(url, thumbEl) {
  document.getElementById('qvMainImg').src = url;
  document.querySelectorAll('.quick-view-thumbs img').forEach(el => el.classList.remove('active'));
  thumbEl.classList.add('active');
}

let qvCurrentQty = 1;
function adjustQuickViewQty(delta) {
  qvCurrentQty = Math.max(1, qvCurrentQty + delta);
  const el = document.getElementById('qvQtyVal');
  if (el) el.textContent = qvCurrentQty;
}

function addQuickViewToCart(productId) {
  addToCart(productId, qvCurrentQty);
  closeQuickView();
  qvCurrentQty = 1;
}

// Drawer & Modal Controls
function openCartDrawer() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
}

function closeCartDrawer() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
}

function openSearchModal() {
  document.getElementById('searchModal').classList.add('open');
  setTimeout(() => document.getElementById('searchInput').focus(), 100);
}

function closeSearchModal() {
  document.getElementById('searchModal').classList.remove('open');
}

function toggleMobileNav() {
  const nav = document.querySelector('.nav-bar');
  if (nav) nav.classList.toggle('mobile-open');
}

// Live Search in Modal
function handleLiveSearch(query) {
  const resultsContainer = document.getElementById('searchResults');
  if (!query.trim()) {
    resultsContainer.innerHTML = '';
    return;
  }

  const matches = ALL_PRODUCTS.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) || 
    p.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10);

  if (matches.length === 0) {
    resultsContainer.innerHTML = `<p style="padding: 16px; color: #888;">No jewellery found matching "${query}"</p>`;
    return;
  }

  resultsContainer.innerHTML = matches.map(p => `
    <div style="display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; cursor: pointer;" onclick="openQuickView(${p.id}); closeSearchModal();">
      <img src="${p.image}" style="width: 50px; height: 50px; border-radius: 2px; object-fit: cover;">
      <div>
        <h5 style="font-size: 14px; font-weight: 600; color: #121212;">${p.title}</h5>
        <span style="font-size: 13px; color: var(--color-primary); font-weight: 700;">
          ${p.price > 0 ? `Rs. ${p.price.toLocaleString('en-IN')}.00` : 'Sold Out'}
        </span>
      </div>
    </div>
  `).join('');
}

// Toast
function showToast(message) {
  const toast = document.getElementById('toastNotice');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Event Listeners
function initEventListeners() {
  const form = document.getElementById('newsletterForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast("Thank you for joining Shrivara! Enjoy 5% off code: FIRST5");
      form.reset();
    });
  }

  // Catalog search input
  const catalogSearchInput = document.getElementById('catalogSearch');
  if (catalogSearchInput) {
    catalogSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      visibleProductCount = PRODUCTS_PER_PAGE;
      renderCatalog();
    });
  }

  // Close theme switcher panel when clicking outside
  document.addEventListener('click', (e) => {
    const widget = document.getElementById('themeSwitcherWidget');
    if (widget && !widget.contains(e.target)) {
      const panel = document.getElementById('themeSwitcherPanel');
      if (panel) panel.classList.remove('open');
    }
  });
}

// ==========================================================================
// Luxury Theme Studio - Live Color Palette Switcher
// ==========================================================================
const LUXURY_THEMES = {
  'classic-shrivara': {
    name: 'Classic Shrivara',
    vibe: 'Original live store forest green & dark slate',
    primary: '#083a12',
    primaryHover: '#297341',
    gold: '#c59b27',
    bgLight: '#f3f3f3',
    announcementBg: '#121212',
    footerBg: '#121212',
    swatches: ['#083a12', '#c59b27', '#121212']
  },
  'emerald-gold': {
    name: 'Royal Emerald & Gold',
    vibe: 'Imperial heritage, deep emerald & warm bullion gold',
    primary: '#0B2F1C',
    primaryHover: '#1B4D2E',
    gold: '#C5A059',
    bgLight: '#F7F5F0',
    announcementBg: '#061D11',
    footerBg: '#061D11',
    swatches: ['#0B2F1C', '#C5A059', '#F7F5F0']
  },
  'midnight-onyx': {
    name: 'Midnight Onyx & Champagne',
    vibe: 'Sleek black, diamond brilliance & champagne gold',
    primary: '#111111',
    primaryHover: '#2A2A2A',
    gold: '#D4AF37',
    bgLight: '#F8F8F8',
    announcementBg: '#000000',
    footerBg: '#000000',
    swatches: ['#111111', '#D4AF37', '#F8F8F8']
  },
  'rose-wine': {
    name: 'Mulberry Wine & Rose Gold',
    vibe: 'Regal bridal velvet, plum wine & soft rose gold',
    primary: '#5C2434',
    primaryHover: '#7A3246',
    gold: '#D49B8E',
    bgLight: '#FDF8F7',
    announcementBg: '#3E1621',
    footerBg: '#3E1621',
    swatches: ['#5C2434', '#D49B8E', '#FDF8F7']
  },
  'royal-sapphire': {
    name: 'Royal Sapphire & Warm Honey',
    vibe: 'Persian blue, royal sapphire & antique honey gold',
    primary: '#0C1E36',
    primaryHover: '#16325C',
    gold: '#C89D56',
    bgLight: '#F4F7FB',
    announcementBg: '#071221',
    footerBg: '#071221',
    swatches: ['#0C1E36', '#C89D56', '#F4F7FB']
  },
  'terracotta-bronze': {
    name: 'Burnt Terracotta & Brass',
    vibe: 'Earthy Rajasthani clay, rust red & antique brass',
    primary: '#6E2E1F',
    primaryHover: '#8C3C2A',
    gold: '#D99E32',
    bgLight: '#FAF6F0',
    announcementBg: '#4A1D13',
    footerBg: '#4A1D13',
    swatches: ['#6E2E1F', '#D99E32', '#FAF6F0']
  }
};

function toggleThemePanel() {
  const panel = document.getElementById('themeSwitcherPanel');
  if (panel) {
    panel.classList.toggle('open');
  }
}

function applyTheme(key, notify = true) {
  const theme = LUXURY_THEMES[key];
  if (!theme) return;

  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-primary-hover', theme.primaryHover);
  root.style.setProperty('--color-gold', theme.gold);
  root.style.setProperty('--color-bg-light', theme.bgLight);
  root.style.setProperty('--color-announcement-bg', theme.announcementBg);
  root.style.setProperty('--color-footer-bg', theme.footerBg);

  try {
    localStorage.setItem('shrivara_active_theme', key);
  } catch (e) {}

  document.querySelectorAll('.theme-option-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeKey === key);
  });

  if (notify) {
    showToast(`Palette applied: ${theme.name}`);
  }
}

function initThemeSwitcher() {
  const listEl = document.getElementById('themeOptionsList');
  if (!listEl) return;

  const savedTheme = localStorage.getItem('shrivara_active_theme') || 'classic-shrivara';

  listEl.innerHTML = Object.entries(LUXURY_THEMES).map(([key, t]) => `
    <button class="theme-option-btn ${key === savedTheme ? 'active' : ''}" data-theme-key="${key}" onclick="applyTheme('${key}')">
      <div class="theme-swatches">
        ${t.swatches.map(c => `<span class="swatch-circle" style="background-color: ${c};"></span>`).join('')}
      </div>
      <div class="theme-btn-info">
        <span class="theme-btn-title">${t.name}</span>
        <span class="theme-btn-vibe">${t.vibe}</span>
      </div>
      <i class="fas fa-check theme-check-icon"></i>
    </button>
  `).join('');

  applyTheme(savedTheme, false);
}

