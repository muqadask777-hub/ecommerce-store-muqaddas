// ============================================================
// cart.js — All shopping cart logic for ShopVault
// ============================================================

const CART_KEY = 'shopvault-cart';

// ---- DOM references ----
const cartItemsEl   = document.getElementById('cartItems');
const drawerFooter  = document.getElementById('drawerFooter');
const cartBadge     = document.getElementById('cartBadge');

// ============================================================
// CART STATE — loaded from localStorage on startup
// ============================================================

/**
 * Loads the cart array from localStorage.
 * Returns an empty array if nothing is stored.
 * @returns {Array<{id, title, price, image, quantity}>}
 */
function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Persists the current cart array to localStorage.
 * @param {Array} cart
 */
function saveCartToStorage(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// In-memory cart — initialised from localStorage
let cart = loadCartFromStorage();

// ============================================================
// CART BADGE
// ============================================================

/**
 * Updates the cart count badge in the header.
 * Badge is hidden when cart is empty.
 */
function updateCartBadge() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalItems;
  if (totalItems > 0) {
    cartBadge.classList.remove('hidden');
    // Quick scale-bounce animation
    cartBadge.style.transform = 'scale(1.4)';
    setTimeout(() => { cartBadge.style.transform = 'scale(1)'; }, 200);
  } else {
    cartBadge.classList.add('hidden');
  }
}

// ============================================================
// ADD TO CART
// ============================================================

/**
 * Adds a product to the cart or increments its quantity.
 * @param {{id, title, price, image}} product
 * @param {number} quantity - How many to add (default 1)
 */
function addToCart(product, quantity = 1) {
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id:       product.id,
      title:    product.title,
      price:    product.price,
      image:    product.image,
      quantity,
    });
  }

  saveCartToStorage(cart);
  updateCartBadge();
  renderCartDrawer();
  showToast(`"${product.title.slice(0, 30)}…" added to cart`, 'success');
}

// ============================================================
// REMOVE FROM CART
// ============================================================

/**
 * Removes a cart item entirely by product id.
 * @param {number} productId
 */
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCartToStorage(cart);
  updateCartBadge();
  renderCartDrawer();
}

// ============================================================
// UPDATE QUANTITY
// ============================================================

/**
 * Sets the quantity of a cart item.
 * Enforces minimum quantity of 1.
 * @param {number} productId
 * @param {number} newQuantity
 */
function updateQuantity(productId, newQuantity) {
  const item = cart.find((i) => i.id === productId);
  if (!item) return;

  // Minimum is 1 — minus button at qty 1 does NOT remove the item
  item.quantity = Math.max(1, newQuantity);
  saveCartToStorage(cart);
  updateCartBadge();
  renderCartDrawer();
}

// ============================================================
// SUBTOTAL
// ============================================================

/**
 * Calculates the cart subtotal.
 * @returns {number}
 */
function getSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// ============================================================
// RENDER CART DRAWER
// ============================================================

/**
 * Builds and injects the cart drawer HTML.
 * Shows empty state if cart has no items.
 */
function renderCartDrawer() {
  if (cart.length === 0) {
    renderEmptyCart();
    return;
  }

  const itemsHTML = cart.map((item) => buildCartItemHTML(item)).join('');

  cartItemsEl.innerHTML = itemsHTML;
  drawerFooter.innerHTML = buildCartFooterHTML();

  attachCartItemListeners();
  attachCheckoutListener();
}

/**
 * Builds the HTML string for one cart item row.
 */
function buildCartItemHTML(item) {
  return `
    <div class="cart-item" data-id="${item.id}">
      <img
        class="cart-item-img"
        src="${item.image}"
        alt="${item.title}"
        onerror="this.src='https://via.placeholder.com/64x64?text=No+Image'"
      />
      <div class="cart-item-info">
        <p class="cart-item-title">${item.title}</p>
        <p class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
      </div>
      <div class="cart-item-controls">
        <div class="qty-btns">
          <button class="qty-btn qty-decrease" data-id="${item.id}" aria-label="Decrease quantity">
            <i class="fas fa-minus"></i>
          </button>
          <span class="qty-num">${item.quantity}</span>
          <button class="qty-btn qty-increase" data-id="${item.id}" aria-label="Increase quantity">
            <i class="fas fa-plus"></i>
          </button>
        </div>
        <button class="remove-btn" data-id="${item.id}" aria-label="Remove item">
          <i class="fas fa-trash-can"></i> Remove
        </button>
      </div>
    </div>
  `;
}

/**
 * Builds the footer HTML with subtotal and checkout button.
 */
function buildCartFooterHTML() {
  return `
    <div class="cart-subtotal">
      <span>Subtotal</span>
      <span>$${getSubtotal().toFixed(2)}</span>
    </div>
    <button class="btn-primary" id="checkoutBtn" style="width:100%;justify-content:center;">
      <i class="fas fa-credit-card"></i> Checkout
    </button>
  `;
}

/**
 * Shows the empty cart UI.
 */
function renderEmptyCart() {
  cartItemsEl.innerHTML = `
    <div class="cart-empty">
      <i class="fas fa-cart-shopping"></i>
      <p>Your cart is empty</p>
      <button class="btn-primary" id="continueShoppingBtn">
        <i class="fas fa-arrow-left"></i> Continue Shopping
      </button>
    </div>
  `;
  drawerFooter.innerHTML = '';

  document.getElementById('continueShoppingBtn')?.addEventListener('click', closeCartDrawer);
}

// ============================================================
// EVENT LISTENERS — cart item buttons
// ============================================================

/**
 * Attaches delegated click handlers for qty and remove buttons.
 */
function attachCartItemListeners() {
  cartItemsEl.addEventListener('click', handleCartItemClick);
}

function handleCartItemClick(e) {
  const decreaseBtn = e.target.closest('.qty-decrease');
  const increaseBtn = e.target.closest('.qty-increase');
  const removeBtn   = e.target.closest('.remove-btn');

  if (decreaseBtn) {
    const id   = Number(decreaseBtn.dataset.id);
    const item = cart.find((i) => i.id === id);
    if (item) updateQuantity(id, item.quantity - 1);
  }

  if (increaseBtn) {
    const id   = Number(increaseBtn.dataset.id);
    const item = cart.find((i) => i.id === id);
    if (item) updateQuantity(id, item.quantity + 1);
  }

  if (removeBtn) {
    const id = Number(removeBtn.dataset.id);
    removeFromCart(id);
  }
}

// ============================================================
// CHECKOUT
// ============================================================

function attachCheckoutListener() {
  document.getElementById('checkoutBtn')?.addEventListener('click', handleCheckout);
}

/**
 * Opens the checkout confirmation modal with order summary.
 * Clears the cart after confirming.
 */
function handleCheckout() {
  const checkoutBody = document.getElementById('checkoutModalBody');

  const itemsHTML = cart
    .map(
      (item) => `
      <div class="checkout-item">
        <span>${item.title.slice(0, 40)}… × ${item.quantity}</span>
        <span>$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `
    )
    .join('');

  checkoutBody.innerHTML = `
    <h2 class="checkout-title">
      <i class="fas fa-bag-shopping"></i> Order Summary
    </h2>
    <div class="checkout-items">${itemsHTML}</div>
    <div class="checkout-total">
      <span>Total</span>
      <span>$${getSubtotal().toFixed(2)}</span>
    </div>
    <button class="btn-primary" id="confirmOrderBtn" style="width:100%;justify-content:center;">
      <i class="fas fa-check"></i> Confirm & Place Order
    </button>
  `;

  openCheckoutModal();

  document.getElementById('confirmOrderBtn').addEventListener('click', confirmOrder);
}

function confirmOrder() {
  const checkoutBody = document.getElementById('checkoutModalBody');

  // Clear cart
  cart = [];
  saveCartToStorage(cart);
  updateCartBadge();
  renderCartDrawer();

  // Show success message inside the modal
  checkoutBody.innerHTML = `
    <div class="checkout-success">
      <i class="fas fa-circle-check"></i>
      <h3>Order Placed!</h3>
      <p>Thank you for your purchase. Your items will be delivered soon.</p>
      <button class="btn-primary" id="closeOrderSuccess" style="margin-top:12px;">
        <i class="fas fa-home"></i> Continue Shopping
      </button>
    </div>
  `;

  document.getElementById('closeOrderSuccess').addEventListener('click', () => {
    closeCheckoutModal();
    closeCartDrawer();
  });
}

// Expose for other modules
// (using global scope since no module bundler is used)

// Initial render & badge update on page load
updateCartBadge();
renderCartDrawer();
