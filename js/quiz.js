/**
 * ==========================================================================
 * SHRIVARA — "Find Your Style" Jewellery Discovery Quiz Controller
 * Vanilla ES6 • Mobile-First • Accessible • Deterministic Recommendation Engine
 * ==========================================================================
 */

import {
  CONFIG,
  state as sharedState,
  normalizeCategory,
  isAntiTarnishProduct,
  formatPrice,
  createProductCardHTML,
  attachCardEvents,
  toggleWishlist,
  addToCart,
  openQuickView,
  showToast,
  openConsultationModal,
  closeConsultationModal
} from "./main.js";

// --------------------------------------------------------------------------
// 1. Scoring Engine Weights & Constants
// --------------------------------------------------------------------------
export const SCORING_WEIGHTS = {
  occasion: 30,
  style: 25,
  category: 20,
  metal: 15,
  budget: 10
};

// Quiz Application State
export const quizState = {
  step: 0, // 0: Welcome, 1: Occasion, 2: Style, 3: Category, 4: Metal, 5: Budget, 6: Results
  totalQuestions: 5,
  answers: {
    occasion: null,
    styles: [], // max 2
    categories: [], // multi-select + "Surprise Me"
    metal: null,
    budgetMin: 0,
    budgetMax: 30000
  },
  products: [],
  recommendations: {
    personaTitle: "",
    personaDesc: "",
    perfectForYou: [],
    completeTheLook: [],
    somethingDifferent: [],
    isBudgetRelaxed: false
  }
};

// --------------------------------------------------------------------------
// 2. Persona Mapping Definitions
// --------------------------------------------------------------------------
const STYLE_PERSONAS = [
  {
    condition: (ans) => ans.styles.includes("Traditional & Ethnic") || ans.occasion === "Wedding & Festivities",
    title: "The Regal Maharani",
    desc: "Your aesthetic radiates royal grandeur, intricate polki karigari, and centuries-old temple craftsmanship designed for celebration and regal majesty."
  },
  {
    condition: (ans) => ans.styles.includes("Minimal & Timeless") || ans.occasion === "Office & Work",
    title: "The Modern Minimalist",
    desc: "Effortless refinement and quiet luxury define you. You gravitate toward clean architectural lines, luminous pearls, and versatile silhouettes."
  },
  {
    condition: (ans) => ans.styles.includes("Romantic & Delicate") || ans.occasion === "Date Night",
    title: "The Celestial Muse",
    desc: "Soft poetry in precious metals. You are captivated by floral filigree, shimmering drop solitaires, and delicate accents that catch the candlelight."
  },
  {
    condition: (ans) => ans.styles.includes("Modern & Bold") || ans.occasion === "Party & Celebrations",
    title: "The Contemporary Luminary",
    desc: "Fearless, magnetic, and striking. You embrace bold statement chokers, sculpted cuffs, and head-turning brilliance that command every room."
  },
  {
    condition: (ans) => ans.styles.includes("Trendy & Experimental"),
    title: "The Eclectic Connoisseur",
    desc: "Creative, discerning, and avant-garde. You love unexpected gemstone pairings, textured finishes, and artisanal conversation starters."
  },
  {
    condition: () => true, // Fallback
    title: "The Timeless Royal",
    desc: "An enduring harmony of traditional Indian karigari and contemporary elegance, curated to elevate your everyday presence with effortless poise."
  }
];

// --------------------------------------------------------------------------
// 3. Quiz Initialization & Data Loader
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  await loadQuizProducts();
  initBudgetSlider();
  initOptionCardListeners();
  renderCurrentStep();
});

async function loadQuizProducts() {
  if (typeof window !== "undefined" && window.ALL_PRODUCTS && Array.isArray(window.ALL_PRODUCTS)) {
    quizState.products = window.ALL_PRODUCTS;
  } else {
    try {
      const res = await fetch("products-data.json");
      if (res.ok) {
        quizState.products = await res.json();
      }
    } catch (e) {
      console.warn("[Quiz] Failed to load products data", e);
    }
  }

  // Ensure normalized fields are present
  quizState.products.forEach(p => {
    if (!p.normalizedCategory) p.normalizedCategory = normalizeCategory(p.category);
    if (typeof p.isEffectiveAntiTarnish === "undefined") p.isEffectiveAntiTarnish = isAntiTarnishProduct(p);
  });
}

// --------------------------------------------------------------------------
// 4. Step Transition & Validation Engine
// --------------------------------------------------------------------------
function renderCurrentStep() {
  const step = quizState.step;
  const panes = document.querySelectorAll(".quiz-step-pane");
  const stepperBar = document.getElementById("quizStepperBar");
  const backBtn = document.getElementById("quizBackBtn");
  const progressFill = document.getElementById("quizProgressFill");
  const stepIndicator = document.getElementById("quizStepIndicator");
  const stepCategory = document.getElementById("quizStepCategory");

  // Show/Hide Stepper Bar
  if (step === 0 || step === 6) {
    if (stepperBar) stepperBar.style.display = "none";
  } else {
    if (stepperBar) stepperBar.style.display = "flex";
  }

  // Update Stepper Progress
  if (step >= 1 && step <= 5) {
    const percent = ((step - 1) / quizState.totalQuestions) * 100;
    if (progressFill) progressFill.style.width = `${Math.max(10, percent + 10)}%`;
    if (stepIndicator) stepIndicator.textContent = `Question ${step} of ${quizState.totalQuestions}`;

    const categoryNames = ["", "Occasion", "Personal Style", "Jewellery Categories", "Metal Colour", "Budget"];
    if (stepCategory) stepCategory.textContent = categoryNames[step] || "";
    if (backBtn) backBtn.disabled = false;
  }

  // Toggle active pane
  panes.forEach(pane => {
    const paneStep = parseInt(pane.dataset.step, 10);
    if (paneStep === step) {
      pane.classList.add("is-active");
      pane.setAttribute("aria-hidden", "false");
    } else {
      pane.classList.remove("is-active");
      pane.setAttribute("aria-hidden", "true");
    }
  });

  // Re-sync UI controls for the step
  syncOptionCardSelectionStates();
  updateContinueButtonState();

  // Scroll smoothly to top of quiz container
  const app = document.getElementById("quizApp");
  if (app && step > 0) {
    app.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function updateContinueButtonState() {
  const step = quizState.step;
  if (step < 1 || step > 5) return;

  const continueBtn = document.getElementById(`quizContinueBtnStep${step}`);
  const hintEl = document.getElementById(`quizHintStep${step}`);
  if (!continueBtn) return;

  let isValid = false;
  let hintText = "";

  switch (step) {
    case 1:
      isValid = Boolean(quizState.answers.occasion);
      hintText = isValid ? "Occasion selected • Ready to continue" : "Select 1 occasion to continue";
      break;

    case 2:
      const count = quizState.answers.styles.length;
      isValid = count >= 1 && count <= 2;
      if (count === 0) hintText = "Select up to 2 personal styles (0 selected)";
      else if (count === 1) hintText = "1 of 2 styles selected • You may pick one more or continue";
      else hintText = "2 of 2 styles selected • Maximum reached";
      break;

    case 3:
      isValid = quizState.answers.categories.length > 0;
      hintText = isValid 
        ? `${quizState.answers.categories.length} category preferences selected` 
        : "Select one or more categories (or 'Surprise Me')";
      break;

    case 4:
      isValid = Boolean(quizState.answers.metal);
      hintText = isValid ? "Metal tone chosen • Ready to continue" : "Select 1 preferred metal finish";
      break;

    case 5:
      const min = quizState.answers.budgetMin;
      const max = quizState.answers.budgetMax;
      isValid = min >= 0 && max <= 30000 && min <= max;
      hintText = isValid 
        ? `Budget range: ₹${min.toLocaleString('en-IN')} – ₹${max.toLocaleString('en-IN')}` 
        : "Please verify price range (Minimum cannot exceed Maximum)";
      break;
  }

  continueBtn.disabled = !isValid;
  if (hintEl) hintEl.textContent = hintText;
}

// --------------------------------------------------------------------------
// 5. Option Card Interactions & Sync
// --------------------------------------------------------------------------
function initOptionCardListeners() {
  // Welcome CTA
  const startBtn = document.getElementById("quizStartBtn");
  startBtn?.addEventListener("click", () => {
    quizState.step = 1;
    renderCurrentStep();
  });

  // Global Back Button
  const backBtn = document.getElementById("quizBackBtn");
  backBtn?.addEventListener("click", () => {
    if (quizState.step > 1) {
      quizState.step -= 1;
      renderCurrentStep();
    } else if (quizState.step === 1) {
      quizState.step = 0;
      renderCurrentStep();
    }
  });

  // Step 1: Occasion (Single-select)
  document.querySelectorAll("[data-question='occasion']").forEach(card => {
    card.addEventListener("click", () => {
      const val = card.dataset.value;
      quizState.answers.occasion = val;
      syncOptionCardSelectionStates();
      updateContinueButtonState();
    });
  });

  // Step 2: Personal Style (Multi-select up to 2)
  document.querySelectorAll("[data-question='style']").forEach(card => {
    card.addEventListener("click", () => {
      const val = card.dataset.value;
      const idx = quizState.answers.styles.indexOf(val);
      if (idx > -1) {
        quizState.answers.styles.splice(idx, 1);
      } else {
        if (quizState.answers.styles.length < 2) {
          quizState.answers.styles.push(val);
        } else {
          quizState.answers.styles[1] = val;
        }
      }
      syncOptionCardSelectionStates();
      updateContinueButtonState();
    });
  });

  // Step 3: Jewellery Categories (Multi-select + Surprise Me)
  document.querySelectorAll("[data-question='category']").forEach(card => {
    card.addEventListener("click", () => {
      const val = card.dataset.value;
      if (val === "Surprise Me") {
        if (quizState.answers.categories.includes("Surprise Me")) {
          quizState.answers.categories = [];
        } else {
          quizState.answers.categories = ["Surprise Me"];
        }
      } else {
        const surpriseIdx = quizState.answers.categories.indexOf("Surprise Me");
        if (surpriseIdx > -1) quizState.answers.categories.splice(surpriseIdx, 1);

        const idx = quizState.answers.categories.indexOf(val);
        if (idx > -1) {
          quizState.answers.categories.splice(idx, 1);
        } else {
          quizState.answers.categories.push(val);
        }
      }
      syncOptionCardSelectionStates();
      updateContinueButtonState();
    });
  });

  // Step 4: Metal Colour (Single-select)
  document.querySelectorAll("[data-question='metal']").forEach(card => {
    card.addEventListener("click", () => {
      const val = card.dataset.value;
      quizState.answers.metal = val;
      syncOptionCardSelectionStates();
      updateContinueButtonState();
    });
  });

  // Continue Buttons (Steps 1 to 4)
  for (let i = 1; i <= 4; i++) {
    const btn = document.getElementById(`quizContinueBtnStep${i}`);
    btn?.addEventListener("click", () => {
      quizState.step = i + 1;
      renderCurrentStep();
    });
  }

  // Step 5 Continue -> Generate Results
  const finishBtn = document.getElementById("quizContinueBtnStep5");
  finishBtn?.addEventListener("click", () => {
    generateRecommendations();
    quizState.step = 6;
    renderCurrentStep();
    renderResultsScreen();
  });
}

function syncOptionCardSelectionStates() {
  // Step 1: Occasion
  document.querySelectorAll("[data-question='occasion']").forEach(card => {
    const val = card.dataset.value;
    const isSelected = quizState.answers.occasion === val;
    card.classList.toggle("is-selected", isSelected);
    card.setAttribute("aria-checked", isSelected);
  });

  // Step 2: Style
  document.querySelectorAll("[data-question='style']").forEach(card => {
    const val = card.dataset.value;
    const isSelected = quizState.answers.styles.includes(val);
    card.classList.toggle("is-selected", isSelected);
    card.setAttribute("aria-checked", isSelected);
  });

  // Step 3: Category
  document.querySelectorAll("[data-question='category']").forEach(card => {
    const val = card.dataset.value;
    const isSelected = quizState.answers.categories.includes(val);
    card.classList.toggle("is-selected", isSelected);
    card.setAttribute("aria-checked", isSelected);
  });

  // Step 4: Metal
  document.querySelectorAll("[data-question='metal']").forEach(card => {
    const val = card.dataset.value;
    const isSelected = quizState.answers.metal === val;
    card.classList.toggle("is-selected", isSelected);
    card.setAttribute("aria-checked", isSelected);
  });
}

// --------------------------------------------------------------------------
// 6. Dual-Thumb Budget Slider & Quick Selects Engine
// --------------------------------------------------------------------------
function initBudgetSlider() {
  const sliderMin = document.getElementById("quizSliderMin");
  const sliderMax = document.getElementById("quizSliderMax");
  const rangeFill = document.getElementById("quizRangeFill");
  const display = document.getElementById("quizSliderDisplay");
  const inputMin = document.getElementById("quizInputMin");
  const inputMax = document.getElementById("quizInputMax");
  const resetBtn = document.getElementById("quizSliderReset");
  const chips = document.querySelectorAll(".quiz-quick-chip");

  if (!sliderMin || !sliderMax) return;

  function updateSliderFillAndDisplay(minVal, maxVal) {
    const total = 30000;
    const leftPercent = (minVal / total) * 100;
    const widthPercent = ((maxVal - minVal) / total) * 100;

    if (rangeFill) {
      rangeFill.style.left = `${leftPercent}%`;
      rangeFill.style.width = `${widthPercent}%`;
    }

    if (display) {
      display.textContent = `₹${minVal.toLocaleString('en-IN')} – ₹${maxVal.toLocaleString('en-IN')}`;
    }

    if (sliderMin && sliderMin.value !== String(minVal)) sliderMin.value = minVal;
    if (sliderMax && sliderMax.value !== String(maxVal)) sliderMax.value = maxVal;

    if (inputMin && document.activeElement !== inputMin) inputMin.value = minVal;
    if (inputMax && document.activeElement !== inputMax) inputMax.value = maxVal;

    chips.forEach(chip => {
      const cMin = parseInt(chip.dataset.min, 10);
      const cMax = parseInt(chip.dataset.max, 10);
      const isActive = cMin === minVal && cMax === maxVal;
      chip.classList.toggle("is-active", isActive);
    });

    updateContinueButtonState();
  }

  function handleSliderInput() {
    let minVal = parseInt(sliderMin.value, 10);
    let maxVal = parseInt(sliderMax.value, 10);
    if (isNaN(minVal)) minVal = 0;
    if (isNaN(maxVal)) maxVal = 30000;

    if (minVal > maxVal) {
      if (document.activeElement === sliderMin) {
        sliderMin.value = maxVal;
        minVal = maxVal;
      } else {
        sliderMax.value = minVal;
        maxVal = minVal;
      }
    }

    quizState.answers.budgetMin = minVal;
    quizState.answers.budgetMax = maxVal;
    updateSliderFillAndDisplay(minVal, maxVal);
  }

  sliderMin.addEventListener("input", handleSliderInput);
  sliderMax.addEventListener("input", handleSliderInput);

  inputMin?.addEventListener("change", () => {
    let val = parseInt(inputMin.value, 10);
    if (isNaN(val) || val < 0) val = 0;
    if (val > quizState.answers.budgetMax) val = quizState.answers.budgetMax;
    quizState.answers.budgetMin = val;
    updateSliderFillAndDisplay(val, quizState.answers.budgetMax);
  });

  inputMax?.addEventListener("change", () => {
    let val = parseInt(inputMax.value, 10);
    if (isNaN(val) || val > 30000) val = 30000;
    if (val < quizState.answers.budgetMin) val = quizState.answers.budgetMin;
    quizState.answers.budgetMax = val;
    updateSliderFillAndDisplay(quizState.answers.budgetMin, val);
  });

  resetBtn?.addEventListener("click", () => {
    quizState.answers.budgetMin = 0;
    quizState.answers.budgetMax = 30000;
    updateSliderFillAndDisplay(0, 30000);
  });

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      const minVal = parseInt(chip.dataset.min, 10);
      const maxVal = parseInt(chip.dataset.max, 10);
      quizState.answers.budgetMin = minVal;
      quizState.answers.budgetMax = maxVal;
      updateSliderFillAndDisplay(minVal, maxVal);
    });
  });

  updateSliderFillAndDisplay(quizState.answers.budgetMin, quizState.answers.budgetMax);
}

// --------------------------------------------------------------------------
// 7. Deterministic Recommendation Engine
// --------------------------------------------------------------------------
export function scoreProduct(p, answers) {
  const normCat = p.normalizedCategory || normalizeCategory(p.category);
  const text = `${p.title || ''} ${(p.tags || []).join(' ')} ${normCat}`.toLowerCase();
  let score = 0;

  // 1. Occasion Match (Weight: 30)
  const occ = answers.occasion;
  let occScore = 0;
  if (occ === "Everyday Elegance") {
    if (/stud|top|anti[- ]tarnish|pearl drop|daily|simple|dainty|solitaire/i.test(text)) occScore = 30;
    else if (normCat === "Earrings" || normCat === "Rings") occScore = 20;
    else occScore = 8;
  } else if (occ === "Office & Work") {
    if (/stud|ad tops|anti[- ]tarnish|clean|geometric|subtle|cuff/i.test(text)) occScore = 30;
    else if (normCat === "Earrings" || normCat === "Bracelets & Bangles") occScore = 20;
    else occScore = 8;
  } else if (occ === "Date Night") {
    if (/drop|bow|heart|crystal|pearl|choker|delicate|sparkl|pendant/i.test(text)) occScore = 30;
    else if (normCat === "Necklaces" || normCat === "Earrings" || normCat === "Pendant Sets") occScore = 20;
    else occScore = 10;
  } else if (occ === "Wedding & Festivities") {
    if (/bridal|kundan|polki|royal|heritage|jadau|regalia|empress|set/i.test(text)) occScore = 30;
    else if (normCat === "Jewellery Sets" || normCat === "Necklaces") occScore = 22;
    else occScore = 6;
  } else if (occ === "Party & Celebrations") {
    if (/statement|bold|american diamond|ad|cocktail|choker|cuff|glam/i.test(text)) occScore = 30;
    else if (normCat === "Jewellery Sets" || normCat === "Earrings") occScore = 18;
    else occScore = 8;
  } else if (occ === "Gifting Someone Special") {
    if (/set|pearl|drop|heart|gift|solitaire|bangle|kada/i.test(text)) occScore = 30;
    else occScore = 15;
  }
  score += occScore;

  // 2. Personal Style Match (Weight: 25)
  const styles = answers.styles || [];
  let styleScore = 0;
  if (styles.length > 0) {
    const maxPerStyle = SCORING_WEIGHTS.style / styles.length;
    styles.forEach(st => {
      let stMatch = 0;
      if (st === "Minimal & Timeless" && /stud|minimal|solitaire|dainty|clean|pearl/i.test(text)) stMatch = maxPerStyle;
      else if (st === "Classic & Elegant" && /pearl|emerald|heritage|classic|regal|vintage/i.test(text)) stMatch = maxPerStyle;
      else if (st === "Traditional & Ethnic" && /kundan|polki|bridal|ethnic|temple|kada|gold plated/i.test(text)) stMatch = maxPerStyle;
      else if (st === "Modern & Bold" && /statement|geometric|bold|cuff|choker|sharp/i.test(text)) stMatch = maxPerStyle;
      else if (st === "Romantic & Delicate" && /floral|leaf|heart|bow|delicate|crystal|drop/i.test(text)) stMatch = maxPerStyle;
      else if (st === "Trendy & Experimental" && /multi|cabochon|coin|marquise|raw|gemstone/i.test(text)) stMatch = maxPerStyle;
      else stMatch = maxPerStyle * 0.25;
      styleScore += stMatch;
    });
  } else {
    styleScore = SCORING_WEIGHTS.style * 0.5;
  }
  score += styleScore;

  // 3. Jewellery Category Match (Weight: 20)
  const categories = answers.categories || [];
  let catScore = 0;
  if (categories.includes("Surprise Me") || categories.length === 0) {
    catScore = SCORING_WEIGHTS.category;
  } else if (categories.includes(normCat)) {
    catScore = SCORING_WEIGHTS.category;
  } else {
    catScore = 0;
  }
  score += catScore;

  // 4. Metal Colour Match (Weight: 15)
  const metal = answers.metal;
  let metalScore = 0;
  if (!metal || metal === "No Preference") {
    metalScore = SCORING_WEIGHTS.metal;
  } else if (metal === "Gold") {
    if (/gold|plated|polki|kundan/i.test(text)) metalScore = SCORING_WEIGHTS.metal;
    else metalScore = 4;
  } else if (metal === "Silver") {
    if (/silver|rhodium|white|diamond|crystal|ad tops/i.test(text)) metalScore = SCORING_WEIGHTS.metal;
    else metalScore = 4;
  } else if (metal === "Rose Gold") {
    if (/rose gold|pink|blush/i.test(text)) metalScore = SCORING_WEIGHTS.metal;
    else metalScore = 3;
  } else if (metal === "Mixed Metals") {
    if (/multi|two[- ]tone|mixed|beads|cabochon/i.test(text)) metalScore = SCORING_WEIGHTS.metal;
    else metalScore = 8;
  }
  score += metalScore;

  // 5. Budget Match (Weight: 10)
  const price = p.price || 0;
  const minB = answers.budgetMin || 0;
  const maxB = answers.budgetMax || 30000;
  let budgetScore = 0;
  if (price >= minB && price <= maxB) {
    budgetScore = SCORING_WEIGHTS.budget;
  }
  score += budgetScore;

  return { product: p, score: Math.round(score * 10) / 10 };
}

export function generateRecommendations() {
  const ans = quizState.answers;
  const allProds = quizState.products;

  // Determine Persona
  const persona = STYLE_PERSONAS.find(p => p.condition(ans)) || STYLE_PERSONAS[STYLE_PERSONAS.length - 1];
  quizState.recommendations.personaTitle = persona.title;
  quizState.recommendations.personaDesc = persona.desc;

  // Primary Budget Filter
  let inBudgetProducts = allProds.filter(p => p.price >= ans.budgetMin && p.price <= ans.budgetMax);
  let isBudgetRelaxed = false;

  // Fallback if budget yields too few results
  if (inBudgetProducts.length < 6) {
    isBudgetRelaxed = true;
    const relaxedMin = Math.max(0, ans.budgetMin * 0.7);
    const relaxedMax = Math.min(30000, ans.budgetMax * 1.3 + 1000);
    inBudgetProducts = allProds.filter(p => p.price >= relaxedMin && p.price <= relaxedMax);
    if (inBudgetProducts.length < 6) {
      inBudgetProducts = allProds;
    }
  }
  quizState.recommendations.isBudgetRelaxed = isBudgetRelaxed;

  // Score all in-budget products
  const scored = inBudgetProducts
    .map(p => scoreProduct(p, ans))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.product.isSoldOut !== b.product.isSoldOut) return a.product.isSoldOut ? 1 : -1;
      const discA = a.product.discount ? parseInt(a.product.discount, 10) || 0 : 0;
      const discB = b.product.discount ? parseInt(b.product.discount, 10) || 0 : 0;
      if (discB !== discA) return discB - discA;
      return a.product.id - b.product.id;
    });

  // 1. "Perfect for You" (Top 4-8 highest matches)
  const perfectForYou = scored.slice(0, 6).map(s => s.product);
  quizState.recommendations.perfectForYou = perfectForYou;

  // 2. "Complete the Look" (Complementary pieces from OTHER categories)
  const topPrimaryCats = new Set(perfectForYou.map(p => p.normalizedCategory));
  const complementaryScored = scored.filter(s => {
    return !perfectForYou.some(p => p.id === s.product.id) && !topPrimaryCats.has(s.product.normalizedCategory);
  });
  
  const completeTheLook = (complementaryScored.length >= 4 ? complementaryScored : scored.filter(s => !perfectForYou.some(p => p.id === s.product.id)))
    .slice(0, 4)
    .map(s => s.product);
  quizState.recommendations.completeTheLook = completeTheLook;

  // 3. "A Little Something Different" (Discovery pieces)
  const usedIds = new Set([...perfectForYou.map(p => p.id), ...completeTheLook.map(p => p.id)]);
  const discoveryPool = scored.filter(s => !usedIds.has(s.product.id));
  
  discoveryPool.sort((a, b) => {
    if (a.product.isEffectiveAntiTarnish !== b.product.isEffectiveAntiTarnish) {
      return a.product.isEffectiveAntiTarnish ? -1 : 1;
    }
    return b.score - a.score;
  });

  const somethingDifferent = discoveryPool.slice(0, 4).map(s => s.product);
  quizState.recommendations.somethingDifferent = somethingDifferent;
}

// --------------------------------------------------------------------------
// 8. Results Screen Rendering & Card Events
// --------------------------------------------------------------------------
function renderResultsScreen() {
  const ans = quizState.answers;
  const rec = quizState.recommendations;

  // Persona Header
  const titleEl = document.getElementById("quizPersonaTitle");
  const descEl = document.getElementById("quizPersonaDesc");
  const summaryBox = document.getElementById("quizSummaryChips");
  const relaxedNotice = document.getElementById("quizRelaxedNotice");

  if (titleEl) titleEl.textContent = rec.personaTitle;
  if (descEl) descEl.textContent = rec.personaDesc;

  // Preference Summary Chips
  if (summaryBox) {
    summaryBox.innerHTML = `
      <div class="quiz-summary-chip">Occasion: <strong>${ans.occasion || 'Everyday'}</strong></div>
      <div class="quiz-summary-chip">Style: <strong>${ans.styles.join(', ') || 'Timeless'}</strong></div>
      <div class="quiz-summary-chip">Categories: <strong>${ans.categories.join(', ') || 'All'}</strong></div>
      <div class="quiz-summary-chip">Metal: <strong>${ans.metal || 'Any'}</strong></div>
      <div class="quiz-summary-chip">Budget: <strong>₹${ans.budgetMin.toLocaleString('en-IN')} – ₹${ans.budgetMax.toLocaleString('en-IN')}</strong></div>
    `;
  }

  // Relaxed Filter Notice
  if (relaxedNotice) {
    if (rec.isBudgetRelaxed) {
      relaxedNotice.style.display = "block";
      relaxedNotice.innerHTML = `
        <strong>Notice:</strong> We gently expanded your price boundaries to ensure you discover an exquisite, balanced jewellery suite matching your exact personal style.
      `;
    } else {
      relaxedNotice.style.display = "none";
    }
  }

  // 1. Perfect For You Grid
  const gridPerfect = document.getElementById("quizGridPerfect");
  if (gridPerfect) {
    gridPerfect.innerHTML = rec.perfectForYou.map(p => createProductCardHTML(p)).join("");
    attachCardEvents(gridPerfect);
  }

  // 2. Complete The Look Grid
  const gridComplete = document.getElementById("quizGridComplete");
  if (gridComplete) {
    gridComplete.innerHTML = rec.completeTheLook.map(p => createProductCardHTML(p)).join("");
    attachCardEvents(gridComplete);
  }

  // 3. A Little Something Different Grid
  const gridDifferent = document.getElementById("quizGridDifferent");
  if (gridDifferent) {
    gridDifferent.innerHTML = rec.somethingDifferent.map(p => createProductCardHTML(p)).join("");
    attachCardEvents(gridDifferent);
  }

  // Action Buttons
  const exploreBtn = document.getElementById("quizExploreCollectionBtn");
  const refineBtn = document.getElementById("quizRefineBtn");
  const retakeBtn = document.getElementById("quizRetakeBtn");

  if (exploreBtn) {
    const primaryCat = ans.categories.length === 1 && ans.categories[0] !== "Surprise Me" 
      ? ans.categories[0] 
      : "all";
    exploreBtn.href = `index.html#catalog?cat=${encodeURIComponent(primaryCat)}&min=${ans.budgetMin}&max=${ans.budgetMax}`;
  }

  refineBtn?.addEventListener("click", () => {
    quizState.step = 1;
    renderCurrentStep();
  });

  retakeBtn?.addEventListener("click", () => {
    quizState.answers = {
      occasion: null,
      styles: [],
      categories: [],
      metal: null,
      budgetMin: 0,
      budgetMax: 30000
    };
    quizState.step = 0;
    renderCurrentStep();
  });

  // Video Consultation & WhatsApp Concierge
  const bookVideoBtn = document.getElementById("quizBookVideoBtn");
  const shareWaBtn = document.getElementById("quizShareWaBtn");

  bookVideoBtn?.addEventListener("click", () => {
    openConsultationModal({
      mode: "video",
      pieceTitle: `Curated Suite: ${rec.personaTitle}`,
      category: ans.categories[0] || "Bridal & Polki Sets"
    });
  });

  if (shareWaBtn) {
    const topRecs = (rec.perfectForYou || []).slice(0, 3).map((p, i) => `${i + 1}. ${p.title} (${formatPrice(p.price)})`).join("\n");
    const waText = `✨ *Namaste Shrivara Atelier!*\n\nI just took your *Find Your Style Discovery Quiz* and my jewellery style persona is:\n👑 *${rec.personaTitle}*\n\n• *Occasion:* ${ans.occasion || 'Everyday Elegance'}\n• *Style Aesthetic:* ${ans.styles.join(', ') || 'Timeless'}\n• *Categories:* ${ans.categories.join(', ') || 'All'}\n• *Metal Tone:* ${ans.metal || 'Any'}\n• *Budget:* ₹${ans.budgetMin.toLocaleString('en-IN')} – ₹${ans.budgetMax.toLocaleString('en-IN')}\n\n*Top Curated Recommendations:*\n${topRecs || 'Curated Suites'}\n\nCould I please get styling advice on matching these pieces with my celebration outfit? Thank you!`;
    shareWaBtn.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(waText)}`;
  }
}
