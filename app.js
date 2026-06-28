// ============================================================
// app.js — Main entry point for ShopVault
// Initialises the app: fetches products, sets up category buttons
// ============================================================

// Global products array — shared across all modules
let allProducts = [];

// DOM reference for retry button
const retryBtn = document.getElementById('retryBtn');

/**
 * Main initialisation function.
 * 1. Shows skeleton cards
 * 2. Fetches products from API
 * 3. Builds category buttons
 * 4. Renders products
 * On failure, shows error state with retry option.
 */
async function initApp() {
  // Show skeleton loading cards immediately
  showSkeletonCards(9);

  try {
    // Fetch products via api.js
    allProducts = await fetchAllProducts();

    // Build dynamic category filter buttons from API data
    buildCategoryButtons(allProducts);

    // Render all products (default view)
    renderProducts(allProducts);

  } catch (error) {
    // Show styled error state with retry button
    console.error('Failed to load products:', error);
    showErrorState();
  }
}

// Retry button re-runs the full init
retryBtn.addEventListener('click', initApp);

// Kick off the app on DOM ready
document.addEventListener('DOMContentLoaded', initApp);