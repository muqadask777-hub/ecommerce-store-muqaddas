# ShopVault — E-Commerce Product Store

A fully functional e-commerce product store built with pure **HTML, CSS, and vanilla JavaScript** — no frameworks, no libraries. Products are fetched live from the [Fake Store API](https://fakestoreapi.com/products).

---

## 🔗 Links

- **Live Demo:** [Add your GitHub Pages / Netlify / Vercel link here]
- **GitHub Repository:** [https://github.com/muqadask777-hub/ecommerce-store-muqaddas]
- **Video Walkthrough:** [https://www.veed.io/view/66eb7a28-29f3-4d7b-a241-a6267fcde99d?source=editor&panel=share]

---

## ✨ Features

### Core (Section A)
- Live product fetch from `fakestoreapi.com` using `fetch()` + `async/await`
- Skeleton shimmer loading cards while products load
- Error state with **Try Again** button on API failure
- Responsive product grid: 3 columns (desktop) → 2 (tablet) → 1 (mobile)
- Product cards with: image, category badge, 2-line truncated title, star icons, price, Add to Cart button
- Live product count that updates with filters

### Filter + Search + Sort (Section B)
- Real-time search (debounced 300ms) — case-insensitive
- Dynamic category filter buttons generated from API data (no hardcoded names)
- Sort: Price Low→High, Price High→Low, Rating Best First, Name A→Z
- All three work **simultaneously** without breaking each other
- Clear All Filters button resets everything in one click
- Styled "No products found" empty state

### Product Detail Modal (Section C)
- Full product info: image, title, description, category, price, star rating + reviews count
- Quantity selector (+ / −), minimum 1
- Add to Cart adds the chosen quantity
- Closes via X button, clicking outside overlay, or **Escape key**

### Shopping Cart (Section D)
- Cart icon with live item count badge (hidden when empty)
- Slide-in cart drawer from right
- Per-item: image, truncated title, unit price, quantity controls (+/−), separate Remove button
- Minus at qty 1 does NOT delete — stays at 1
- Dynamic subtotal
- Empty cart message + Continue Shopping button
- Checkout modal with full order summary → clears cart after confirm

### LocalStorage Persistence (Section E)
- Cart items + quantities survive page refresh
- Cart badge shows correct count immediately on load
- Dark/light mode preference restored on load

### Dark / Light Mode (Section F)
- Toggle button in header (moon ↔ sun icon)
- Saved to localStorage
- **No flash of wrong theme** on load (theme applied before first paint)

### Responsive Design (Section G)
- Fully responsive from 320px mobile to 1280px+ desktop
- Hamburger menu on mobile
- Cart drawer goes full width on mobile
- All modals scrollable and non-clipping on small screens

### Bonus Features
-  **Wishlist** — heart icon on cards, saved to localStorage, view in Wishlist modal
-  **Load More** — shows 8 products at a time, Load More reveals next batch
-  **Product Comparison** — select 2–3 products and compare specs side by side
-  **Debounced Search** — custom closure-based debounce, no library used
-  **Smooth Animations** — fade+slide-up on card load, modal scale entrance, drawer slide

---

## 🖥 Screenshots

> Add at least 3 screenshots here:
> 1. Desktop product grid
> 2. Mobile view
> 3. Cart drawer open

---

## 🛠 Technologies Used

- HTML5 (semantic elements)
- CSS3 (custom properties, grid, flexbox, animations)
- Vanilla JavaScript (ES6+: `const`/`let`, `async/await`, array methods, template literals, closures)
- [Fake Store API](https://fakestoreapi.com)
- Google Fonts (Inter, Playfair Display)
- Font Awesome 6 (icons)

---

##  How to Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/ecommerce-store-your-name.git

# 2. Navigate into the folder
cd ecommerce-store-your-name

# 3. Open index.html in your browser
# Option A — Double-click index.html
# Option B — Use VS Code Live Server extension (recommended)
# Option C — Run a simple HTTP server
npx serve .
```

No build step, no npm install needed. The project runs entirely in the browser.

---

##  What I Learned

Building this project taught me how to manage state across multiple JavaScript modules without a framework. The trickiest part was making search, category filter, and sort all work simultaneously — I solved this by keeping a single `applyFiltersAndRender()` function that always reads the latest state of all three filters and re-applies them together. I also learned how closures work in practice by writing my own debounce function. Handling localStorage carefully — especially preventing the flash of wrong theme on dark mode — was another important lesson in timing and browser paint cycles.

---

##  File Structure

```
ecommerce-store/
├── index.html
├── css/
│   ├── style.css        ← Main styles
│   ├── dark-mode.css    ← Dark theme overrides
│   └── skeleton.css     ← Skeleton loading animation
├── js/
│   ├── app.js           ← Main entry point
│   ├── api.js           ← All fetch logic
│   ├── products.js      ← Product rendering, modal, wishlist, compare
│   ├── cart.js          ← All cart logic
│   ├── filters.js       ← Search / filter / sort logic
│   └── ui.js            ← Modal, drawer, dark mode, toast
└── README.md
```
