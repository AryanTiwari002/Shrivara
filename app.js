/**
 * SHRIVARA - Official Store Data & Interactive Controller
 * Replicated 1:1 from https://shrivara.co/
 */

// Live Bestsellers & New Arrivals from shrivara.co
const BESTSELLERS = [
  {
    id: 101,
    title: "Hazoorilal inspired -Bracelet 1",
    category: "Bracelets & Bangles",
    price: 5700,
    comparePrice: 9500,
    discount: "40% OFF",
    rating: 5,
    reviews: 18,
    image: "https://shrivara.co/cdn/shop/files/WhatsAppImage2026-10-02at13.42.52_1.jpg?v=1791102703&width=600",
    badge: "Bestseller"
  },
  {
    id: 102,
    title: "Hazoorilal inspired -jewellery set3",
    category: "Jewellery Sets",
    price: 5000,
    comparePrice: 8500,
    discount: "41% OFF",
    rating: 5,
    reviews: 24,
    image: "https://shrivara.co/cdn/shop/files/WhatsApp_Image_2026-10-02_at_13.42.52.jpg?v=1791106092&width=600",
    badge: "Trending"
  },
  {
    id: 103,
    title: "Premium collection-jewellery set 2",
    category: "Jewellery Sets",
    price: 8000,
    comparePrice: 12500,
    discount: "36% OFF",
    rating: 5,
    reviews: 31,
    image: "https://shrivara.co/cdn/shop/files/WhatsAppImage2026-10-02at13.42.51_1.jpg?v=1791102550&width=600",
    badge: "Heritage"
  },
  {
    id: 104,
    title: "Premium collection-jewellery set 1",
    category: "Jewellery Sets",
    price: 9000,
    comparePrice: 14000,
    discount: "35% OFF",
    rating: 5,
    reviews: 27,
    image: "https://shrivara.co/cdn/shop/files/WhatsAppImage2026-10-02at13.42.51.jpg?v=1791102465&width=600",
    badge: "Polki Grade A"
  },
  {
    id: 105,
    title: "Hazoorilal inspired -jewellery set2",
    category: "Jewellery Sets",
    price: 12000,
    comparePrice: 18000,
    discount: "33% OFF",
    rating: 5,
    reviews: 19,
    image: "https://shrivara.co/cdn/shop/files/WhatsAppImage2026-10-02at13.42.48_1.jpg?v=1791100098&width=600",
    badge: "Luxury Edit"
  },
  {
    id: 106,
    title: "Hazoorilal inspired -jewellery set1",
    category: "Jewellery Sets",
    price: 12000,
    comparePrice: 18000,
    discount: "33% OFF",
    rating: 5,
    reviews: 22,
    image: "https://shrivara.co/cdn/shop/files/WhatsAppImage2026-10-02at13.42.48.jpg?v=1791099904&width=600",
    badge: "Royal Collection"
  },
  {
    id: 107,
    title: "Aura Navratna Kundan Choker Set",
    category: "Jewellery Sets",
    price: 4500,
    comparePrice: 6500,
    discount: "Sold Out",
    rating: 5,
    reviews: 14,
    image: "https://shrivara.co/cdn/shop/files/WhatsApp_Image_2026-09-10_at_15.48.18_2.jpg?v=1789539990&width=600",
    badge: "Sold Out",
    soldOut: true
  }
];

const NEW_ARRIVALS = [
  {
    id: 201,
    title: "Hazoorilal inspired -Bracelet 3",
    category: "Bracelets & Bangles",
    price: 5000,
    comparePrice: 7500,
    discount: "33% OFF",
    rating: 5,
    reviews: 11,
    image: "https://shrivara.co/cdn/shop/files/WhatsAppImage2026-10-02at13.42.55.jpg?v=1791102986&width=600",
    badge: "New"
  },
  {
    id: 202,
    title: "Hazoorilal inspired -Bracelet 2",
    category: "Bracelets & Bangles",
    price: 5000,
    comparePrice: 7500,
    discount: "33% OFF",
    rating: 5,
    reviews: 15,
    image: "https://shrivara.co/cdn/shop/files/WhatsAppImage2026-10-02at13.42.54.jpg?v=1791102954&width=600",
    badge: "New"
  },
  {
    id: 203,
    title: "Premium Pendant set 1",
    category: "Pendant Set",
    price: 600,
    comparePrice: 1200,
    discount: "50% OFF",
    rating: 4.9,
    reviews: 35,
    image: "https://shrivara.co/cdn/shop/files/WhatsAppImage2026-10-02at13.42.53.jpg?v=1791102817&width=600",
    badge: "Hot"
  },
  {
    id: 204,
    title: "The Empress Asymmetric Emerald & American Diamond Necklace Set",
    category: "Jewellery Sets",
    price: 1410,
    comparePrice: 2800,
    discount: "50% OFF",
    rating: 5,
    reviews: 40,
    image: "https://shrivara.co/cdn/shop/files/ChatGPTImageJul27_2026_02_49_38PM.png?v=1785144016&width=600",
    badge: "Bestseller"
  }
];

// App State
let cart = [
  {
    id: 101,
    title: "Hazoorilal inspired -Bracelet 1",
    price: 5700,
    qty: 1,
    image: "https://shrivara.co/cdn/shop/files/WhatsAppImage2026-10-02at13.42.52_1.jpg?v=1791102703&width=600"
  }
];
let wishlist = new Set();
let currentSlide = 0;
let slideInterval = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderProductCarousel('bestsellersGrid', BESTSELLERS);
  renderProductCarousel('newArrivalsGrid', NEW_ARRIVALS);
  initHeroSlider();
  updateCartUI();
  initEventListeners();
});

// Render Product Carousel Cards
function renderProductCarousel(containerId, productList) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = productList.map(product => `
    <div class="product-card" data-id="${product.id}">
      <div class="product-media">
        <img src="${product.image}" alt="${product.title}" loading="lazy">
        ${product.badge ? `<span class="product-badge ${product.soldOut ? 'badge-sold-out' : ''}">${product.badge}</span>` : ''}
        <button class="wishlist-btn ${wishlist.has(product.id) ? 'active' : ''}" onclick="toggleWishlist(${product.id})" aria-label="Add to wishlist">
          <i class="${wishlist.has(product.id) ? 'fas fa-heart' : 'far fa-heart'}"></i>
        </button>
      </div>
      <div class="product-details">
        <span class="product-category">${product.category}</span>
        <h3 class="product-title">${product.title}</h3>
        <div class="product-rating">
          <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
          <span>(${product.reviews})</span>
        </div>
        <div class="product-price-row">
          <span class="product-price">Rs. ${product.price.toLocaleString('en-IN')}.00</span>
          ${product.comparePrice ? `<span class="product-compare-price">Rs. ${product.comparePrice.toLocaleString('en-IN')}.00</span>` : ''}
          ${product.discount ? `<span class="product-discount">${product.discount}</span>` : ''}
        </div>
        <button class="add-to-cart-btn ${product.soldOut ? 'disabled' : ''}" onclick="${product.soldOut ? '' : `addToCart(${product.id})`}">
          ${product.soldOut ? 'Sold Out' : '<i class="fas fa-shopping-bag"></i> Add to Cart'}
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
    slideInterval = setInterval(window.nextSlide, 6000);
  }

  function resetAutoPlay() {
    clearInterval(slideInterval);
    startAutoPlay();
  }

  startAutoPlay();
}

// Carousel Scroll Navigation
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

  // Update heart icons
  document.querySelectorAll(`.product-card[data-id="${productId}"] .wishlist-btn`).forEach(btn => {
    btn.classList.toggle('active', wishlist.has(productId));
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = wishlist.has(productId) ? 'fas fa-heart' : 'far fa-heart';
    }
  });
}

// Cart Functionality
function addToCart(productId) {
  const allProducts = [...BESTSELLERS, ...NEW_ARRIVALS];
  const product = allProducts.find(p => p.id === productId);
  if (!product || product.soldOut) return;

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

  // Render Cart Items
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

// Live Search
function handleLiveSearch(query) {
  const resultsContainer = document.getElementById('searchResults');
  if (!query.trim()) {
    resultsContainer.innerHTML = '';
    return;
  }

  const allProducts = [...BESTSELLERS, ...NEW_ARRIVALS];
  const matches = allProducts.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) || 
    p.category.toLowerCase().includes(query.toLowerCase())
  );

  if (matches.length === 0) {
    resultsContainer.innerHTML = `<p style="padding: 16px; color: #888;">No jewellery found matching "${query}"</p>`;
    return;
  }

  resultsContainer.innerHTML = matches.map(p => `
    <div style="display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; cursor: pointer;" onclick="addToCart(${p.id}); closeSearchModal();">
      <img src="${p.image}" style="width: 50px; height: 50px; border-radius: 4px; object-fit: cover;">
      <div>
        <h5 style="font-size: 14px; font-weight: 600; color: #121212;">${p.title}</h5>
        <span style="font-size: 13px; color: #083a12; font-weight: 700;">Rs. ${p.price.toLocaleString('en-IN')}.00</span>
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
}
