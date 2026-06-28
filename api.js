// ============================================================
// api.js — All fetch / network logic for ShopVault
// ============================================================

const API_URL = 'https://fakestoreapi.com/products';

/**
 * Fetches all products from the Fake Store API.
 * Returns an array of product objects on success.
 * Throws an Error on network or HTTP failure so callers can catch it.
 */
async function fetchAllProducts() {
  const response = await fetch(API_URL);

  // Treat non-2xx status as an error
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}