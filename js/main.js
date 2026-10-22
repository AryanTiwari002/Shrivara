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
  whatsappMessage: "Hi Shrivara, I am browsing your jewellery showcase and would like styling assistance with an order.",
  pageSize: 16,
  categories: [
    { key: "all", label: "All Collections" },
    { key: "Jewellery Sets", label: "Jewellery Sets", img: "https://shrivara.co/cdn/shop/collections/WhatsApp_Image_2026-07-26_at_20.51.35.jpg?v=1785079938&width=400" },
    { key: "Earrings", label: "Earrings", img: "https://shrivara.co/cdn/shop/collections/WhatsApp_Image_2026-07-26_at_18.41.22.jpg?v=1785071683&width=400" },
    { key: "Bracelets & Bangles", label: "Bracelets & Bangles", img: "https://shrivara.co/cdn/shop/collections/WhatsApp_Image_2026-07-26_at_19.05.32.jpg?v=1785073014&width=400" },
    { key: "Necklaces", label: "Necklaces", img: "https://cdn.shopify.com/s/files/1/0725/1728/8098/files/WhatsApp_Image_2026-09-10_at_15.48.18.jpg?v=1789539990&width=400" },
    { key: "Pendant Sets", label: "Pendant Sets", img: "https://shrivara.co/cdn/shop/collections/WhatsApp_Image_2026-07-26_at_18.14.32.jpg?v=1785069982&width=400" },
    { key: "Rings", label: "Rings", img: "https://shrivara.co/cdn/shop/collections/ChatGPT_Image_Aug_18_2026_11_50_43_PM.png?v=1787077388&width=400" },
    { key: "Anti-Tarnish", label: "Anti-Tarnish", img: "https://shrivara.co/cdn/shop/collections/Gemini_Generated_Image_3gqx753gqx753gqx.png?v=1789385692&width=400" }
  ]
};

// Application State
export const state = {
  products: [],
  filteredProducts: [],
  visibleCount: CONFIG.pageSize,
  activeCategory: "all",
  activePrice: "all",
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
  initPromoBar();
  initHeroSlider();
  initCollectionsTiles();
  initCatalogue();
  initCarousels();
  initCartDrawer();
  initSearchModal();
  initQuickViewModal();
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
  const root = document.documentElement;
  const toggleBtn = document.getElementById("themeToggleBtn");

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

  if (iconSun && iconMoon) {
    iconSun.style.display = isDark ? "block" : "none";
    iconMoon.style.display = isDark ? "none" : "block";
  }

  if (toggleBtn) {
    toggleBtn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    toggleBtn.title = isDark ? "Light Mode" : "Dark Mode";
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

  function startAutoplay() {
    if (prefersReduced) return;
    timer = setInterval(nextSlide, 6500);
  }

  function stopAutoplay() {
    clearInterval(timer);
  }

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      goToSlide(Number(dot.dataset.index));
      stopAutoplay();
      startAutoplay();
    });
  });

  const hero = document.getElementById("heroSection");
  if (hero) {
    hero.addEventListener("mouseenter", stopAutoplay);
    hero.addEventListener("mouseleave", startAutoplay);
    hero.addEventListener("focusin", stopAutoplay);
    hero.addEventListener("focusout", startAutoplay);
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
    });
  });
}

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

    return `
      <button class="chip-btn ${isActive ? 'is-active' : ''}" data-category="${cat.key}" role="tab" aria-selected="${isActive}">
        <span>${cat.label}</span>
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

function initToolbarListeners() {
  const searchInput = document.getElementById("catalogSearch");
  const priceSelect = document.getElementById("priceFilterSelect");
  const sortSelect = document.getElementById("sortSelect");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

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

  priceSelect?.addEventListener("change", e => {
    state.activePrice = e.target.value;
    state.visibleCount = CONFIG.pageSize;
    applyFiltersAndRender();
  });

  sortSelect?.addEventListener("change", e => {
    state.activeSort = e.target.value;
    applyFiltersAndRender();
  });

  loadMoreBtn?.addEventListener("click", () => {
    state.visibleCount += CONFIG.pageSize;
    applyFiltersAndRender(false);
  });
}

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

  // 2. Price Filter
  if (state.activePrice === "under-1500") {
    list = list.filter(p => p.price > 0 && p.price < 1500);
  } else if (state.activePrice === "1500-2500") {
    list = list.filter(p => p.price >= 1500 && p.price <= 2500);
  } else if (state.activePrice === "2500-4000") {
    list = list.filter(p => p.price > 2500 && p.price <= 4000);
  } else if (state.activePrice === "above-4000") {
    list = list.filter(p => p.price > 4000);
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
    grid.innerHTML = `
      <div class="catalog-empty-state">
        <svg class="icon" width="48" height="48" aria-hidden="true"><use href="#icon-gem"></use></svg>
        <h3 style="font-size: 1.5rem; margin-bottom: 8px;">No Jewellery Found</h3>
        <p style="margin-bottom: 16px;">We couldn't find matching designs for your selected criteria.</p>
        <button class="btn-primary" onclick="window.clearAllFilters()">Clear All Filters</button>
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
  const hasPrice = state.activePrice !== "all";
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
    const priceLabels = {
      "under-1500": "Under ₹1,500",
      "1500-2500": "₹1,500 – ₹2,500",
      "2500-4000": "₹2,500 – ₹4,000",
      "above-4000": "Above ₹4,000"
    };
    html += `
      <span class="active-filter-tag">
        Price: ${priceLabels[state.activePrice] || state.activePrice}
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
        state.activePrice = "all";
        const sel = document.getElementById("priceFilterSelect");
        if (sel) sel.value = "all";
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
  state.activePrice = "all";
  state.activeSort = "featured";
  state.searchQuery = "";
  state.visibleCount = CONFIG.pageSize;

  const searchInput = document.getElementById("catalogSearch");
  if (searchInput) searchInput.value = "";

  const priceSelect = document.getElementById("priceFilterSelect");
  if (priceSelect) priceSelect.value = "all";

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
  if (state.activePrice !== "all") params.set("price", state.activePrice);
  if (state.activeSort !== "featured") params.set("sort", state.activeSort);
  const paramStr = params.toString();
  window.history.replaceState(null, "", paramStr ? `#catalog?${paramStr}` : "#catalog");
}

function initHashRouting() {
  function readHash() {
    const hash = window.location.hash;
    if (hash && hash.includes("?")) {
      const q = hash.split("?")[1];
      const params = new URLSearchParams(q);
      const cat = params.get("cat");
      const price = params.get("price");
      const sort = params.get("sort");

      if (cat) state.activeCategory = cat;
      if (price) {
        state.activePrice = price;
        const sel = document.getElementById("priceFilterSelect");
        if (sel) sel.value = price;
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

function attachCardEvents(container) {
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

  const bestsellers = state.products.filter(p => 
    p.price > 0 && (
      p.title.includes("Hazoorilal") || 
      p.title.includes("Premium") || 
      p.title.includes("Navratna") ||
      p.title.includes("bridal set")
    )
  ).slice(0, 8);

  const newArrivals = state.products.filter(p => 
    p.price > 0 && (
      p.title.includes("Empress") || 
      p.title.includes("Regalia") || 
      p.title.includes("Vintage Heritage") ||
      p.title.includes("Pearl Drop") ||
      p.isEffectiveAntiTarnish
    )
  ).slice(0, 8);

  if (bestsellersTrack) {
    bestsellersTrack.innerHTML = bestsellers.map(p => createProductCardHTML(p)).join("");
    attachCardEvents(bestsellersTrack);
  }

  if (newArrivalsTrack) {
    newArrivalsTrack.innerHTML = newArrivals.map(p => createProductCardHTML(p)).join("");
    attachCardEvents(newArrivalsTrack);
  }

  // Arrow button navigation
  document.querySelectorAll("[data-carousel-target]").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.carouselTarget;
      const dir = Number(btn.dataset.carouselDir || 1);
      const track = document.getElementById(targetId);
      if (track) {
        track.scrollBy({ left: dir * 300, behavior: "smooth" });
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

        <a href="${waUrl}" target="_blank" rel="noopener" class="btn-secondary" style="color: var(--ink); border-color: var(--line-strong); display: flex; align-items: center; justify-content: center; gap: 8px;">
          <svg class="icon" width="16" height="16" style="color: #25D366;" aria-hidden="true"><use href="#icon-whatsapp"></use></svg>
          Inquire via WhatsApp
        </a>
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
