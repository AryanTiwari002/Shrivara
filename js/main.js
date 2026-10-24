/**
 * ==========================================================================
 * SHRIVARA — Luxury Indian Jewellery Main Controller
 * Handcrafted Indian Heritage meets Modern Luxury
 * Vanilla ES6 • Mobile-First • Accessible • Resilient Storage
 * ==========================================================================
 */

// --------------------------------------------------------------------------
// 1. Safe Storage Abstraction (Try/Catch with In-Memory Fallback)
// --------------------------------------------------------------------------
const memoryStorage = new Map();

const storage = {
  get(key, defaultValue = null) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        return val !== null ? JSON.parse(val) : defaultValue;
      }
    } catch (e) {
      console.warn(`[Storage] Read fallback for key: ${key}`);
    }
    return memoryStorage.has(key) ? memoryStorage.get(key) : defaultValue;
  },
  set(key, value) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(value));
        return;
      }
    } catch (e) {
      console.warn(`[Storage] Write fallback for key: ${key}`);
    }
    memoryStorage.set(key, value);
  },
  remove(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {}
    memoryStorage.delete(key);
  }
};

// --------------------------------------------------------------------------
// 2. Global Configuration & State
// --------------------------------------------------------------------------
export const CONFIG = {
  storeName: "Shrivara",
  currencySymbol: "₹",
  freeShippingThreshold: 1999,
  whatsappNumber: "919830000000",
  whatsappMessage: "Hi Shrivara, I am browsing your jewellery showcase and would like personal styling assistance with an order.",
  whatsappVideoMessage: "Hi Shrivara, I would like to schedule a Complimentary 1-on-1 Video Consultation to view pieces live on camera.",
  pageSize: 16,
  categories: [
    { key: "all", label: "All", icon: "icon-cat-all" },
    { key: "Jewellery Sets", label: "Jewellery Sets", icon: "icon-cat-sets", img: "https://shrivara.co/cdn/shop/collections/WhatsApp_Image_2026-07-26_at_20.51.35.jpg?v=1785079938&width=400" },
    { key: "Earrings", label: "Earrings", icon: "icon-cat-earrings", img: "https://shrivara.co/cdn/shop/collections/WhatsApp_Image_2026-07-26_at_18.41.22.jpg?v=1785071683&width=400" },
    { key: "Bracelets & Bangles", label: "Bracelets & Bangles", icon: "icon-cat-bangles", img: "https://shrivara.co/cdn/shop/collections/WhatsApp_Image_2026-07-26_at_19.05.32.jpg?v=1785073014&width=400" },
    { key: "Necklaces", label: "Necklaces", icon: "icon-cat-necklaces", img: "https://cdn.shopify.com/s/files/1/0725/1728/8098/files/WhatsApp_Image_2026-09-10_at_15.48.18.jpg?v=1789539990&width=400" },
    { key: "Pendant Sets", label: "Pendant Sets", icon: "icon-cat-pendants", img: "https://shrivara.co/cdn/shop/collections/WhatsApp_Image_2026-07-26_at_18.14.32.jpg?v=1785069982&width=400" },
    { key: "Rings", label: "Rings", icon: "icon-cat-rings", img: "https://shrivara.co/cdn/shop/collections/ChatGPT_Image_Aug_18_2026_11_50_43_PM.png?v=1787077388&width=400" },
    { key: "Anti-Tarnish", label: "Anti-Tarnish", icon: "icon-cat-shield", img: "https://shrivara.co/cdn/shop/collections/Gemini_Generated_Image_3gqx753gqx753gqx.png?v=1789385692&width=400" }
  ]
};

// Application State
export const state = {
  products: [],
  filteredProducts: [],
  visibleCount: CONFIG.pageSize,
  activeCategory: "all",
  priceMin: 0,
  priceMax: 30000,
  activeSort: "featured",
  searchQuery: "",
  cart: storage.get("shrivara_cart", []),
  wishlist: new Set(storage.get("shrivara_wishlist", [])),
  theme: storage.get("shrivara_theme", null),
  lastFocusedElement: null
};

// --------------------------------------------------------------------------
// 3. Category Normalizer & Image Helper
// --------------------------------------------------------------------------
export function normalizeCategory(cat) {
  if (!cat) return "Other";
  const c = cat.trim().toLowerCase();
  if (c.includes("earring") || c === "jewellery") return "Earrings";
  if (c.includes("jewellery set")) return "Jewellery Sets";
  if (c.includes("bracelet") || c.includes("bangle")) return "Bracelets & Bangles";
  if (c.includes("necklace") || c.includes("choker") || c.includes("pendant &") || c === "necklaces & pendants") return "Necklaces";
  if (c.includes("pendant")) return "Pendant Sets";
  if (c.includes("ring")) return "Rings";
  if (c.includes("tarnish")) return "Anti-Tarnish";
  return "Jewellery Sets";
}

export function isAntiTarnishProduct(p) {
  if (p.isAntiTarnish) return true;
  const title = (p.title || "").toLowerCase();
  return /anti[- ]tarnish|waterproof|stainless steel/i.test(title);
}

export function getShopifyImageUrl(url, width = 600) {
  if (!url || typeof url !== 'string') return '';
  if (url.includes('width=')) {
    return url.replace(/width=\d+/, `width=${width}`);
  }
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}width=${width}`;
}

export function getShopifySrcSet(url) {
  if (!url || typeof url !== 'string') return '';
  return `${getShopifyImageUrl(url, 360)} 360w, ${getShopifyImageUrl(url, 600)} 600w, ${getShopifyImageUrl(url, 900)} 900w`;
}

export function formatPrice(amount) {
  if (!amount || amount <= 0) return "Price on Request";
  return `${CONFIG.currencySymbol}${Number(amount).toLocaleString('en-IN')}`;
}

// --------------------------------------------------------------------------
// 4. Initialization & Lifecycle
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  await loadProductData();
  initHeader();
  initShopSlider();
  initPromoBar();
  initHeroSlider();
  initCollectionsTiles();
  initCatalogue();
  initCarousels();
  initCartDrawer();
  initDemoCheckout();
  initSearchModal();
  initQuickViewModal();
  initConsultationModal();
  initAtelierConcierge();
  initPolicyModals();
  initFloatingUtilities();
  initNewsletter();
  initHashRouting();
  initScrollAnimations();
});

// --------------------------------------------------------------------------
// 5. Product Data Loader
// --------------------------------------------------------------------------
async function loadProductData() {
  if (typeof window !== "undefined" && window.ALL_PRODUCTS && Array.isArray(window.ALL_PRODUCTS)) {
    state.products = window.ALL_PRODUCTS;
  } else {
    try {
      const response = await fetch("products-data.json");
      if (response.ok) {
        state.products = await response.json();
      }
    } catch (e) {
      console.warn("[DataLoader] fetch failed, using fallback empty state", e);
    }
  }

  // Pre-calculate and attach normalized category
  state.products.forEach(p => {
    p.normalizedCategory = normalizeCategory(p.category);
    p.isEffectiveAntiTarnish = isAntiTarnishProduct(p);
  });
}

// --------------------------------------------------------------------------
// 6. Theme Controller (Light/Dark Mode)
// --------------------------------------------------------------------------
function initTheme() {
  const toggleBtn = document.getElementById("themeToggleBtn");
  const mobileToggleBtn = document.getElementById("mobileThemeToggleBtn");

  // Determine initial mode: stored preference -> system preference -> light default
  let currentTheme = state.theme;
  if (!currentTheme) {
    currentTheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  applyTheme(currentTheme, false);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const nextTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(nextTheme, true);
    });
  }

  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener("click", () => {
      const nextTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(nextTheme, true);
    });
  }

  // Listen to system changes if user hasn't explicitly set one
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
      if (!storage.get("shrivara_theme")) {
        applyTheme(e.matches ? "dark" : "light", false);
      }
    });
  }
}

function applyTheme(theme, persist = false) {
  const root = document.documentElement;
  const isDark = theme === "dark";

  root.setAttribute("data-theme", theme);
  root.classList.toggle("theme-dark", isDark);

  const iconSun = document.getElementById("iconThemeSun");
  const iconMoon = document.getElementById("iconThemeMoon");
  const toggleBtn = document.getElementById("themeToggleBtn");
  const mobileToggleBtn = document.getElementById("mobileThemeToggleBtn");
  const mobileToggleText = document.getElementById("mobileThemeToggleText");

  if (iconSun && iconMoon) {
    iconSun.style.display = isDark ? "block" : "none";
    iconMoon.style.display = isDark ? "none" : "block";
  }

  if (toggleBtn) {
    toggleBtn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    toggleBtn.title = isDark ? "Light Mode" : "Dark Mode";
  }

  if (mobileToggleText) {
    mobileToggleText.textContent = isDark ? "Light Mode" : "Dark Mode";
  }

  if (mobileToggleBtn) {
    const mobileIcon = mobileToggleBtn.querySelector(".icon use");
    if (mobileIcon) {
      mobileIcon.setAttribute("href", isDark ? "#icon-sun" : "#icon-moon");
    }
  }

  if (persist) {
    state.theme = theme;
    storage.set("shrivara_theme", theme);
    showToast(isDark ? "🌙 Switched to Dark Theme" : "☀️ Switched to Light Theme");
  }
}

// --------------------------------------------------------------------------
// 7. Promo Bar Rotation
// --------------------------------------------------------------------------
function initPromoBar() {
  const track = document.getElementById("promoTrack");
  if (!track) return;

  const messages = track.children;
  if (messages.length <= 1) return;

  let currentIndex = 0;
  let interval = null;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function nextMessage() {
    currentIndex = (currentIndex + 1) % messages.length;
    track.style.transform = `translateY(-${currentIndex * 100}%)`;
  }

  function startRotation() {
    if (prefersReduced) return;
    interval = setInterval(nextMessage, 4800);
  }

  function stopRotation() {
    clearInterval(interval);
  }

  startRotation();
  const bar = document.getElementById("promoBar");
  if (bar) {
    bar.addEventListener("mouseenter", stopRotation);
    bar.addEventListener("mouseleave", startRotation);
    bar.addEventListener("focusin", stopRotation);
    bar.addEventListener("focusout", startRotation);
  }
}

// --------------------------------------------------------------------------
// 8. Sticky Header & Navigation (Mega Menu + Mobile Drawer)
// --------------------------------------------------------------------------
function initHeader() {
  const header = document.getElementById("siteHeader");
  const mobileToggle = document.getElementById("mobileMenuToggle");
  const mobileBackdrop = document.getElementById("mobileNavBackdrop");
  const mobileClose = document.getElementById("mobileNavClose");

  // Sticky shadow on scroll
  window.addEventListener("scroll", () => {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }, { passive: true });

  // Populate Mega Menu Grid
  const megaGrid = document.getElementById("megaMenuGrid");
  if (megaGrid) {
    megaGrid.innerHTML = CONFIG.categories.filter(c => c.key !== "all").map(cat => {
      let count = 0;
      if (cat.key === "Anti-Tarnish") {
        count = state.products.filter(p => p.isEffectiveAntiTarnish).length;
      } else {
        count = state.products.filter(p => p.normalizedCategory === cat.key).length;
      }

      return `
        <a href="#catalog" class="mega-item" data-category="${cat.key}">
          <div class="mega-thumb-wrap">
            <img src="${cat.img}" alt="${cat.label}" loading="lazy" width="100" height="125">
          </div>
          <span class="mega-title">${cat.label}</span>
          <span class="mega-count">${count} pieces</span>
        </a>
      `;
    }).join("");

    megaGrid.querySelectorAll(".mega-item").forEach(item => {
      item.addEventListener("click", e => {
        e.preventDefault();
        const cat = item.dataset.category;
        filterByCategory(cat);
      });
    });
  }

  // Mobile Drawer Toggle
  if (mobileToggle && mobileBackdrop) {
    mobileToggle.addEventListener("click", () => openMobileNav());
    mobileClose?.addEventListener("click", () => closeMobileNav());
    mobileBackdrop.addEventListener("click", e => {
      if (e.target === mobileBackdrop) closeMobileNav();
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && mobileBackdrop.classList.contains("is-open")) {
        closeMobileNav();
      }
    });
  }

  // Active Section Spy in Navigation
  const observedSections = document.querySelectorAll("section[id]");
  if (observedSections.length && "IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          document.querySelectorAll(".nav-link").forEach(link => {
            const href = link.getAttribute("href") || "";
            link.classList.toggle("active", href === `#${id}`);
          });
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });

    observedSections.forEach(s => navObserver.observe(s));
  }
}

function openMobileNav() {
  const backdrop = document.getElementById("mobileNavBackdrop");
  if (!backdrop) return;
  state.lastFocusedElement = document.activeElement;
  backdrop.classList.add("is-open");
  document.body.classList.add("scroll-locked");
  document.getElementById("mobileNavClose")?.focus();
}

function closeMobileNav() {
  const backdrop = document.getElementById("mobileNavBackdrop");
  if (!backdrop) return;
  backdrop.classList.remove("is-open");
  document.body.classList.remove("scroll-locked");
  state.lastFocusedElement?.focus();
}

// --------------------------------------------------------------------------
// 9. Hero Editorial Slider
// --------------------------------------------------------------------------
function initHeroSlider() {
  const slides = document.querySelectorAll(".hero-slide");
  const dotsContainer = document.getElementById("heroDots");
  if (!slides.length || !dotsContainer) return;

  let current = 0;
  let timer = null;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Create dot buttons
  dotsContainer.innerHTML = Array.from(slides).map((_, i) => `
    <button class="hero-dot ${i === 0 ? 'is-active' : ''}" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>
  `).join("");

  const dots = dotsContainer.querySelectorAll(".hero-dot");

  function goToSlide(index) {
    slides.forEach((s, i) => s.classList.toggle("is-active", i === index));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
    current = index;
  }

  function nextSlide() {
    goToSlide((current + 1) % slides.length);
  }

  function prevSlide() {
    goToSlide((current - 1 + slides.length) % slides.length);
  }

  function startAutoplay() {
    if (prefersReduced) return;
    if (timer) clearInterval(timer);
    timer = setInterval(nextSlide, 6500);
  }

  function stopAutoplay() {
    if (timer) clearInterval(timer);
  }

  dots.forEach(dot => {
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      goToSlide(Number(dot.dataset.index));
      stopAutoplay();
      startAutoplay();
    });
  });

  const prevBtn = document.getElementById("heroPrev");
  const nextBtn = document.getElementById("heroNext");
  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      prevSlide();
      stopAutoplay();
      startAutoplay();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      nextSlide();
      stopAutoplay();
      startAutoplay();
    });
  }

  const hero = document.getElementById("heroSection");
  if (hero) {
    hero.addEventListener("mouseenter", stopAutoplay);
    hero.addEventListener("mouseleave", startAutoplay);
    hero.addEventListener("focusin", stopAutoplay);
    hero.addEventListener("focusout", startAutoplay);

    // Mobile swipe support
    let touchStartX = 0;
    let touchStartY = 0;
    hero.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    hero.addEventListener("touchend", (e) => {
      if (e.changedTouches.length === 1) {
        const diffX = touchStartX - e.changedTouches[0].clientX;
        const diffY = touchStartY - e.changedTouches[0].clientY;
        // Check if predominantly horizontal swipe
        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX > 0) {
            nextSlide();
          } else {
            prevSlide();
          }
          stopAutoplay();
          startAutoplay();
        }
      }
    }, { passive: true });

    // Keyboard navigation
    hero.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        prevSlide();
        stopAutoplay();
        startAutoplay();
      } else if (e.key === "ArrowRight") {
        nextSlide();
        stopAutoplay();
        startAutoplay();
      }
    });
  }

  startAutoplay();
}

// --------------------------------------------------------------------------
// 10. Collections Section Tiles
// --------------------------------------------------------------------------
function initCollectionsTiles() {
  const grid = document.getElementById("collectionsGrid");
  if (!grid) return;

  const validCategories = CONFIG.categories.filter(c => c.key !== "all");

  grid.innerHTML = validCategories.map(cat => {
    let count = 0;
    if (cat.key === "Anti-Tarnish") {
      count = state.products.filter(p => p.isEffectiveAntiTarnish).length;
    } else {
      count = state.products.filter(p => p.normalizedCategory === cat.key).length;
    }

    return `
      <a href="#catalog" class="collection-card" data-category="${cat.key}">
        <img class="collection-card-img" src="${cat.img}" alt="${cat.label} collection" loading="lazy" width="400" height="500">
        <div class="collection-card-overlay">
          <span class="collection-card-tag">${count} Pieces</span>
          <h3 class="collection-card-title">${cat.label}</h3>
          <span class="collection-card-cta">Shop Collection &rarr;</span>
        </div>
      </a>
    `;
  }).join("");

  grid.querySelectorAll(".collection-card").forEach(card => {
    card.addEventListener("click", e => {
      e.preventDefault();
      filterByCategory(card.dataset.category);
      const catalogEl = document.getElementById("catalog");
      if (catalogEl) catalogEl.scrollIntoView({ behavior: "smooth" });
    });
  });
}

window.filterByOccasion = function(catKey) {
  filterByCategory(catKey);
  const catalogEl = document.getElementById("catalog");
  if (catalogEl) catalogEl.scrollIntoView({ behavior: "smooth" });
};

// --------------------------------------------------------------------------
// 11. Catalogue Controller (Chips, Toolbar, Grid, Pagination)
// --------------------------------------------------------------------------
function initCatalogue() {
  renderCategoryChips();
  initToolbarListeners();
  applyFiltersAndRender();
}

function renderCategoryChips() {
  const container = document.getElementById("categoryChips");
  if (!container) return;

  container.innerHTML = CONFIG.categories.map(cat => {
    let count = 0;
    if (cat.key === "all") {
      count = state.products.length;
    } else if (cat.key === "Anti-Tarnish") {
      count = state.products.filter(p => p.isEffectiveAntiTarnish).length;
    } else {
      count = state.products.filter(p => p.normalizedCategory === cat.key).length;
    }

    const isActive = state.activeCategory.toLowerCase() === cat.key.toLowerCase();
    const iconId = cat.icon || "icon-cat-all";

    return `
      <button class="chip-btn ${isActive ? 'is-active' : ''}" data-category="${cat.key}" role="tab" aria-selected="${isActive}">
        <svg class="chip-icon" width="16" height="16" aria-hidden="true"><use href="#${iconId}"></use></svg>
        <span class="chip-label">${cat.label}</span>
        <span class="chip-count">(${count})</span>
      </button>
    `;
  }).join("");

  container.querySelectorAll(".chip-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      filterByCategory(btn.dataset.category);
    });
  });
}

function updatePriceSliderUI(minVal = state.priceMin, maxVal = state.priceMax) {
  const sliderMin = document.getElementById("sliderPriceMin");
  const sliderMax = document.getElementById("sliderPriceMax");
  const rangeFill = document.getElementById("rangeFill");
  const display = document.getElementById("priceSliderDisplay");
  const inputMin = document.getElementById("priceInputMin");
  const inputMax = document.getElementById("priceInputMax");

  // Synchronize range sliders
  if (sliderMin && sliderMin.value !== String(minVal)) sliderMin.value = minVal;
  if (sliderMax && sliderMax.value !== String(maxVal)) sliderMax.value = maxVal;

  // Accessibility ARIA values
  if (sliderMin) {
    sliderMin.setAttribute("aria-valuenow", minVal);
    sliderMin.setAttribute("aria-valuetext", `₹${minVal.toLocaleString('en-IN')}`);
  }
  if (sliderMax) {
    sliderMax.setAttribute("aria-valuenow", maxVal);
    sliderMax.setAttribute("aria-valuetext", `₹${maxVal.toLocaleString('en-IN')}`);
  }

  // Synchronize manual numeric inputs (avoid overwriting while user is actively typing)
  if (inputMin && document.activeElement !== inputMin) {
    inputMin.value = minVal;
  }
  if (inputMax && document.activeElement !== inputMax) {
    inputMax.value = maxVal;
  }

  // Track active fill percentage
  const minPercent = (minVal / 30000) * 100;
  const maxPercent = (maxVal / 30000) * 100;

  if (rangeFill) {
    rangeFill.style.left = `${minPercent}%`;
    rangeFill.style.width = `${Math.max(0, maxPercent - minPercent)}%`;
  }

  // Live Price Labels in Indian Rupee notation (e.g. ₹0 — ₹30,000)
  if (display) {
    display.textContent = `₹${minVal.toLocaleString('en-IN')} — ₹${maxVal.toLocaleString('en-IN')}`;
  }
}

function initToolbarListeners() {
  const searchInput = document.getElementById("catalogSearch");
  const sortSelect = document.getElementById("sortSelect");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  const sliderMin = document.getElementById("sliderPriceMin");
  const sliderMax = document.getElementById("sliderPriceMax");
  const inputMin = document.getElementById("priceInputMin");
  const inputMax = document.getElementById("priceInputMax");
  const resetBtn = document.getElementById("priceSliderReset");

  // Debounced search
  let debounceTimeout = null;
  searchInput?.addEventListener("input", e => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      state.visibleCount = CONFIG.pageSize;
      applyFiltersAndRender();
    }, 180);
  });

  // Price Range Slider Controls
  let priceDebounce = null;
  function handleSliderChange(e) {
    let minVal = parseInt(sliderMin.value, 10);
    let maxVal = parseInt(sliderMax.value, 10);
    if (isNaN(minVal)) minVal = 0;
    if (isNaN(maxVal)) maxVal = 30000;

    // Clamping to [0, 30000]
    minVal = Math.max(0, Math.min(30000, minVal));
    maxVal = Math.max(0, Math.min(30000, maxVal));

    // Prevent handles from crossing each other
    if (e && e.target === sliderMin) {
      if (minVal > maxVal) {
        minVal = maxVal;
        sliderMin.value = minVal;
      }
    } else if (e && e.target === sliderMax) {
      if (maxVal < minVal) {
        maxVal = minVal;
        sliderMax.value = maxVal;
      }
    }

    state.priceMin = minVal;
    state.priceMax = maxVal;
    updatePriceSliderUI(minVal, maxVal);

    clearTimeout(priceDebounce);
    priceDebounce = setTimeout(() => {
      state.visibleCount = CONFIG.pageSize;
      applyFiltersAndRender();
      updateUrlHash();
    }, 100);
  }

  sliderMin?.addEventListener("input", e => {
    sliderMin.style.zIndex = "3";
    if (sliderMax) sliderMax.style.zIndex = "2";
    handleSliderChange(e);
  });

  sliderMax?.addEventListener("input", e => {
    sliderMax.style.zIndex = "3";
    if (sliderMin) sliderMin.style.zIndex = "2";
    handleSliderChange(e);
  });

  // Manual Numeric Input Listeners
  function handleManualInputChange(e) {
    let minVal = parseInt(inputMin?.value, 10);
    let maxVal = parseInt(inputMax?.value, 10);

    if (isNaN(minVal)) minVal = 0;
    if (isNaN(maxVal)) maxVal = 30000;

    minVal = Math.max(0, Math.min(30000, minVal));
    maxVal = Math.max(0, Math.min(30000, maxVal));

    if (minVal > maxVal) {
      if (e && e.target === inputMin) {
        maxVal = minVal;
        if (inputMax) inputMax.value = maxVal;
      } else {
        minVal = maxVal;
        if (inputMin) inputMin.value = minVal;
      }
    }

    state.priceMin = minVal;
    state.priceMax = maxVal;
    updatePriceSliderUI(minVal, maxVal);

    clearTimeout(priceDebounce);
    priceDebounce = setTimeout(() => {
      state.visibleCount = CONFIG.pageSize;
      applyFiltersAndRender();
      updateUrlHash();
    }, 150);
  }

  inputMin?.addEventListener("input", handleManualInputChange);
  inputMax?.addEventListener("input", handleManualInputChange);

  inputMin?.addEventListener("blur", () => {
    let val = parseInt(inputMin.value, 10);
    if (isNaN(val) || val < 0) val = 0;
    if (val > state.priceMax) val = state.priceMax;
    inputMin.value = val;
    state.priceMin = val;
    updatePriceSliderUI(state.priceMin, state.priceMax);
    applyFiltersAndRender();
    updateUrlHash();
  });

  inputMax?.addEventListener("blur", () => {
    let val = parseInt(inputMax.value, 10);
    if (isNaN(val) || val > 30000) val = 30000;
    if (val < state.priceMin) val = state.priceMin;
    inputMax.value = val;
    state.priceMax = val;
    updatePriceSliderUI(state.priceMin, state.priceMax);
    applyFiltersAndRender();
    updateUrlHash();
  });

  // Reset Price Button
  resetBtn?.addEventListener("click", () => {
    resetPriceFilter();
  });

  sortSelect?.addEventListener("change", e => {
    state.activeSort = e.target.value;
    applyFiltersAndRender();
    updateUrlHash();
  });

  // View Mode Toggles (Grid vs List Layout)
  const viewGridBtn = document.getElementById("viewGridBtn");
  const viewListBtn = document.getElementById("viewListBtn");
  const catalogGrid = document.getElementById("catalogGrid");

  viewGridBtn?.addEventListener("click", () => {
    viewGridBtn.classList.add("is-active");
    viewListBtn?.classList.remove("is-active");
    catalogGrid?.classList.remove("view-list");
  });

  viewListBtn?.addEventListener("click", () => {
    viewListBtn.classList.add("is-active");
    viewGridBtn?.classList.remove("is-active");
    catalogGrid?.classList.add("view-list");
  });

  loadMoreBtn?.addEventListener("click", () => {
    state.visibleCount += CONFIG.pageSize;
    applyFiltersAndRender(false);
  });

  updatePriceSliderUI(state.priceMin, state.priceMax);
}

export function resetPriceFilter() {
  state.priceMin = 0;
  state.priceMax = 30000;
  state.visibleCount = CONFIG.pageSize;
  updatePriceSliderUI(0, 30000);
  applyFiltersAndRender();
  updateUrlHash();
  showToast("Price range reset to ₹0 — ₹30,000");
}
window.resetPriceFilter = resetPriceFilter;

export function filterByCategory(categoryKey) {
  state.activeCategory = categoryKey;
  state.visibleCount = CONFIG.pageSize;

  // Update chip active classes
  document.querySelectorAll(".chip-btn").forEach(btn => {
    const match = btn.dataset.category.toLowerCase() === categoryKey.toLowerCase();
    btn.classList.toggle("is-active", match);
    btn.setAttribute("aria-selected", match);
  });

  applyFiltersAndRender();

  // Smooth scroll to catalog
  const catalogEl = document.getElementById("catalog");
  if (catalogEl) {
    catalogEl.scrollIntoView({ behavior: "smooth" });
  }

  // Update URL hash
  updateUrlHash();
}

function applyFiltersAndRender(resetScroll = true) {
  let list = [...state.products];

  // 1. Category Filter
  if (state.activeCategory !== "all") {
    if (state.activeCategory.toLowerCase() === "anti-tarnish") {
      list = list.filter(p => p.isEffectiveAntiTarnish);
    } else {
      list = list.filter(p => p.normalizedCategory.toLowerCase() === state.activeCategory.toLowerCase());
    }
  }

  // 2. Price Filter (Interactive Range Slider)
  if (state.priceMin > 0 || state.priceMax < 30000) {
    list = list.filter(p => {
      if (!p.price || p.price <= 0) return false;
      return p.price >= state.priceMin && p.price <= state.priceMax;
    });
  }

  // 3. Search Query Filter
  if (state.searchQuery) {
    const q = state.searchQuery;
    list = list.filter(p => {
      const titleMatch = (p.title || "").toLowerCase().includes(q);
      const catMatch = (p.category || "").toLowerCase().includes(q);
      return titleMatch || catMatch;
    });
  }

  // 4. Sorting
  if (state.activeSort === "price-low") {
    list.sort((a, b) => a.price - b.price);
  } else if (state.activeSort === "price-high") {
    list.sort((a, b) => b.price - a.price);
  } else if (state.activeSort === "newest") {
    list.sort((a, b) => String(b.id || "").localeCompare(String(a.id || "")));
  } else if (state.activeSort === "rating") {
    list.sort((a, b) => (b.rating || 5) - (a.rating || 5));
  } else if (state.activeSort === "title-asc") {
    list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }

  state.filteredProducts = list;

  // 5. Render Active Filters Strip
  renderActiveFiltersStrip();

  // 6. Update Header Count
  const countBadge = document.getElementById("catalogCountBadge");
  const total = list.length;
  const showing = Math.min(state.visibleCount, total);
  if (countBadge) {
    countBadge.textContent = `Showing ${showing} of ${total} pieces`;
  }

  // Announce to Screen Readers
  const srAnnounce = document.getElementById("catalogAriaLive");
  if (srAnnounce) {
    srAnnounce.textContent = `Filtered results updated: showing ${showing} of ${total} jewellery pieces.`;
  }

  // 7. Render Grid Cards
  const grid = document.getElementById("catalogGrid");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  if (!grid) return;

  if (total === 0) {
    const isPriceFiltered = state.priceMin > 0 || state.priceMax < 30000;
    grid.innerHTML = `
      <div class="catalog-empty-state">
        <svg class="icon" width="48" height="48" aria-hidden="true"><use href="#icon-gem"></use></svg>
        <h3 style="font-size: 1.5rem; margin-bottom: 8px;">${isPriceFiltered ? 'No Jewellery in This Price Range' : 'No Jewellery Found'}</h3>
        <p style="margin-bottom: 16px;">
          ${isPriceFiltered
            ? `No pieces found between ₹${state.priceMin.toLocaleString('en-IN')} and ₹${state.priceMax.toLocaleString('en-IN')}.`
            : "We couldn't find matching designs for your selected criteria."}
        </p>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          ${isPriceFiltered ? `<button class="btn-primary" onclick="window.resetPriceFilter()">Reset Price Range</button>` : ""}
          <button class="${isPriceFiltered ? 'btn-secondary' : 'btn-primary'}" onclick="window.clearAllFilters()">Clear All Filters</button>
        </div>
      </div>
    `;
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
    return;
  }

  const visibleItems = list.slice(0, state.visibleCount);
  grid.innerHTML = visibleItems.map(p => createProductCardHTML(p)).join("");
  attachCardEvents(grid);

  // 8. Load More Button Status
  if (loadMoreBtn) {
    if (state.visibleCount >= total) {
      loadMoreBtn.style.display = "none";
    } else {
      loadMoreBtn.style.display = "inline-flex";
      loadMoreBtn.textContent = `Load More Pieces (${total - state.visibleCount} remaining)`;
    }
  }
}

function renderActiveFiltersStrip() {
  const container = document.getElementById("activeFiltersStrip");
  if (!container) return;

  const hasCategory = state.activeCategory !== "all";
  const hasPrice = state.priceMin > 0 || state.priceMax < 30000;
  const hasSearch = Boolean(state.searchQuery);

  if (!hasCategory && !hasPrice && !hasSearch) {
    container.innerHTML = "";
    container.style.display = "none";
    return;
  }

  container.style.display = "flex";
  let html = "";

  if (hasCategory) {
    const label = CONFIG.categories.find(c => c.key.toLowerCase() === state.activeCategory.toLowerCase())?.label || state.activeCategory;
    html += `
      <span class="active-filter-tag">
        Category: ${label}
        <button class="active-filter-remove" data-remove="category" aria-label="Remove category filter">&times;</button>
      </span>
    `;
  }

  if (hasPrice) {
    let priceLabel = "";
    if (state.priceMin === 0) {
      priceLabel = `Up to ₹${state.priceMax.toLocaleString('en-IN')}`;
    } else if (state.priceMax === 30000) {
      priceLabel = `Above ₹${state.priceMin.toLocaleString('en-IN')}`;
    } else {
      priceLabel = `₹${state.priceMin.toLocaleString('en-IN')} — ₹${state.priceMax.toLocaleString('en-IN')}`;
    }
    html += `
      <span class="active-filter-tag">
        Price: ${priceLabel}
        <button class="active-filter-remove" data-remove="price" aria-label="Remove price filter">&times;</button>
      </span>
    `;
  }

  if (hasSearch) {
    html += `
      <span class="active-filter-tag">
        Search: "${state.searchQuery}"
        <button class="active-filter-remove" data-remove="search" aria-label="Remove search filter">&times;</button>
      </span>
    `;
  }

  html += `<button class="clear-all-filters-btn" id="clearAllFiltersBtn">Clear all</button>`;
  container.innerHTML = html;

  container.querySelectorAll(".active-filter-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.remove;
      if (type === "category") state.activeCategory = "all";
      if (type === "price") {
        resetPriceFilter();
        return;
      }
      if (type === "search") {
        state.searchQuery = "";
        const inp = document.getElementById("catalogSearch");
        if (inp) inp.value = "";
      }
      renderCategoryChips();
      applyFiltersAndRender();
      updateUrlHash();
    });
  });

  document.getElementById("clearAllFiltersBtn")?.addEventListener("click", clearAllFilters);
}

export function clearAllFilters() {
  state.activeCategory = "all";
  state.priceMin = 0;
  state.priceMax = 30000;
  state.activeSort = "featured";
  state.searchQuery = "";
  state.visibleCount = CONFIG.pageSize;

  const searchInput = document.getElementById("catalogSearch");
  if (searchInput) searchInput.value = "";

  updatePriceSliderUI(0, 30000);

  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) sortSelect.value = "featured";

  renderCategoryChips();
  applyFiltersAndRender();
  updateUrlHash();
  showToast("All filters cleared");
}
window.clearAllFilters = clearAllFilters;

function updateUrlHash() {
  const params = new URLSearchParams();
  if (state.activeCategory !== "all") params.set("cat", state.activeCategory.toLowerCase());
  if (state.priceMin > 0) params.set("min", state.priceMin);
  if (state.priceMax < 30000) params.set("max", state.priceMax);
  if (state.activeSort !== "featured") params.set("sort", state.activeSort);
  const paramStr = params.toString();
  window.history.replaceState(null, "", paramStr ? `#catalog?${paramStr}` : "#catalog");
}

function initHashRouting() {
  function readHash() {
    const hash = window.location.hash;
    if (hash === "#new-arrivals") {
      if (typeof window.switchShowcaseTab === "function") window.switchShowcaseTab("new-arrivals");
      document.getElementById("curated-showcase")?.scrollIntoView({ behavior: "smooth" });
    } else if (hash === "#bestsellers") {
      if (typeof window.switchShowcaseTab === "function") window.switchShowcaseTab("bestsellers");
      document.getElementById("curated-showcase")?.scrollIntoView({ behavior: "smooth" });
    } else if (hash && hash.includes("?")) {
      const q = hash.split("?")[1];
      const params = new URLSearchParams(q);
      const cat = params.get("cat");
      const minP = params.get("min");
      const maxP = params.get("max");
      const sort = params.get("sort");

      if (cat) state.activeCategory = cat;
      if (minP || maxP) {
        state.priceMin = minP ? Math.max(0, parseInt(minP, 10)) : 0;
        state.priceMax = maxP ? Math.min(30000, parseInt(maxP, 10)) : 30000;
        updatePriceSliderUI(state.priceMin, state.priceMax);
      }
      if (sort) {
        state.activeSort = sort;
        const sel = document.getElementById("sortSelect");
        if (sel) sel.value = sort;
      }

      renderCategoryChips();
      applyFiltersAndRender();
    }
  }

  // Intercept nav links directly for instant responsiveness
  document.querySelectorAll('a[href="#new-arrivals"]').forEach(a => {
    a.addEventListener("click", () => {
      if (typeof window.switchShowcaseTab === "function") window.switchShowcaseTab("new-arrivals");
    });
  });

  document.querySelectorAll('a[href="#bestsellers"]').forEach(a => {
    a.addEventListener("click", () => {
      if (typeof window.switchShowcaseTab === "function") window.switchShowcaseTab("bestsellers");
    });
  });

  window.addEventListener("hashchange", readHash);
  readHash();
}

// --------------------------------------------------------------------------
// 12. Product Card Component Generator
// --------------------------------------------------------------------------
export function createProductCardHTML(p) {
  const isWish = state.wishlist.has(p.id);
  const hasMultipleImages = p.images && p.images.length > 1;
  const primaryImg = getShopifyImageUrl(p.image, 600);
  const primarySrcset = getShopifySrcSet(p.image);
  const secondaryImg = hasMultipleImages ? getShopifyImageUrl(p.images[1], 600) : "";
  const secondarySrcset = hasMultipleImages ? getShopifySrcSet(p.images[1]) : "";

  // Badge Logic
  let badgeHTML = "";
  if (p.isSoldOut || p.price <= 0) {
    badgeHTML = `<span class="product-badge badge-sold-out">Sold Out</span>`;
  } else if (p.isEffectiveAntiTarnish) {
    badgeHTML = `<span class="product-badge badge-anti-tarnish">Anti-Tarnish</span>`;
  } else if (p.discount && p.price > 0) {
    badgeHTML = `<span class="product-badge badge-discount">${p.discount}</span>`;
  } else if (p.title.includes("Hazoorilal") || p.title.includes("Premium") || p.title.includes("Navratna")) {
    badgeHTML = `<span class="product-badge badge-bestseller">Bestseller</span>`;
  } else if (p.title.includes("Empress") || p.title.includes("Regalia") || p.title.includes("Vintage Heritage") || p.title.includes("Pearl Drop")) {
    badgeHTML = `<span class="product-badge badge-new">New In</span>`;
  }

  // Price formatting
  const currentPriceText = p.price > 0 ? formatPrice(p.price) : "Sold Out";
  const comparePriceHTML = (p.comparePrice > p.price && p.price > 0)
    ? `<span class="price-compare">${formatPrice(p.comparePrice)}</span>`
    : "";

  return `
    <article class="product-card" data-id="${p.id}">
      <div class="product-card-media" tabindex="0" role="button" aria-label="View details for ${p.title}">
        <div class="product-badge-slot">
          ${badgeHTML}
        </div>

        <button class="product-card-wishlist-btn ${isWish ? 'is-active' : ''}" 
                data-wishlist-id="${p.id}" 
                aria-label="${isWish ? 'Remove from wishlist' : 'Add to wishlist'}" 
                aria-pressed="${isWish}">
          <svg class="icon" width="18" height="18" aria-hidden="true">
            <use href="${isWish ? '#icon-heart-fill' : '#icon-heart'}"></use>
          </svg>
        </button>

        <img class="product-card-img product-card-img-primary" 
             src="${primaryImg}" 
             srcset="${primarySrcset}"
             sizes="(max-width: 600px) 50vw, (max-width: 1024px) 33vw, 25vw"
             alt="${p.title}" 
             loading="lazy" 
             decoding="async"
             width="400" 
             height="500">

        ${hasMultipleImages ? `
          <img class="product-card-img product-card-img-secondary" 
               src="${secondaryImg}" 
               srcset="${secondarySrcset}"
               sizes="(max-width: 600px) 50vw, (max-width: 1024px) 33vw, 25vw"
               alt="${p.title} alternate view" 
               loading="lazy" 
               decoding="async"
               width="400" 
               height="500">
        ` : ''}

        <button class="product-card-quickview-btn" data-quickview-id="${p.id}">
          <svg class="icon" width="14" height="14" aria-hidden="true"><use href="#icon-search"></use></svg>
          Quick View
        </button>
      </div>

      <div class="product-card-details">
        <span class="product-card-category">${p.normalizedCategory}</span>
        <h3 class="product-card-title" data-quickview-id="${p.id}" title="${p.title}">${p.title}</h3>
        
        <div class="product-card-price-row">
          <span class="price-current">${currentPriceText}</span>
          ${comparePriceHTML}
        </div>

        <button class="product-card-add-btn" data-add-cart-id="${p.id}" ${p.isSoldOut || p.price <= 0 ? 'disabled' : ''}>
          <svg class="icon" width="14" height="14" aria-hidden="true"><use href="#icon-bag"></use></svg>
          ${p.isSoldOut || p.price <= 0 ? 'Sold Out' : 'Add to Bag'}
        </button>
      </div>
    </article>
  `;
}

export function attachCardEvents(container) {
  // Wishlist toggle
  container.querySelectorAll("[data-wishlist-id]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      toggleWishlist(Number(btn.dataset.wishlistId));
    });
  });

  // Quick View triggers
  container.querySelectorAll("[data-quickview-id]").forEach(el => {
    el.addEventListener("click", e => {
      e.stopPropagation();
      openQuickView(Number(el.dataset.quickviewId));
    });
  });

  // Card media keyboard enter
  container.querySelectorAll(".product-card-media").forEach(el => {
    el.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const card = el.closest(".product-card");
        if (card) openQuickView(Number(card.dataset.id));
      }
    });
  });

  // Add to Bag buttons
  container.querySelectorAll("[data-add-cart-id]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      addToCart(Number(btn.dataset.addCartId), 1);
    });
  });
}

// --------------------------------------------------------------------------
// 13. Wishlist Management
// --------------------------------------------------------------------------
export function toggleWishlist(productId) {
  const p = state.products.find(item => item.id === productId);
  if (!p) return;

  const isSaved = state.wishlist.has(productId);
  if (isSaved) {
    state.wishlist.delete(productId);
    showToast(`Removed from wishlist: ${p.title}`);
  } else {
    state.wishlist.add(productId);
    showToast(`Saved to wishlist: ${p.title} ❤️`);
  }

  storage.set("shrivara_wishlist", [...state.wishlist]);
  updateWishlistUI();

  // Update card buttons
  document.querySelectorAll(`[data-wishlist-id="${productId}"]`).forEach(btn => {
    const active = state.wishlist.has(productId);
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active);
    const icon = btn.querySelector("use");
    if (icon) {
      icon.setAttribute("href", active ? "#icon-heart-fill" : "#icon-heart");
    }
  });
}

function updateWishlistUI() {
  const badge = document.getElementById("wishlistCountBadge");
  if (badge) {
    badge.textContent = state.wishlist.size;
  }
}

// --------------------------------------------------------------------------
// 14. Cart Drawer & Bag Logic
// --------------------------------------------------------------------------
function initCartDrawer() {
  const openBtn = document.getElementById("cartDrawerOpenBtn");
  const closeBtn = document.getElementById("cartDrawerCloseBtn");
  const backdrop = document.getElementById("cartBackdrop");

  openBtn?.addEventListener("click", () => openCartDrawer());
  closeBtn?.addEventListener("click", () => closeCartDrawer());
  backdrop?.addEventListener("click", e => {
    if (e.target === backdrop) closeCartDrawer();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && backdrop?.classList.contains("is-open")) {
      closeCartDrawer();
    }
  });

  updateCartUI();
}

export function openCartDrawer() {
  const backdrop = document.getElementById("cartBackdrop");
  if (!backdrop) return;
  state.lastFocusedElement = document.activeElement;
  backdrop.classList.add("is-open");
  document.body.classList.add("scroll-locked");
  document.getElementById("cartDrawerCloseBtn")?.focus();
}

export function closeCartDrawer() {
  const backdrop = document.getElementById("cartBackdrop");
  if (!backdrop) return;
  backdrop.classList.remove("is-open");
  document.body.classList.remove("scroll-locked");
  state.lastFocusedElement?.focus();
}

export function addToCart(productId, qty = 1) {
  const product = state.products.find(p => p.id === productId);
  if (!product || product.isSoldOut || product.price <= 0) return;

  const existing = state.cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    state.cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      qty: qty
    });
  }

  storage.set("shrivara_cart", state.cart);
  updateCartUI();
  openCartDrawer();
  showToast(`Added to shopping bag: ${product.title}`);
}

export function updateCartItemQty(productId, delta) {
  const item = state.cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter(i => i.id !== productId);
  }

  storage.set("shrivara_cart", state.cart);
  updateCartUI();
}

export function removeCartItem(productId) {
  state.cart = state.cart.filter(i => i.id !== productId);
  storage.set("shrivara_cart", state.cart);
  updateCartUI();
  showToast("Item removed from bag");
}

function updateCartUI() {
  const countBadge = document.getElementById("cartCountBadge");
  const itemsContainer = document.getElementById("cartDrawerItems");
  const subtotalEl = document.getElementById("cartSubtotalAmount");
  const shippingText = document.getElementById("shippingBarText");
  const shippingFill = document.getElementById("shippingProgressFill");

  const totalQty = state.cart.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = state.cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  if (countBadge) countBadge.textContent = totalQty;
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);

  // Free Shipping Meter (Threshold: Rs. 1,999)
  if (shippingText && shippingFill) {
    const limit = CONFIG.freeShippingThreshold;
    if (subtotal >= limit) {
      shippingFill.style.width = "100%";
      shippingFill.style.backgroundColor = "var(--accent)";
      shippingText.innerHTML = `🎉 You have unlocked <strong>FREE Insured Shipping!</strong>`;
    } else {
      const remaining = limit - subtotal;
      const pct = Math.min(100, Math.round((subtotal / limit) * 100));
      shippingFill.style.width = `${pct}%`;
      shippingFill.style.backgroundColor = "var(--gold)";
      shippingText.innerHTML = `Add <strong>${formatPrice(remaining)}</strong> more for <strong>FREE Shipping!</strong>`;
    }
  }

  // Render Line Items
  if (itemsContainer) {
    if (state.cart.length === 0) {
      itemsContainer.innerHTML = `
        <div class="cart-empty-message">
          <svg class="icon" width="48" height="48" aria-hidden="true"><use href="#icon-bag"></use></svg>
          <p style="margin-top: 12px; font-size: 1rem; color: var(--ink);">Your shopping bag is empty.</p>
          <p style="font-size: 0.8125rem; margin-bottom: 20px;">Explore our handcrafted imitation and anti-tarnish pieces.</p>
          <button class="btn-primary" onclick="window.closeCartDrawer(); window.location.hash='#catalog';">Start Shopping</button>
        </div>
      `;
    } else {
      itemsContainer.innerHTML = state.cart.map(item => `
        <div class="cart-item">
          <img class="cart-item-img" src="${getShopifyImageUrl(item.image, 160)}" alt="${item.title}" width="68" height="85">
          <div class="cart-item-info">
            <h4 class="cart-item-title">${item.title}</h4>
            <div class="cart-item-price">${formatPrice(item.price)}</div>
            <div class="cart-qty-stepper">
              <button class="cart-qty-btn" data-cart-delta="-1" data-cart-id="${item.id}" aria-label="Decrease quantity">-</button>
              <span class="cart-qty-val">${item.qty}</span>
              <button class="cart-qty-btn" data-cart-delta="1" data-cart-id="${item.id}" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <button class="cart-item-remove-btn" data-cart-remove="${item.id}" aria-label="Remove ${item.title}">
            <svg class="icon" width="16" height="16" aria-hidden="true"><use href="#icon-trash"></use></svg>
          </button>
        </div>
      `).join("");

      // Attach Line Item Controls
      itemsContainer.querySelectorAll("[data-cart-delta]").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = Number(btn.dataset.cartId);
          const delta = Number(btn.dataset.cartDelta);
          updateCartItemQty(id, delta);
        });
      });

      itemsContainer.querySelectorAll("[data-cart-remove]").forEach(btn => {
        btn.addEventListener("click", () => {
          removeCartItem(Number(btn.dataset.cartRemove));
        });
      });
    }
  }
}
window.closeCartDrawer = closeCartDrawer;

// --------------------------------------------------------------------------
// 15. Carousels (Bestsellers & New Arrivals)
// --------------------------------------------------------------------------
function initCarousels() {
  const bestsellersTrack = document.getElementById("bestsellersTrack");
  const newArrivalsTrack = document.getElementById("newArrivalsTrack");

  // Curated Bestsellers (Bridal heritage, Hazoorilal, Kundan, and royal sets)
  let bestsellers = state.products.filter(p => 
    p.price > 0 && (
      (p.title && (
        p.title.includes("Hazoorilal") || 
        p.title.includes("Premium") || 
        p.title.includes("Navratna") ||
        p.title.includes("bridal set") ||
        p.title.includes("Bridal") ||
        p.title.includes("Choker")
      ))
    )
  ).slice(0, 8);

  if (bestsellers.length < 8) {
    const extra = state.products.filter(p => p.price > 0 && !bestsellers.some(b => b.id === p.id)).slice(0, 8 - bestsellers.length);
    bestsellers = bestsellers.concat(extra);
  }

  // Curated New Arrivals (Fresh designs, Empress, Regalia, Pearl Drops, Anti-tarnish waterproof)
  const bestsellerIds = new Set(bestsellers.map(b => b.id));
  let newArrivals = state.products.filter(p => 
    p.price > 0 && !bestsellerIds.has(p.id) && (
      p.isEffectiveAntiTarnish ||
      (p.title && (
        p.title.includes("Empress") || 
        p.title.includes("Regalia") || 
        p.title.includes("Vintage Heritage") ||
        p.title.includes("Pearl Drop") ||
        p.title.includes("Earrings") ||
        p.title.includes("Bow Design")
      ))
    )
  ).slice(0, 8);

  if (newArrivals.length < 8) {
    const extra = state.products.filter(p => p.price > 0 && !bestsellerIds.has(p.id) && !newArrivals.some(n => n.id === p.id)).slice(0, 8 - newArrivals.length);
    newArrivals = newArrivals.concat(extra);
  }

  if (bestsellersTrack) {
    bestsellersTrack.innerHTML = bestsellers.map(p => createProductCardHTML(p)).join("");
    attachCardEvents(bestsellersTrack);
  }

  if (newArrivalsTrack) {
    newArrivalsTrack.innerHTML = newArrivals.map(p => createProductCardHTML(p)).join("");
    attachCardEvents(newArrivalsTrack);
  }

  // Showcase Tabs Toggle
  const tabBestsellers = document.getElementById("tabBestsellers");
  const tabNewArrivals = document.getElementById("tabNewArrivals");
  const showcasePrevBtn = document.getElementById("showcasePrevBtn");
  const showcaseNextBtn = document.getElementById("showcaseNextBtn");

  function switchShowcaseTab(tab) {
    if (tab === "new-arrivals") {
      tabNewArrivals?.classList.add("is-active");
      tabNewArrivals?.setAttribute("aria-selected", "true");
      tabBestsellers?.classList.remove("is-active");
      tabBestsellers?.setAttribute("aria-selected", "false");
      if (newArrivalsTrack) newArrivalsTrack.style.display = "flex";
      if (bestsellersTrack) bestsellersTrack.style.display = "none";
    } else {
      tabBestsellers?.classList.add("is-active");
      tabBestsellers?.setAttribute("aria-selected", "true");
      tabNewArrivals?.classList.remove("is-active");
      tabNewArrivals?.setAttribute("aria-selected", "false");
      if (bestsellersTrack) bestsellersTrack.style.display = "flex";
      if (newArrivalsTrack) newArrivalsTrack.style.display = "none";
    }
  }
  window.switchShowcaseTab = switchShowcaseTab;

  tabBestsellers?.addEventListener("click", () => switchShowcaseTab("bestsellers"));
  tabNewArrivals?.addEventListener("click", () => switchShowcaseTab("new-arrivals"));

  showcasePrevBtn?.addEventListener("click", () => {
    const activeTrack = (newArrivalsTrack && newArrivalsTrack.style.display !== "none") ? newArrivalsTrack : bestsellersTrack;
    activeTrack?.scrollBy({ left: -320, behavior: "smooth" });
  });

  showcaseNextBtn?.addEventListener("click", () => {
    const activeTrack = (newArrivalsTrack && newArrivalsTrack.style.display !== "none") ? newArrivalsTrack : bestsellersTrack;
    activeTrack?.scrollBy({ left: 320, behavior: "smooth" });
  });

  // Arrow button navigation for other tracks
  document.querySelectorAll("[data-carousel-target]").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.carouselTarget;
      const dir = Number(btn.dataset.carouselDir || 1);
      const track = document.getElementById(targetId);
      if (track) {
        track.scrollBy({ left: dir * 320, behavior: "smooth" });
      }
    });
  });
}

// --------------------------------------------------------------------------
// 16. Quick View Modal
// --------------------------------------------------------------------------
let quickViewCurrentQty = 1;

function initQuickViewModal() {
  const backdrop = document.getElementById("quickViewBackdrop");
  const closeBtn = document.getElementById("quickViewCloseBtn");

  closeBtn?.addEventListener("click", closeQuickView);
  backdrop?.addEventListener("click", e => {
    if (e.target === backdrop) closeQuickView();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && backdrop?.classList.contains("is-open")) {
      closeQuickView();
    }
  });
}

export function openQuickView(productId) {
  const p = state.products.find(item => item.id === productId);
  if (!p) return;

  const backdrop = document.getElementById("quickViewBackdrop");
  const content = document.getElementById("quickViewContent");
  if (!backdrop || !content) return;

  state.lastFocusedElement = document.activeElement;
  quickViewCurrentQty = 1;

  const images = (p.images && p.images.length > 0) ? p.images : [p.image];
  const hasMulti = images.length > 1;

  // Pre-fill WhatsApp Inquiry Link
  const waText = `Hi Shrivara Atelier, I am interested in this design:\n\n*${p.title}*\nPrice: ${formatPrice(p.price)}\nSKU: #${p.id}\nLink: ${window.location.href.split('#')[0]}#catalog\n\nPlease confirm availability!`;
  const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(waText)}`;

  content.innerHTML = `
    <div class="quickview-grid">
      <div class="quickview-gallery">
        <div class="quickview-main-img-wrap">
          <img id="qvMainImage" src="${getShopifyImageUrl(images[0], 800)}" alt="${p.title}" width="400" height="500">
        </div>
        ${hasMulti ? `
          <div class="quickview-thumbs">
            ${images.map((img, idx) => `
              <img class="quickview-thumb ${idx === 0 ? 'is-active' : ''}" 
                   src="${getShopifyImageUrl(img, 150)}" 
                   alt="${p.title} view ${idx + 1}"
                   data-img-src="${getShopifyImageUrl(img, 800)}">
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div class="quickview-info">
        <span class="eyebrow">${p.normalizedCategory}</span>
        <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 8px;">${p.title}</h2>

        <div style="display: flex; align-items: baseline; gap: 12px; margin-bottom: 14px;">
          <span style="font-size: 1.35rem; font-weight: 700; color: var(--gold);">${p.price > 0 ? formatPrice(p.price) : 'Sold Out'}</span>
          ${p.comparePrice > p.price && p.price > 0 ? `<span class="price-compare">${formatPrice(p.comparePrice)}</span>` : ''}
          ${p.discount && p.price > 0 ? `<span class="product-badge badge-discount">${p.discount}</span>` : ''}
        </div>

        <p class="quickview-desc">
          Handcrafted statement jewellery by Shrivara. Premium 18K/22K micro gold plating over hypoallergenic brass, adorned with hand-set AAA polki stones and micro-layer anti-tarnish protection.
        </p>

        <div class="quickview-specs-list">
          <div><svg class="icon" width="14" height="14" aria-hidden="true"><use href="#icon-shield"></use></svg> 100% Anti-Tarnish Vacuum Micro-Layer Coating</div>
          <div><svg class="icon" width="14" height="14" aria-hidden="true"><use href="#icon-gem"></use></svg> Hand-set AAA Polki & Cubic Zirconia Stones</div>
          <div><svg class="icon" width="14" height="14" aria-hidden="true"><use href="#icon-check"></use></svg> Hypoallergenic, Lead & Nickel Free</div>
        </div>

        <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 16px;">
          <div class="cart-qty-stepper" style="padding: 4px 8px;">
            <button class="cart-qty-btn" id="qvQtyMinus" aria-label="Decrease quantity">-</button>
            <span class="cart-qty-val" id="qvQtyVal">1</span>
            <button class="cart-qty-btn" id="qvQtyPlus" aria-label="Increase quantity">+</button>
          </div>

          <button class="btn-primary" id="qvAddToCartBtn" style="flex: 1;" ${p.isSoldOut || p.price <= 0 ? 'disabled' : ''}>
            <svg class="icon" width="16" height="16" aria-hidden="true"><use href="#icon-bag"></use></svg>
            ${p.isSoldOut || p.price <= 0 ? 'Sold Out' : 'Add to Bag'}
          </button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
          <button type="button" class="btn-secondary" id="qvBookVideoBtn" style="color: var(--ink); border-color: var(--gold); display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.78rem; padding: 10px 8px; cursor: pointer;">
            <svg class="icon" width="15" height="15" style="color: var(--gold);" aria-hidden="true"><use href="#icon-video"></use></svg>
            <span>Book Video Preview</span>
          </button>
          <a href="${waUrl}" target="_blank" rel="noopener" class="btn-secondary" style="color: var(--ink); border-color: var(--line-strong); display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.78rem; padding: 10px 8px;">
            <svg class="icon" width="15" height="15" style="color: #25D366;" aria-hidden="true"><use href="#icon-whatsapp"></use></svg>
            <span>Inquire on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  `;

  // Image switchers
  content.querySelectorAll(".quickview-thumb").forEach(thumb => {
    thumb.addEventListener("click", () => {
      content.querySelectorAll(".quickview-thumb").forEach(t => t.classList.remove("is-active"));
      thumb.classList.add("is-active");
      const main = document.getElementById("qvMainImage");
      if (main) main.src = thumb.dataset.imgSrc;
    });
  });

  // Quantity stepper
  const qtyMinus = document.getElementById("qvQtyMinus");
  const qtyPlus = document.getElementById("qvQtyPlus");
  const qtyVal = document.getElementById("qvQtyVal");

  qtyMinus?.addEventListener("click", () => {
    quickViewCurrentQty = Math.max(1, quickViewCurrentQty - 1);
    if (qtyVal) qtyVal.textContent = quickViewCurrentQty;
  });

  qtyPlus?.addEventListener("click", () => {
    quickViewCurrentQty += 1;
    if (qtyVal) qtyVal.textContent = quickViewCurrentQty;
  });

  // Add to Bag action
  document.getElementById("qvAddToCartBtn")?.addEventListener("click", () => {
    addToCart(p.id, quickViewCurrentQty);
    closeQuickView();
  });

  // Book Live Video Preview action
  document.getElementById("qvBookVideoBtn")?.addEventListener("click", () => {
    closeQuickView();
    openConsultationModal({
      mode: "video",
      pieceTitle: p.title,
      pieceId: p.id,
      category: p.normalizedCategory
    });
  });

  backdrop.classList.add("is-open");
  document.body.classList.add("scroll-locked");
  document.getElementById("quickViewCloseBtn")?.focus();
}

export function closeQuickView() {
  const backdrop = document.getElementById("quickViewBackdrop");
  if (!backdrop) return;
  backdrop.classList.remove("is-open");
  document.body.classList.remove("scroll-locked");
  state.lastFocusedElement?.focus();
}

// --------------------------------------------------------------------------
// 17. Search Modal
// --------------------------------------------------------------------------
function initSearchModal() {
  const openBtn = document.getElementById("searchModalOpenBtn");
  const backdrop = document.getElementById("searchModalBackdrop");
  const closeBtn = document.getElementById("searchModalCloseBtn");
  const input = document.getElementById("searchModalInput");
  const resultsContainer = document.getElementById("searchLiveResults");

  openBtn?.addEventListener("click", () => {
    state.lastFocusedElement = document.activeElement;
    backdrop?.classList.add("is-open");
    document.body.classList.add("scroll-locked");
    setTimeout(() => input?.focus(), 100);
  });

  closeBtn?.addEventListener("click", closeSearchModal);
  backdrop?.addEventListener("click", e => {
    if (e.target === backdrop) closeSearchModal();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && backdrop?.classList.contains("is-open")) {
      closeSearchModal();
    }
  });

  // Live predictive search
  let debounce = null;
  input?.addEventListener("input", e => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const q = e.target.value.trim().toLowerCase();
      if (!q || !resultsContainer) {
        if (resultsContainer) resultsContainer.innerHTML = "";
        return;
      }

      const matches = state.products.filter(p => 
        (p.title || "").toLowerCase().includes(q) || 
        (p.category || "").toLowerCase().includes(q)
      ).slice(0, 8);

      if (matches.length === 0) {
        resultsContainer.innerHTML = `<p style="padding: 12px; color: var(--muted);">No matching jewellery found for "${q}".</p>`;
        return;
      }

      resultsContainer.innerHTML = matches.map(p => `
        <div class="search-result-item" data-id="${p.id}">
          <img class="search-result-img" src="${getShopifyImageUrl(p.image, 120)}" alt="${p.title}" width="48" height="60">
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 0.8125rem; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.title}</div>
            <div style="font-size: 0.75rem; color: var(--gold); font-weight: 700;">${p.price > 0 ? formatPrice(p.price) : 'Sold Out'}</div>
          </div>
          <button class="btn-primary" style="padding: 6px 14px; font-size: 0.6875rem;" data-id="${p.id}">View</button>
        </div>
      `).join("");

      resultsContainer.querySelectorAll(".search-result-item").forEach(item => {
        item.addEventListener("click", () => {
          closeSearchModal();
          openQuickView(Number(item.dataset.id));
        });
      });
    }, 150);
  });
}

function closeSearchModal() {
  const backdrop = document.getElementById("searchModalBackdrop");
  if (!backdrop) return;
  backdrop.classList.remove("is-open");
  document.body.classList.remove("scroll-locked");
  state.lastFocusedElement?.focus();
}

// --------------------------------------------------------------------------
// 18. Policy Modals (Zero Dead Links!)
// --------------------------------------------------------------------------
const POLICIES = {
  shipping: {
    title: "Shipping & Delivery Policy",
    body: `
      <h4>Insured Express Delivery Across India</h4>
      <p>All orders at Shrivara are packed in tamper-proof luxury packaging and dispatched from our flagship Howrah atelier via insured courier partners (BlueDart, Delhivery, Expressbees).</p>
      
      <h4>Dispatch Timeline</h4>
      <p>Orders are dispatched within <strong>24 to 48 business hours</strong>. Deliveries to metros take <strong>2 to 4 business days</strong>, and 4 to 6 business days for the rest of India.</p>

      <h4>Free Shipping</h4>
      <p>Free Insured Shipping is automatically unlocked on all orders of <strong>₹1,999 and above</strong>. A nominal flat rate of ₹99 applies on smaller orders.</p>
    `
  },
  privacy: {
    title: "Privacy & Data Protection",
    body: `
      <h4>Your Trust is Our Heritage</h4>
      <p>Shrivara is committed to protecting your personal information. We only gather essential details (name, delivery address, phone number) necessary to process and deliver your jewellery orders.</p>

      <h4>Zero Third-Party Sharing</h4>
      <p>We never sell, rent, or trade your data to external advertisers. All payments on our live Shopify storefront are encrypted using 256-bit SSL protocols.</p>
    `
  },
  terms: {
    title: "Terms of Service & Authenticity",
    body: `
      <h4>Authenticity & Craftsmanship Guarantee</h4>
      <p>Every piece of Shrivara jewellery is crafted with high-density brass alloy and vacuum micro gold plating. Imitation and anti-tarnish jewellery must be cared for as directed.</p>

      <h4>Showcase Store Notice</h4>
      <p>This GitHub Pages website serves as an interactive portfolio showcase. Commercial checkout and transactions are processed directly on shrivara.co or via our WhatsApp concierge.</p>
    `
  },
  faq: {
    title: "Frequently Asked Questions",
    body: `
      <h4>What makes Shrivara jewellery anti-tarnish?</h4>
      <p>Our pieces receive multi-stage copper and gold electroplating, sealed with an invisible hydrophobic vacuum micro-layer that shields against Indian humidity, sweat, and air oxidization.</p>

      <h4>Can I book a personalized bridal styling consultation?</h4>
      <p>Yes! We offer 1-on-1 virtual styling sessions via WhatsApp video or at our physical Howrah atelier for bridal trousseau matching.</p>
    `
  }
};

function initPolicyModals() {
  const backdrop = document.getElementById("policyModalBackdrop");
  const closeBtn = document.getElementById("policyModalCloseBtn");

  closeBtn?.addEventListener("click", closePolicyModal);
  backdrop?.addEventListener("click", e => {
    if (e.target === backdrop) closePolicyModal();
  });

  document.querySelectorAll("[data-policy-key]").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      openPolicyModal(link.dataset.policyKey);
    });
  });
}

function openPolicyModal(key) {
  const policy = POLICIES[key];
  if (!policy) return;

  const titleEl = document.getElementById("policyModalTitle");
  const bodyEl = document.getElementById("policyModalBody");
  const backdrop = document.getElementById("policyModalBackdrop");

  if (titleEl) titleEl.textContent = policy.title;
  if (bodyEl) bodyEl.innerHTML = policy.body;

  state.lastFocusedElement = document.activeElement;
  backdrop?.classList.add("is-open");
  document.body.classList.add("scroll-locked");
  document.getElementById("policyModalCloseBtn")?.focus();
}

function closePolicyModal() {
  const backdrop = document.getElementById("policyModalBackdrop");
  if (!backdrop) return;
  backdrop.classList.remove("is-open");
  document.body.classList.remove("scroll-locked");
  state.lastFocusedElement?.focus();
}

// --------------------------------------------------------------------------
// 19. Floating Utilities (WhatsApp & Back to Top)
// --------------------------------------------------------------------------
function initFloatingUtilities() {
  const backToTopBtn = document.getElementById("backToTopBtn");
  const waBtn = document.getElementById("floatingWhatsAppBtn");

  if (waBtn) {
    waBtn.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(CONFIG.whatsappMessage)}`;
  }

  window.addEventListener("scroll", () => {
    if (!backToTopBtn) return;
    if (window.scrollY > 600) {
      backToTopBtn.classList.add("is-visible");
    } else {
      backToTopBtn.classList.remove("is-visible");
    }
  }, { passive: true });

  backToTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// --------------------------------------------------------------------------
// 20. Newsletter Submission Handler
// --------------------------------------------------------------------------
function initNewsletter() {
  const form = document.getElementById("newsletterForm");
  const feedback = document.getElementById("newsletterFeedback");

  form?.addEventListener("submit", e => {
    e.preventDefault();
    const input = document.getElementById("newsletterEmail");
    const email = (input?.value || "").trim();

    if (!email || !email.includes("@")) {
      if (feedback) feedback.textContent = "Please provide a valid email address.";
      return;
    }

    if (feedback) {
      feedback.textContent = "✨ Welcome to the VIP Circle! Use code FIRST5 for 5% off.";
      feedback.style.color = "var(--gold)";
    }
    showToast("Subscribed! Enjoy 5% off on your first order with code FIRST5");
    form.reset();
  });
}

// --------------------------------------------------------------------------
// 21. Toast Notice System
// --------------------------------------------------------------------------
let toastTimeout = null;
export function showToast(message) {
  const toast = document.getElementById("toastNotice");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("is-visible");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3200);
}
window.showToast = showToast;

// --------------------------------------------------------------------------
// 22. Subtle Scroll Reveal Animations
// --------------------------------------------------------------------------
function initScrollAnimations() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".reveal-on-scroll").forEach(el => observer.observe(el));
}


// ==========================================================================
// 15. Shop Category Slider Dropdown
// ==========================================================================
function initShopSlider() {
  const shopNavBtn = document.getElementById("shopNavBtn");
  const shopSliderPanel = document.getElementById("shopSliderPanel");
  const shopSliderCloseBtn = document.getElementById("shopSliderCloseBtn");
  const shopSliderPrevBtn = document.getElementById("shopSliderPrevBtn");
  const shopSliderNextBtn = document.getElementById("shopSliderNextBtn");
  const shopSliderTrack = document.getElementById("shopSliderTrack");
  const mobileCategoriesSlider = document.getElementById("mobileCategoriesSlider");
  const shopSliderAllBtn = document.getElementById("shopSliderAllBtn");

  if (!shopNavBtn || !shopSliderPanel) return;

  function closeShopSlider() {
    shopSliderPanel.classList.remove("is-open");
    shopNavBtn.setAttribute("aria-expanded", "false");
    shopSliderPanel.setAttribute("aria-hidden", "true");
  }

  function openShopSlider() {
    shopSliderPanel.classList.add("is-open");
    shopNavBtn.setAttribute("aria-expanded", "true");
    shopSliderPanel.setAttribute("aria-hidden", "false");
  }

  function toggleShopSlider() {
    if (shopSliderPanel.classList.contains("is-open")) {
      closeShopSlider();
    } else {
      openShopSlider();
    }
  }

  shopNavBtn.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();
    toggleShopSlider();
  });

  shopSliderCloseBtn?.addEventListener("click", closeShopSlider);

  shopSliderAllBtn?.addEventListener("click", () => {
    closeShopSlider();
  });

  // Slider controls
  shopSliderPrevBtn?.addEventListener("click", () => {
    shopSliderTrack?.scrollBy({ left: -260, behavior: "smooth" });
  });

  shopSliderNextBtn?.addEventListener("click", () => {
    shopSliderTrack?.scrollBy({ left: 260, behavior: "smooth" });
  });

  // Keyboard navigation on track
  shopSliderTrack?.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") {
      shopSliderTrack.scrollBy({ left: -240, behavior: "smooth" });
    } else if (e.key === "ArrowRight") {
      shopSliderTrack.scrollBy({ left: 240, behavior: "smooth" });
    }
  });

  // Close when clicking outside
  document.addEventListener("click", e => {
    if (shopSliderPanel.classList.contains("is-open") && !shopSliderPanel.contains(e.target) && !shopNavBtn.contains(e.target)) {
      closeShopSlider();
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && shopSliderPanel.classList.contains("is-open")) {
      closeShopSlider();
      shopNavBtn.focus();
    }
  });

  // Populate Desktop Slider Track and Mobile Categories Slider
  const catItems = CONFIG.categories.filter(c => c.key !== "all").map(cat => {
    let count = 0;
    if (cat.key === "Anti-Tarnish") {
      count = state.products.filter(p => p.isEffectiveAntiTarnish).length;
    } else {
      count = state.products.filter(p => p.normalizedCategory === cat.key).length;
    }

    return `
      <div class="shop-slider-card" data-category="${cat.key}" role="listitem" tabindex="0">
        <div class="shop-slider-img-box">
          <img src="${cat.img}" alt="${cat.label} Collection" loading="lazy" width="220" height="275">
          <div class="shop-slider-img-overlay">
            <span class="shop-slider-pill">Explore &rarr;</span>
          </div>
        </div>
        <div class="shop-slider-info">
          <h4 class="shop-slider-card-title">${cat.label}</h4>
          <p class="shop-slider-card-count">${count} Handcrafted Designs</p>
        </div>
      </div>
    `;
  }).join("");

  if (shopSliderTrack) {
    shopSliderTrack.innerHTML = catItems;
    shopSliderTrack.querySelectorAll(".shop-slider-card").forEach(card => {
      const handleSelect = () => {
        const cat = card.dataset.category;
        filterByCategory(cat);
        closeShopSlider();
        const catalogEl = document.getElementById("catalog");
        if (catalogEl) catalogEl.scrollIntoView({ behavior: "smooth" });
      };
      card.addEventListener("click", handleSelect);
      card.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSelect();
        }
      });
    });
  }

  if (mobileCategoriesSlider) {
    mobileCategoriesSlider.innerHTML = catItems;
    mobileCategoriesSlider.querySelectorAll(".shop-slider-card").forEach(card => {
      card.addEventListener("click", () => {
        const cat = card.dataset.category;
        filterByCategory(cat);
        const mobileClose = document.getElementById("mobileNavClose");
        if (mobileClose) mobileClose.click();
        const catalogEl = document.getElementById("catalog");
        if (catalogEl) catalogEl.scrollIntoView({ behavior: "smooth" });
      });
    });
  }
}

// ==========================================================================
// 16. Demo Checkout Modal (Master Prompt Section 9I)
// ==========================================================================
function initDemoCheckout() {
  const proceedBtn = document.getElementById("cartCheckoutProceedBtn");
  const backdrop = document.getElementById("checkoutModalBackdrop");
  const closeBtn = document.getElementById("checkoutModalCloseBtn");
  const continueBtn = document.getElementById("checkoutContinueShoppingBtn");
  const itemsContainer = document.getElementById("checkoutOrderItemsList");
  const subtotalText = document.getElementById("checkoutSubtotalText");
  const shippingText = document.getElementById("checkoutShippingText");
  const totalText = document.getElementById("checkoutTotalText");

  proceedBtn?.addEventListener("click", () => {
    if (state.cart.length === 0) {
      showToast("Your bag is currently empty. Add pieces to proceed to checkout!");
      return;
    }

    closeCartDrawer();

    // Sanitize cart: remove any unpriced or invalid items
    state.cart = state.cart.filter(item => item && typeof item.price === "number" && item.price > 0);
    saveCart();

    // Render items in checkout modal
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * (item.qty || item.quantity || 1)), 0);
    const isFreeShipping = subtotal >= CONFIG.freeShippingThreshold;
    const shippingFee = isFreeShipping ? 0 : 150;
    const orderTotal = subtotal + shippingFee;

    if (itemsContainer) {
      itemsContainer.innerHTML = state.cart.map(item => {
        const itemQty = item.qty || item.quantity || 1;
        return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed var(--line); font-size: 0.8125rem;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="${getShopifyImageUrl(item.image, 80)}" alt="${item.title}" style="width: 32px; height: 40px; object-fit: cover; border-radius: var(--radius-sm);">
            <div>
              <div style="font-weight: 600; color: var(--ink); max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title}</div>
              <div style="font-size: 0.72rem; color: var(--muted);">Qty: ${itemQty} &times; ${formatPrice(item.price)}</div>
            </div>
          </div>
          <div style="font-weight: 700; color: var(--ink);">${formatPrice(item.price * itemQty)}</div>
        </div>
      `;
      }).join("");
    }

    if (subtotalText) subtotalText.textContent = formatPrice(subtotal);
    if (shippingText) {
      shippingText.textContent = isFreeShipping ? "FREE" : formatPrice(shippingFee);
      shippingText.style.color = isFreeShipping ? "var(--success)" : "var(--ink)";
    }
    if (totalText) totalText.textContent = formatPrice(orderTotal);

    // Reset view states
    const successState = document.getElementById("checkoutSuccessState");
    const modalBody = document.getElementById("checkoutModalBody");
    if (successState) successState.style.display = "none";
    if (modalBody) modalBody.style.display = "flex";

    backdrop?.classList.add("is-open");
    document.body.classList.add("scroll-locked");
  });

  function closeCheckoutModal() {
    backdrop?.classList.remove("is-open");
    document.body.classList.remove("scroll-locked");
  }

  closeBtn?.addEventListener("click", closeCheckoutModal);
  backdrop?.addEventListener("click", e => {
    if (e.target === backdrop) closeCheckoutModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && backdrop?.classList.contains("is-open")) {
      closeCheckoutModal();
    }
  });

  continueBtn?.addEventListener("click", () => {
    closeCheckoutModal();
    const catalogEl = document.getElementById("catalog");
    if (catalogEl) catalogEl.scrollIntoView({ behavior: "smooth" });
  });

  window.submitDemoOrder = function() {
    const submitBtn = document.getElementById("checkoutSubmitBtn");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Processing Demo Order...";
    }

    setTimeout(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Place Demo Order →";
      }

      // Generate realistic demo order ID
      const orderId = `SHR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const titleEl = document.getElementById("checkoutSuccessTitle");
      if (titleEl) titleEl.textContent = `Demo Order #${orderId} Placed!`;

      // Clear the demo cart
      state.cart = [];
      saveCart();
      updateCartUI();

      // Show success confirmation
      const modalBody = document.getElementById("checkoutModalBody");
      const successState = document.getElementById("checkoutSuccessState");
      if (modalBody) modalBody.style.display = "none";
      if (successState) successState.style.display = "block";
      showToast(`Demo Order #${orderId} confirmed!`);
    }, 600);
  };
}

// --------------------------------------------------------------------------
// 21. Atelier Concierge & Live Video Consultation Handlers
// --------------------------------------------------------------------------

export function openConsultationModal(options = {}) {
  const backdrop = document.getElementById("consultationModalBackdrop");
  if (!backdrop) return;

  const mode = options.mode || "video";
  const videoRadio = document.querySelector('input[name="consultServiceType"][value="video"]');
  const chatRadio = document.querySelector('input[name="consultServiceType"][value="chat"]');
  const videoLabel = document.getElementById("consultOptVideoLabel");
  const chatLabel = document.getElementById("consultOptChatLabel");
  const dateField = document.getElementById("consultDateField");
  const slotField = document.getElementById("consultSlotField");
  const submitBtnText = document.getElementById("consultSubmitBtnText");
  const pieceNoteInput = document.getElementById("consultPieceNote");
  const modalTitle = document.getElementById("consultModalTitle");

  // Reset modal display states
  const modalBody = document.getElementById("consultModalBody");
  const successState = document.getElementById("consultSuccessState");
  if (modalBody) modalBody.style.display = "block";
  if (successState) successState.style.display = "none";

  // Pre-fill piece details if provided
  if (options.pieceTitle) {
    if (pieceNoteInput) {
      pieceNoteInput.value = `Interested in: ${options.pieceTitle} (SKU #${options.pieceId || ""})`;
    }
  }

  // Set mode
  if (mode === "chat") {
    if (chatRadio) chatRadio.checked = true;
    chatLabel?.classList.add("is-active");
    videoLabel?.classList.remove("is-active");
    if (dateField) dateField.style.display = "none";
    if (slotField) slotField.style.display = "none";
    if (submitBtnText) submitBtnText.textContent = "Start WhatsApp Styling Chat →";
    if (modalTitle) modalTitle.textContent = "WhatsApp Styling Concierge";
  } else {
    if (videoRadio) videoRadio.checked = true;
    videoLabel?.classList.add("is-active");
    chatLabel?.classList.remove("is-active");
    if (dateField) dateField.style.display = "flex";
    if (slotField) slotField.style.display = "flex";
    if (submitBtnText) submitBtnText.textContent = "Confirm Video Appointment via WhatsApp →";
    if (modalTitle) modalTitle.textContent = "Book a 1-on-1 Video Consultation";
  }

  // Pre-select category chips if provided
  if (options.category) {
    document.querySelectorAll('input[name="consultCategoryInterest"]').forEach(cb => {
      const match = cb.value.toLowerCase().includes(options.category.toLowerCase()) ||
                    options.category.toLowerCase().includes(cb.value.toLowerCase());
      if (match) {
        cb.checked = true;
        cb.closest(".consult-chip")?.classList.add("is-checked");
      }
    });
  }

  // Set date bounds (defaults to tomorrow or today)
  const dateInput = document.getElementById("consultDate");
  if (dateInput && !dateInput.value) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    dateInput.min = `${yyyy}-${mm}-${dd}`;
    dateInput.value = `${yyyy}-${mm}-${dd}`;
  }

  backdrop.classList.add("is-visible");
  backdrop.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  document.getElementById("consultName")?.focus();
}

export function closeConsultationModal() {
  const backdrop = document.getElementById("consultationModalBackdrop");
  if (!backdrop) return;
  backdrop.classList.remove("is-visible");
  backdrop.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function initConsultationModal() {
  const backdrop = document.getElementById("consultationModalBackdrop");
  const closeBtn = document.getElementById("consultModalCloseBtn");
  const dismissBtn = document.getElementById("consultDismissBtn");
  const form = document.getElementById("consultationBookingForm");

  // Mode radio toggles
  document.querySelectorAll('input[name="consultServiceType"]').forEach(radio => {
    radio.addEventListener("change", e => {
      const isVideo = e.target.value === "video";
      const videoLabel = document.getElementById("consultOptVideoLabel");
      const chatLabel = document.getElementById("consultOptChatLabel");
      const dateField = document.getElementById("consultDateField");
      const slotField = document.getElementById("consultSlotField");
      const submitBtnText = document.getElementById("consultSubmitBtnText");
      const modalTitle = document.getElementById("consultModalTitle");

      if (isVideo) {
        videoLabel?.classList.add("is-active");
        chatLabel?.classList.remove("is-active");
        if (dateField) dateField.style.display = "flex";
        if (slotField) slotField.style.display = "flex";
        if (submitBtnText) submitBtnText.textContent = "Confirm Video Appointment via WhatsApp →";
        if (modalTitle) modalTitle.textContent = "Book a 1-on-1 Video Consultation";
      } else {
        chatLabel?.classList.add("is-active");
        videoLabel?.classList.remove("is-active");
        if (dateField) dateField.style.display = "none";
        if (slotField) slotField.style.display = "none";
        if (submitBtnText) submitBtnText.textContent = "Start WhatsApp Styling Chat →";
        if (modalTitle) modalTitle.textContent = "WhatsApp Styling Concierge";
      }
    });
  });

  // Category chip styling sync
  document.querySelectorAll('input[name="consultCategoryInterest"]').forEach(cb => {
    cb.addEventListener("change", () => {
      cb.closest(".consult-chip")?.classList.toggle("is-checked", cb.checked);
    });
  });

  // Modal close handlers
  closeBtn?.addEventListener("click", closeConsultationModal);
  dismissBtn?.addEventListener("click", closeConsultationModal);

  backdrop?.addEventListener("click", e => {
    if (e.target === backdrop) closeConsultationModal();
  });

  window.addEventListener("keydown", e => {
    if (e.key === "Escape" && backdrop?.classList.contains("is-visible")) {
      closeConsultationModal();
    }
  });

  // Form submit handler
  form?.addEventListener("submit", e => {
    e.preventDefault();
    const serviceType = document.querySelector('input[name="consultServiceType"]:checked')?.value || "video";
    const name = (document.getElementById("consultName")?.value || "").trim();
    const phone = (document.getElementById("consultPhone")?.value || "").trim();
    const dateVal = document.getElementById("consultDate")?.value || "";
    const slotVal = document.getElementById("consultTimeSlot")?.value || "";
    const pieceNote = (document.getElementById("consultPieceNote")?.value || "").trim();

    const selectedCategories = Array.from(document.querySelectorAll('input[name="consultCategoryInterest"]:checked'))
      .map(cb => cb.value);

    if (!name || !phone) {
      showToast("Please provide your name and WhatsApp number.");
      return;
    }

    let waMessage = "";
    if (serviceType === "video") {
      waMessage = `✨ *Namaste Shrivara Atelier!*\n\nI would like to schedule a Complimentary 1-on-1 Video Consultation:\n\n👤 *Name:* ${name}\n📱 *WhatsApp:* ${phone}\n📅 *Preferred Date:* ${dateVal}\n⏰ *Time Slot:* ${slotVal}\n💎 *Jewellery of Interest:* ${selectedCategories.join(", ") || "Bridal & Polki Sets"}${pieceNote ? `\n📝 *Notes / Piece:* ${pieceNote}` : ""}\n\nPlease confirm our appointment slot. Looking forward to viewing the pieces!`;
    } else {
      waMessage = `✨ *Namaste Shrivara Atelier!*\n\nI would like personal styling assistance on WhatsApp:\n\n👤 *Name:* ${name}\n📱 *WhatsApp:* ${phone}\n💎 *Looking for:* ${selectedCategories.join(", ") || "Jewellery Recommendations"}${pieceNote ? `\n📝 *Styling Query:* ${pieceNote}` : ""}\n\nCould you please assist me with sizing and matching? Thank you!`;
    }

    const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(waMessage)}`;

    // Save appointment details in localStorage
    try {
      localStorage.setItem("shrivara_last_consultation", JSON.stringify({
        name,
        phone,
        serviceType,
        dateVal,
        slotVal,
        categories: selectedCategories,
        note: pieceNote,
        timestamp: Date.now()
      }));
    } catch (_) {}

    // Show success view
    const modalBody = document.getElementById("consultModalBody");
    const successState = document.getElementById("consultSuccessState");
    const successTitle = document.getElementById("consultSuccessTitle");
    const successDesc = document.getElementById("consultSuccessDesc");
    const directWaBtn = document.getElementById("consultDirectWaBtn");

    if (modalBody) modalBody.style.display = "none";
    if (successState) successState.style.display = "block";

    if (successTitle) {
      successTitle.textContent = serviceType === "video" ? "Video Appointment Prepared!" : "Styling Request Ready!";
    }
    if (successDesc) {
      successDesc.textContent = serviceType === "video"
        ? `Thank you, ${name}! Your 1-on-1 video showcase request for ${dateVal} (${slotVal}) has been pre-formatted for our styling desk on WhatsApp.`
        : `Thank you, ${name}! Your styling inquiry has been pre-formatted for our master stylists on WhatsApp.`;
    }
    if (directWaBtn) {
      directWaBtn.href = waUrl;
    }

    // Attempt to open WhatsApp in new tab
    window.open(waUrl, "_blank", "noopener,noreferrer");
    showToast(serviceType === "video" ? "Video appointment request generated!" : "Opening WhatsApp styling desk...");
  });

  // Attach global window hook for easy integration across pages
  if (typeof window !== "undefined") {
    window.openConsultationModal = openConsultationModal;
    window.closeConsultationModal = closeConsultationModal;
  }
}

function initAtelierConcierge() {
  const triggerBtn = document.getElementById("conciergeTriggerBtn");
  const popover = document.getElementById("conciergePopover");
  const closeBtn = document.getElementById("conciergeCloseBtn");
  const videoOpt = document.getElementById("conciergeVideoOpt");
  const chatOpt = document.getElementById("conciergeChatOpt");

  function togglePopover(force) {
    if (!popover || !triggerBtn) return;
    const shouldOpen = typeof force === "boolean" ? force : !popover.classList.contains("is-open");
    popover.classList.toggle("is-open", shouldOpen);
    popover.setAttribute("aria-hidden", shouldOpen ? "false" : "true");
    triggerBtn.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
  }

  triggerBtn?.addEventListener("click", e => {
    e.stopPropagation();
    togglePopover();
  });

  closeBtn?.addEventListener("click", e => {
    e.stopPropagation();
    togglePopover(false);
  });

  // Close when clicking outside
  document.addEventListener("click", e => {
    if (popover && popover.classList.contains("is-open")) {
      if (!popover.contains(e.target) && !triggerBtn?.contains(e.target)) {
        togglePopover(false);
      }
    }
  });

  // Esc key closes popover
  window.addEventListener("keydown", e => {
    if (e.key === "Escape" && popover?.classList.contains("is-open")) {
      togglePopover(false);
    }
  });

  // Option 1: Live Video Consultation -> opens booking modal
  videoOpt?.addEventListener("click", () => {
    togglePopover(false);
    openConsultationModal({ mode: "video" });
  });

  // Option 2: WhatsApp Chat -> pre-fills URL
  if (chatOpt) {
    chatOpt.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(CONFIG.whatsappMessage)}`;
  }

  // Header & Nav Consultation triggers
  document.getElementById("headerConsultBtn")?.addEventListener("click", () => {
    openConsultationModal({ mode: "video" });
  });

  document.getElementById("navConsultBtn")?.addEventListener("click", () => {
    openConsultationModal({ mode: "video" });
  });

  document.getElementById("mobileConsultBtn")?.addEventListener("click", () => {
    document.getElementById("mobileNavClose")?.click();
    openConsultationModal({ mode: "video" });
  });

  document.getElementById("promoConsultBtn")?.addEventListener("click", () => {
    openConsultationModal({ mode: "video" });
  });

  document.getElementById("virtualAtelierBookBtn")?.addEventListener("click", () => {
    openConsultationModal({ mode: "video" });
  });

  document.getElementById("reassuranceConciergeItem")?.addEventListener("click", () => {
    openConsultationModal({ mode: "video" });
  });

  document.getElementById("heroConsultBtn")?.addEventListener("click", () => {
    openConsultationModal({ mode: "video" });
  });
}

