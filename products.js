// ============================================================
// products.js — Product rendering, modal, wishlist, compare
// ============================================================

// ---- DOM references ----
const productGrid   = document.getElementById('productGrid');
const productCount  = document.getElementById('productCount');
const emptyState    = document.getElementById('emptyState');
const errorState    = document.getElementById('errorState');
const loadMoreWrap  = document.getElementById('loadMoreWrap');
const loadMoreBtn   = document.getElementById('loadMoreBtn');
const modalBody     = document.getElementById('modalBody');

// ============================================================
// PAGINATION STATE (Load More — bonus)
// ============================================================

const PAGE_SIZE      = 8;
let visibleCount     = PAGE_SIZE;
let currentFiltered  = []; // Products currently being shown

// ============================================================
// WISHLIST STATE
// ============================================================

const WISHLIST_KEY = 'shopvault-wishlist';

function loadWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
  } catch {
    return [];
  }
}

function saveWishlist(list) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
}

let wishlist = loadWishlist();

function isWishlisted(id) {
  return wishlist.some((item) => item.id === id);
}

function toggleWishlist(product) {
  if (isWishlisted(product.id)) {
    wishlist = wishlist.filter((item) => item.id !== product.id);
    showToast(`Removed from wishlist`, '');
  } else {
    wishlist.push(product);
    showToast(`Added to wishlist ❤️`, 'success');
  }
  saveWishlist(wishlist);
  updateWishlistBadge();
}

function updateWishlistBadge() {
  const badge = document.getElementById('wishlistCount');
  if (badge) badge.textContent = wishlist.length;
}

// ============================================================
// COMPARE STATE (bonus — up to 3 products)
// ============================================================

let compareList = [];
const compareBar     = document.getElementById('compareBar');
const compareBarText = document.getElementById('compareBarText');
const compareNowBtn  = document.getElementById('compareNowBtn');
const compareClearBtn= document.getElementById('compareClearBtn');

function toggleCompare(product) {
  const alreadyAdded = compareList.some((p) => p.id === product.id);

  if (alreadyAdded) {
    compareList = compareList.filter((p) => p.id !== product.id);
  } else {
    if (compareList.length >= 3) {
      showToast('Max 3 products can be compared', 'error');
      return;
    }
    compareList.push(product);
  }

  updateCompareBar();
  // Refresh card compare button states
  renderProducts(currentFiltered);
}

function updateCompareBar() {
  const count = compareList.length;
  if (count === 0) {
    compareBar.classList.add('hidden');
    return;
  }
  compareBar.classList.remove('hidden');
  compareBarText.textContent = `${count} item${count > 1 ? 's' : ''} selected`;
  compareNowBtn.disabled = count < 2;
}

compareNowBtn?.addEventListener('click', openCompareView);
compareClearBtn?.addEventListener('click', () => {
  compareList = [];
  updateCompareBar();
  renderProducts(currentFiltered);
});

function openCompareView() {
  const compareModalBody = document.getElementById('compareModalBody');

  const headers = compareList
    .map((p) => `<th>${p.title.slice(0, 40)}…</th>`)
    .join('');

  const imageRow = compareList
    .map((p) => `<td><img src="${p.image}" alt="${p.title}" /></td>`)
    .join('');

  const priceRow = compareList
    .map((p) => `<td><strong>$${p.price.toFixed(2)}</strong></td>`)
    .join('');

  const ratingRow = compareList
    .map((p) => `<td>${buildStarIcons(p.rating.rate)} (${p.rating.rate})</td>`)
    .join('');

  const catRow = compareList
    .map((p) => `<td style="text-transform:capitalize">${p.category}</td>`)
    .join('');

  const descRow = compareList
    .map((p) => `<td style="font-size:.8rem;color:var(--color-text-muted)">${p.description.slice(0, 120)}…</td>`)
    .join('');

  compareModalBody.innerHTML = `
    <h2 style="margin-bottom:18px;font-weight:700;">
      <i class="fas fa-code-compare" style="color:var(--color-accent)"></i> Compare Products
    </h2>
    <div style="overflow-x:auto;">
      <table class="compare-table">
        <thead><tr><th>Feature</th>${headers}</tr></thead>
        <tbody>
          <tr><th>Image</th>${imageRow}</tr>
          <tr><th>Price</th>${priceRow}</tr>
          <tr><th>Rating</th>${ratingRow}</tr>
          <tr><th>Category</th>${catRow}</tr>
          <tr><th>Description</th>${descRow}</tr>
        </tbody>
      </table>
    </div>
  `;

  openCompareModal();
}

// ============================================================
// WISHLIST MODAL
// ============================================================

document.getElementById('wishlistNavBtn')?.addEventListener('click', () => {
  renderWishlistModal();
  openWishlistModal();
});

function renderWishlistModal() {
  const body = document.getElementById('wishlistModalBody');

  if (wishlist.length === 0) {
    body.innerHTML = `
      <h2 style="margin-bottom:18px"><i class="fas fa-heart" style="color:var(--color-accent)"></i> Wishlist</h2>
      <div class="wishlist-empty"><i class="fas fa-heart-crack" style="font-size:2rem;color:var(--color-border)"></i><p>Your wishlist is empty.</p></div>
    `;
    return;
  }

  const cardsHTML = wishlist
    .map(
      (p) => `
      <div class="wishlist-card">
        <img src="${p.image}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/56?text=?'" />
        <div class="wishlist-card-info">
          <p class="wishlist-card-title">${p.title}</p>
          <p class="wishlist-card-price">$${p.price.toFixed(2)}</p>
        </div>
        <button class="remove-btn" onclick="removeWishlistItem(${p.id})" aria-label="Remove">
          <i class="fas fa-xmark"></i>
        </button>
      </div>
    `
    )
    .join('');

  body.innerHTML = `
    <h2 style="margin-bottom:18px"><i class="fas fa-heart" style="color:var(--color-accent)"></i> Wishlist (${wishlist.length})</h2>
    <div class="wishlist-grid">${cardsHTML}</div>
  `;
}

function removeWishlistItem(id) {
  wishlist = wishlist.filter((item) => item.id !== id);
  saveWishlist(wishlist);
  updateWishlistBadge();
  renderWishlistModal();
}

// ============================================================
// STAR ICONS
// ============================================================

/**
 * Builds filled/half/empty star icon HTML for a given rating.
 * @param {number} rating - 0 to 5
 * @returns {string} HTML string of star icons
 */
function buildStarIcons(rating) {
  return Array.from({ length: 5 }, (_, i) => {
    const full = i + 1 <= Math.floor(rating);
    const half = !full && i < rating && rating % 1 >= 0.25;
    if (full) return `<i class="fas fa-star"></i>`;
    if (half) return `<i class="fas fa-star-half-stroke"></i>`;
    return `<i class="far fa-star"></i>`;
  }).join('');
}

// ============================================================
// SKELETON CARDS
// ============================================================

/**
 * Renders skeleton placeholder cards while products load.
 * @param {number} count - How many skeletons to show
 */
function showSkeletonCards(count = 9) {
  const skeletons = Array.from({ length: count }, () => `
    <div class="skeleton-card">
      <div class="skel skel-img"></div>
      <div class="skel-body">
        <div class="skel skel-badge"></div>
        <div class="skel skel-title-1"></div>
        <div class="skel skel-title-2"></div>
        <div class="skel skel-stars"></div>
        <div class="skel skel-price"></div>
        <div class="skel skel-btn"></div>
      </div>
    </div>
  `).join('');

  productGrid.innerHTML = skeletons;
  emptyState.classList.add('hidden');
  errorState.classList.add('hidden');
}

// ============================================================
// RENDER PRODUCTS
// ============================================================

/**
 * Renders the given products array into the grid.
 * Handles empty state and "load more" pagination.
 * @param {Array} products
 */
function renderProducts(products) {
  currentFiltered = products;
  // Reset visible count when filter changes
  visibleCount = PAGE_SIZE;

  emptyState.classList.add('hidden');
  errorState.classList.add('hidden');

  if (products.length === 0) {
    productGrid.innerHTML = '';
    emptyState.classList.remove('hidden');
    productCount.textContent = 'No products found';
    loadMoreWrap.style.display = 'none';
    return;
  }

  const visible = products.slice(0, visibleCount);
  productCount.textContent = `Showing ${visible.length} of ${products.length} product${products.length !== 1 ? 's' : ''}`;
  productGrid.innerHTML = visible.map((p) => buildProductCardHTML(p)).join('');

  // Show / hide load more button
  loadMoreWrap.style.display = products.length > visibleCount ? 'block' : 'none';

  attachCardListeners();
  updateWishlistBadge();
}

/**
 * Appends the next page of products (Load More button).
 */
function loadMoreProducts() {
  visibleCount += PAGE_SIZE;
  const visible = currentFiltered.slice(0, visibleCount);

  productCount.textContent = `Showing ${visible.length} of ${currentFiltered.length} product${currentFiltered.length !== 1 ? 's' : ''}`;

  // Append only the new cards (avoids re-rendering everything)
  const newCards = currentFiltered.slice(visibleCount - PAGE_SIZE, visibleCount);
  newCards.forEach((p) => {
    const div = document.createElement('div');
    div.innerHTML = buildProductCardHTML(p);
    productGrid.appendChild(div.firstElementChild);
  });

  loadMoreWrap.style.display = currentFiltered.length > visibleCount ? 'block' : 'none';
  attachCardListeners();
}

loadMoreBtn?.addEventListener('click', loadMoreProducts);

// ============================================================
// BUILD PRODUCT CARD HTML
// ============================================================

/**
 * Generates the HTML string for a single product card.
 * @param {Object} product
 * @returns {string}
 */
function buildProductCardHTML(product) {
  const { id, title, price, image, category, rating } = product;
  const starsHTML  = buildStarIcons(rating.rate);
  const wishlisted = isWishlisted(id) ? 'active' : '';
  const compared   = compareList.some((p) => p.id === id) ? 'active' : '';

  return `
    <article class="product-card" data-id="${id}" role="button" tabindex="0" aria-label="View details for ${title}">
      <div class="card-img-wrap">
        <span class="category-badge">${category}</span>
        <img
          src="${image}"
          alt="${title}"
          loading="lazy"
          onerror="this.src='https://via.placeholder.com/200x200?text=No+Image'"
        />
        <button
          class="card-wishlist-btn ${wishlisted}"
          data-id="${id}"
          aria-label="${wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}"
        >
          <i class="${wishlisted ? 'fas' : 'far'} fa-heart"></i>
        </button>
        <button
          class="card-compare-btn ${compared}"
          data-id="${id}"
          aria-label="Compare this product"
          title="Compare"
        >
          <i class="fas fa-code-compare"></i>
        </button>
      </div>
      <div class="card-body">
        <h2 class="card-title">${title}</h2>
        <div class="star-row">
          <span class="stars">${starsHTML}</span>
          <span class="star-num">${rating.rate} (${rating.count})</span>
        </div>
        <p class="card-price">$${price.toFixed(2)}</p>
      </div>
      <div class="card-footer">
        <button class="btn-add-cart" data-id="${id}" aria-label="Add ${title} to cart">
          <i class="fas fa-cart-plus"></i> Add to Cart
        </button>
      </div>
    </article>
  `;
}

// ============================================================
// CARD EVENT LISTENERS
// ============================================================

function attachCardListeners() {
  productGrid.addEventListener('click', handleCardClick);
  productGrid.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleCardClick(e);
  });
}

function handleCardClick(e) {
  const wishlistBtn = e.target.closest('.card-wishlist-btn');
  const compareBtn  = e.target.closest('.card-compare-btn');
  const addCartBtn  = e.target.closest('.btn-add-cart');
  const card        = e.target.closest('.product-card');

  if (wishlistBtn) {
    e.stopPropagation();
    const id      = Number(wishlistBtn.dataset.id);
    const product = allProducts.find((p) => p.id === id);
    if (product) toggleWishlist(product);
    // Re-render to update heart icon
    renderProducts(currentFiltered);
    return;
  }

  if (compareBtn) {
    e.stopPropagation();
    const id      = Number(compareBtn.dataset.id);
    const product = allProducts.find((p) => p.id === id);
    if (product) toggleCompare(product);
    return;
  }

  if (addCartBtn) {
    e.stopPropagation();
    const id      = Number(addCartBtn.dataset.id);
    const product = allProducts.find((p) => p.id === id);
    if (product) addToCart(product, 1);
    return;
  }

  // Clicking anywhere else on the card opens the modal
  if (card) {
    const id      = Number(card.dataset.id);
    const product = allProducts.find((p) => p.id === id);
    if (product) openProductDetailModal(product);
  }
}

// ============================================================
// PRODUCT DETAIL MODAL
// ============================================================

/**
 * Populates and opens the product detail modal.
 * Includes quantity selector and Add to Cart button.
 * @param {Object} product
 */
function openProductDetailModal(product) {
  const { id, title, price, image, category, description, rating } = product;
  let qty = 1;

  modalBody.innerHTML = `
    <div class="modal-inner">
      <div class="modal-img-col">
        <img
          src="${image}"
          alt="${title}"
          onerror="this.src='https://via.placeholder.com/260x260?text=No+Image'"
        />
      </div>
      <div class="modal-info-col">
        <p class="modal-category"><i class="fas fa-tag"></i> ${category}</p>
        <h2 class="modal-title" id="modalTitle">${title}</h2>
        <p class="modal-desc">${description}</p>
        <p class="modal-price">$${price.toFixed(2)}</p>
        <div class="modal-rating">
          <span class="stars">${buildStarIcons(rating.rate)}</span>
          <span>${rating.rate} stars · ${rating.count} reviews</span>
        </div>
        <div class="modal-qty">
          <label>Qty:</label>
          <div class="modal-qty-controls">
            <button class="modal-qty-btn" id="modalQtyDec" aria-label="Decrease quantity">−</button>
            <span class="modal-qty-num" id="modalQtyNum">1</span>
            <button class="modal-qty-btn" id="modalQtyInc" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="btn-primary" id="modalAddCart" style="width:100%;justify-content:center;margin-top:4px;">
          <i class="fas fa-cart-plus"></i> Add to Cart
        </button>
      </div>
    </div>
  `;

  openProductModal();

  // Quantity controls
  document.getElementById('modalQtyDec').addEventListener('click', () => {
    qty = Math.max(1, qty - 1);
    document.getElementById('modalQtyNum').textContent = qty;
  });

  document.getElementById('modalQtyInc').addEventListener('click', () => {
    qty += 1;
    document.getElementById('modalQtyNum').textContent = qty;
  });

  document.getElementById('modalAddCart').addEventListener('click', () => {
    addToCart(product, qty);
    closeProductModal();
  });
}

// ============================================================
// ERROR STATE
// ============================================================

function showErrorState() {
  productGrid.innerHTML = '';
  errorState.classList.remove('hidden');
  emptyState.classList.add('hidden');
  productCount.textContent = '';
  loadMoreWrap.style.display = 'none';
}

// Initial wishlist badge on load
updateWishlistBadge();