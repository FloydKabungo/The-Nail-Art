# The Nail Art — HTML + CSS + JavaScript redesign

This is a separate, clickable premium/minimal storefront redesign prototype for The Nail Art.
It is **not** connected to the real store's payments, inventory, customer logins, or orders.
The actual live site is not changed.

## Open it

1. Download and extract the ZIP.
2. Open `index.html` in Chrome, Edge, or Firefox.
3. Use the navigation to browse the pages, categories, sample product details, cart, FAQ, account, contact, etc.

## Edit it

- **`index.html`** — website entry point; loads the CSS and JavaScript.
- **`css/styles.css`** — fonts, premium blush / ivory theme, cards, layout, spacing, mobile styles.
- **`js/script.js`** — navigation, page templates, sample products, category filters, favourites, cart, form handling.
- **`assets/image-sources.json`** — three verified image URLs from the original store, linked externally.
- **`upscale_images.py`** — optional script to download and 2× enlarge those images locally when connected to the internet. It needs Python, Pillow, and requests.

The website uses **JavaScript**, which is what browsers run for interactivity, not the separate programming language **Java**.

## Page routes

Home, Shop All, New Arrivals, What's Hot, Clearance, 11 product categories,
Product Details, Cart, Checkout Preview, Favourites, My Account,
Track Orders, FAQ, Contact, Terms & Conditions.

## Important limitations

- Images: only three verifiable original store product photos are linked. Most other entries have clean placeholders.
- Photos were not genuinely AI-upscaled. The optional Python script uses 2× resizing + mild sharpening; it cannot invent missing detail.
- Catalogue prices and names are illustrative, may be outdated, and are not live-linked.
- Shopping bag and saved items work only in this browser via localStorage.
- Checkout, account authentication and tracking are demonstration screens, not real services.
- Confirm image permissions, prices, product data, legal terms and contact details with the store owner before launch.
