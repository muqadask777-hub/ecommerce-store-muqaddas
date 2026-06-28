// ============================================================
// filters.js — Search, Category Filter, and Sort logic
// All three work simultaneously without breaking each other.
// ============================================================

// ---- DOM references ----
const searchInput     = document.getElementById('searchInput');
const sortSelect      = document.getElementById('sortSelect');
const categoryBar     = document.getElementById('categoryBar');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const emptyStateReset = document.getElementById('emptyStateReset');

// ---- Filter state ----
let activeCategory  = 'all';
let activeSearch    = '';
let activeSortOrder = 'default';

// ============================================================
// DEBOUNCED SEARCH (bonus — closure-based, no library)
// ============================================================

/**
 * Creates a debounce function using a closure.
 * Delays execution until the user stops typing for `delay` ms.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
function createDebounce(fn, delay) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}

const handleSearchInput = createDebounce((e) => {
  activeSearch = e.target.value.trim().toLowerCase();
  applyFiltersAndRender();
}, 300);

// ============================================================
// APPLY ALL FILTERS + SORT SIMULTANEOUSLY
// ============================================================

/**
 * Applies search, category, and sort — all at once.
 * Calls renderProducts() from products.js with the result.
 */
function applyFiltersAndRender() {
  // 1. Start with all products
  let result = [...allProducts];

  // 2. Filter by active category
  if (activeCategory !== 'all') {
    result = result.filter((p) => p.category === activeCategory);
  }

  // 3. Filter by search query (case-insensitive, matches title)
  if (activeSearch) {
    result = result.filter((p) =>
      p.title.toLowerCase().includes(activeSearch)
    );
  }

  // 4. Sort
  result = sortProducts(result, activeSortOrder);

  // 5. Pass to products.js to render the visible page slice
  renderProducts(result);
}

/**
 * Sorts a products array by the given key.
 * Returns a new array (does not mutate).
 * @param {Array} products
 * @param {string} order
 * @returns {Array}
 */
function sortProducts(products, order) {
  return [...products].sort((a, b) => {
    if (order === 'price-asc')   return a.price - b.price;
    if (order === 'price-desc')  return b.price - a.price;
    if (order === 'rating-desc') return b.rating.rate - a.rating.rate;
    if (order === 'name-asc')    return a.title.localeCompare(b.title);
    return 0; // 'default' — keep original API order
  });
}

// ============================================================
// CATEGORY BUTTONS — generated dynamically from API data
// ============================================================

/**
 * Builds category filter buttons from the actual API data.
 * Never hardcodes category names in HTML.
 * @param {Array} products
 */
function buildCategoryButtons(products) {
  const categories = ['all', ...new Set(products.map((p) => p.category))];

  categoryBar.innerHTML = categories
    .map(
      (cat) => `
      <button
        class="category-btn${cat === 'all' ? ' active' : ''}"
        data-category="${cat}"
      >
        ${cat === 'all' ? 'All' : cat}
      </button>
    `
    )
    .join('');

  // Attach delegated click handler
  categoryBar.addEventListener('click', handleCategoryClick);
}

function handleCategoryClick(e) {
  const btn = e.target.closest('.category-btn');
  if (!btn) return;

  // Update active state styling
  document.querySelectorAll('.category-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');

  activeCategory = btn.dataset.category;
  applyFiltersAndRender();
}

// ============================================================
// CLEAR ALL FILTERS
// ============================================================

function clearAllFilters() {
  activeSearch    = '';
  activeCategory  = 'all';
  activeSortOrder = 'default';

  searchInput.value  = '';
  sortSelect.value   = 'default';

  document.querySelectorAll('.category-btn').forEach((b) => b.classList.remove('active'));
  document.querySelector('.category-btn[data-category="all"]')?.classList.add('active');

  applyFiltersAndRender();
}

// ============================================================
// EVENT LISTENERS
// ============================================================

searchInput.addEventListener('input', handleSearchInput);

sortSelect.addEventListener('change', (e) => {
  activeSortOrder = e.target.value;
  applyFiltersAndRender();
});

clearFiltersBtn.addEventListener('click', clearAllFilters);
emptyStateReset?.addEventListener('click', clearAllFilters);