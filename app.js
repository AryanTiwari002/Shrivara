/**
 * Shrivara - Interactive Features & State Management
 */

// Sample Product Catalog with curated luxury imagery and details
const PRODUCTS = [
  {
    id: 1,
    title: "Royal Polki Kundan Choker Set",
    category: "jewellery-sets",
    tag: "Bestseller",
    price: 3499,
    comparePrice: 6999,
    discount: "50% OFF",
    rating: 5,
    reviews: 42,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
    isNew: true,
    isBestseller: true
  },
  {
    id: 2,
    title: "Heritage Green Meenakari Jhumkas",
    category: "earrings",
    tag: "Trending",
    price: 1899,
    comparePrice: 3499,
    discount: "45% OFF",
    rating: 5,
    reviews: 38,
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80",
    isNew: true,
    isBestseller: true
  },
  {
    id: 3,
    title: "Emerald Bloom Gold Plated Kada",
    category: "bracelets-bangles",
    tag: "Anti-Tarnish",
    price: 2199,
    comparePrice: 4299,
    discount: "48% OFF",
    rating: 5,
    reviews: 29,
    image: "https://images.unsplash.com/photo-1611591475836-8488e00ceba3?auto=format&fit=crop&w=600&q=80",
    isNew: false,
    isBestseller: true
  },
  {
    id: 4,
    title: "Victorian Emerald & CZ Statement Ring",
    category: "rings",
    tag: "New Arrival",
    price: 1499,
    comparePrice: 2999,
    discount: "50% OFF",
    rating: 4.9,
    reviews: 19,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
    isNew: true,
    isBestseller: false
  },
  {
    id: 5,
    title: "Handcrafted Temple Coin Necklace",
    category: "necklaces-pendants",
    tag: "Heritage",
    price: 2899,
    comparePrice: 5599,
    discount: "48% OFF",
    rating: 5,
    reviews: 51,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80",
    isNew: false,
    isBestseller: true
  },
  {
    id: 6,
    title: "Peacock Motif Chandelier Earrings",
    category: "earrings",
    tag: "Polki Grade A",
    price: 1699,
    comparePrice: 3200,
    discount: "46% OFF",
    rating: 5,
    reviews: 23,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
    isNew: true,
    isBestseller: false
  },
  {
    id: 7,
    title: "Kundan Jadau Adjustable Bangle Pair",
    category: "bracelets-bangles",
    tag: "Must Have",
    price: 2599,
    comparePrice: 4999,
    discount: "48% OFF",
    rating: 5,
    reviews: 31,
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=600&q=80",
    isNew: false,
    isBestseller: true
  },
  {
    id: 8,
    title: "Royal Emerald Solitaire Pendant",
    category: "pendants",
    tag: "Minimal Luxury",
    price: 1299,
    comparePrice: 2499,
    discount: "48% OFF",
    rating: 5,
    reviews: 14,
    image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=600&q=80",
    isNew: true,
    isBestseller: false
  }
];

// App State
let cart = [
  { id: 1, title: "Royal Polki Kundan Choker Set", price: 3499, qty: 1, image: PRODUCTS[0].image }
];
let wishlist = new Set();
let currentSlide = 0;
let slideInterval = null;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  renderProducts('all');
  initHeroSlider();
  updateCartUI();
  initEventListeners();
});

// Render Products
function renderProducts(filter = 'all') {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  let filtered = PRODUCTS;
  if (filter === 'bestsellers') {
    filtered = PRODUCTS.filter(p => p.isBestseller);
  } else if (filter === 'new') {
    filtered = PRODUCTS.filter(p => p.isNew);
  }

  grid.innerHTML = filtered.map(product => `
    <div class="product-card" data-category="${product.category}">
      <div class="product-media">
        <img src="${product.image}" alt="${product.title}" loading="lazy">
        <span class="product-badge">${product.tag}</span>
        <button class="wishlist-btn ${wishlist.has(product.id) ? 'active' : ''}" onclick="toggleWishlist(${product.id})">
          <i class="${wishlist.has(product.id) ? 'fas fa-heart' : 'far fa-heart'}"></i>
        </button>
      </div>
      <div class="product-details">
        <span class="product-category">${product.category.replace('-', ' ')}</span>
        <h4 class="product-title">${product.title}</h4>
        <div class="product-rating">
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <span>(${product.reviews})</span>
        </div>
        <div class="product-price-row">
          <span class="product-price">₹${product.price.toLocaleString('en-IN')}</span>
          <span class="product-compare-price">₹${product.comparePrice.toLocaleString('en-IN')}</span>
          <span class="product-discount">${product.discount}</span>
        </div>
        <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
          <i class="fas fa-shopping-bag"></i> Add to Cart
        </button>
      </div>
    </div>
  `).join('');
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
    slideInterval = setInterval(window.nextSlide, 5000);
  }

  function resetAutoPlay() {
    clearInterval(slideInterval);
    startAutoPlay();
  }

  startAutoPlay();
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
  document.getElementById('wishlistCount').textContent = wishlist.size;
  renderProducts(getActiveTab());
}

function getActiveTab() {
  const activeTab = document.querySelector('.tab-btn.active');
  return activeTab ? activeTab.dataset.filter : 'all';
}

// Cart Functionality
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      qty: 1,
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
  if (cartSubtotalEl) cartSubtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

  // Free shipping threshold (₹1999)
  const FREE_SHIPPING_LIMIT = 1999;
  if (progressFill && shippingText) {
    if (subtotal >= FREE_SHIPPING_LIMIT) {
      progressFill.style.width = '100%';
      shippingText.innerHTML = `🎉 You've unlocked <strong>FREE Shipping!</strong>`;
    } else {
      const remaining = FREE_SHIPPING_LIMIT - subtotal;
      const percent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_LIMIT) * 100));
      progressFill.style.width = `${percent}%`;
      shippingText.innerHTML = `Add <strong>₹${remaining.toLocaleString('en-IN')}</strong> more for <strong>FREE Shipping!</strong>`;
    }
  }

  // Render items
  if (cartItemsContainer) {
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <i class="fas fa-shopping-bag" style="font-size: 48px; color: #ddd; margin-bottom: 16px;"></i>
          <p>Your shopping bag is currently empty.</p>
        </div>
      `;
    } else {
      cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.title}" class="cart-item-img">
          <div class="cart-item-info">
            <h5 class="cart-item-title">${item.title}</h5>
            <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
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

// Live Search
function handleLiveSearch(query) {
  const resultsContainer = document.getElementById('searchResults');
  if (!query.trim()) {
    resultsContainer.innerHTML = '';
    return;
  }

  const matches = PRODUCTS.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) || 
    p.category.toLowerCase().includes(query.toLowerCase())
  );

  if (matches.length === 0) {
    resultsContainer.innerHTML = `<p style="padding: 16px; color: #888;">No jewellery found matching "${query}"</p>`;
    return;
  }

  resultsContainer.innerHTML = matches.map(p => `
    <div style="display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; cursor: pointer;" onclick="addToCart(${p.id}); closeSearchModal();">
      <img src="${p.image}" style="width: 50px; height: 50px; border-radius: 4px; object-fit: cover;">
      <div>
        <h5 style="font-size: 14px; font-weight: 600;">${p.title}</h5>
        <span style="font-size: 13px; color: var(--color-primary); font-weight: 700;">₹${p.price.toLocaleString('en-IN')}</span>
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
  // Tab clicks
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderProducts(e.target.dataset.filter);
    });
  });

  // Newsletter Submit
  const form = document.getElementById('newsletterForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast("Thank you for joining Shrivara! Enjoy 5% off code: FIRST5");
      form.reset();
    });
  }
}
