// ============================================================
// ui.js — Modal, Drawer, Dark Mode, Toast, Hamburger helpers
// ============================================================

// ---- Element references ----
const themeToggle          = document.getElementById('themeToggle');
const cartBtn              = document.getElementById('cartBtn');
const cartDrawer           = document.getElementById('cartDrawer');
const drawerOverlay        = document.getElementById('drawerOverlay');
const drawerClose          = document.getElementById('drawerClose');
const productModalOverlay  = document.getElementById('productModalOverlay');
const modalClose           = document.getElementById('modalClose');
const checkoutModalOverlay = document.getElementById('checkoutModalOverlay');
const checkoutModalClose   = document.getElementById('checkoutModalClose');
const wishlistModalOverlay = document.getElementById('wishlistModalOverlay');
const wishlistModalClose   = document.getElementById('wishlistModalClose');
const compareModalOverlay  = document.getElementById('compareModalOverlay');
const compareModalClose    = document.getElementById('compareModalClose');
const hamburger            = document.getElementById('hamburger');
const nav                  = document.getElementById('nav');
const toastContainer       = document.getElementById('toastContainer');

// ============================================================
// DARK / LIGHT MODE
// ============================================================

/**
 * Applies saved theme immediately on script load — before page paint —
 * so there is no flash of the wrong theme.
 */
(function applyInitialTheme() {
  // Briefly hide body until theme is applied to avoid flash
  document.body.classList.add('theme-loading');
  const savedTheme = localStorage.getItem('shopvault-theme');
  if (savedTheme === 'dark') document.body.classList.add('dark');
  // Remove the loading class after a tiny delay so CSS transitions don't fire on load
  requestAnimationFrame(() => {
    document.body.classList.remove('theme-loading');
  });
})();

function updateThemeIcon() {
  const isDark = document.body.classList.contains('dark');
  themeToggle.innerHTML = isDark
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
  themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('shopvault-theme', theme);
  updateThemeIcon();
}

themeToggle.addEventListener('click', toggleTheme);
// Set correct icon on initial load
updateThemeIcon();

// ============================================================
// CART DRAWER
// ============================================================

function openCartDrawer() {
  cartDrawer.classList.add('open');
  drawerOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  cartDrawer.classList.remove('open');
  drawerOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCartDrawer);
drawerClose.addEventListener('click', closeCartDrawer);
drawerOverlay.addEventListener('click', closeCartDrawer);

// ============================================================
// PRODUCT MODAL
// ============================================================

function openProductModal() {
  productModalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  productModalOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeProductModal);
productModalOverlay.addEventListener('click', (e) => {
  // Close only when clicking the overlay backdrop, not the modal itself
  if (e.target === productModalOverlay) closeProductModal();
});

// ============================================================
// CHECKOUT MODAL
// ============================================================

function openCheckoutModal() {
  checkoutModalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
  checkoutModalOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

checkoutModalClose.addEventListener('click', closeCheckoutModal);
checkoutModalOverlay.addEventListener('click', (e) => {
  if (e.target === checkoutModalOverlay) closeCheckoutModal();
});

// ============================================================
// WISHLIST MODAL
// ============================================================

function openWishlistModal() {
  wishlistModalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeWishlistModal() {
  wishlistModalOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

wishlistModalClose.addEventListener('click', closeWishlistModal);
wishlistModalOverlay.addEventListener('click', (e) => {
  if (e.target === wishlistModalOverlay) closeWishlistModal();
});

// ============================================================
// COMPARE MODAL
// ============================================================

function openCompareModal() {
  compareModalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCompareModal() {
  compareModalOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

compareModalClose.addEventListener('click', closeCompareModal);
compareModalOverlay.addEventListener('click', (e) => {
  if (e.target === compareModalOverlay) closeCompareModal();
});

// ============================================================
// ESCAPE KEY — closes whichever modal/drawer is open
// ============================================================

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!productModalOverlay.classList.contains('hidden'))  closeProductModal();
  if (!checkoutModalOverlay.classList.contains('hidden')) closeCheckoutModal();
  if (!wishlistModalOverlay.classList.contains('hidden')) closeWishlistModal();
  if (!compareModalOverlay.classList.contains('hidden'))  closeCompareModal();
  if (cartDrawer.classList.contains('open'))              closeCartDrawer();
});

// ============================================================
// HAMBURGER MENU
// ============================================================

hamburger.addEventListener('click', () => {
  nav.classList.toggle('open');
  const isOpen = nav.classList.contains('open');
  hamburger.setAttribute('aria-expanded', isOpen);
  hamburger.innerHTML = isOpen
    ? '<i class="fas fa-xmark"></i>'
    : '<i class="fas fa-bars"></i>';
});

// Close hamburger nav when a link is clicked
nav.addEventListener('click', (e) => {
  if (e.target.closest('.nav-link')) {
    nav.classList.remove('open');
    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
  }
});

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

/**
 * Shows a brief toast message.
 * @param {string} message - Text to display
 * @param {'success'|'error'|''} type - Visual variant
 * @param {number} duration - How long to show (ms)
 */
function showToast(message, type = '', duration = 2500) {
  const toast = document.createElement('div');
  toast.className = `toast${type ? ' ' + type : ''}`;

  const iconMap = { success: 'fa-circle-check', error: 'fa-circle-xmark', '': 'fa-bell' };
  const icon = iconMap[type] || 'fa-bell';

  toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all .3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}