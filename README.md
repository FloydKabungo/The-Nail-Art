# The Nail Art — Premium Storefront Redesign (HTML + CSS + JavaScript)

An independent, responsive **front-end prototype**, based on the original public store at https://www.thenailart.co.za/. It keeps the **original logo** uploaded for this project. It is **not** a production checkout, stock service or account system. The original website has not been changed.

## Open / test the website

- Extract the ZIP and open the `The-Nail-Art` folder in VS Code.
- Open `index.html` with VS Code **Live Server**, or double-click the file in a desktop browser.
- Navigate between pages using the header, shop categories, and product cards.
- Visit **Shop All → select Soft Gel Tips, The Nail Art UV Gel, or PET Spray Bottle** to test real option labels, prices and cart behaviour.

## Files

```
The-Nail-Art/
  index.html                 HTML entry point, header metadata, favicon setup
  css/styles.css             Responsive styling and product/cart/checkout layouts
  js/products.js             Public product snapshots, categories and options
  js/script.js               Navigation, shop pages and interactive functionality
  assets/branding/           The Nail Art's original logo, transparent edition, favicons
  assets/image-sources.json  Three original product-image URLs linked from the web
  README.md                  This document
```

## Included navigation and features

- Home; all **11 original shop categories**; All Products; New Arrivals; What's Hot; Clearance.
- Product cards, individual product detail pages, prices in ZAR, SKU and original-store product links when verified.
- **Required product variants**: genuine colour, shape/code, brush size, style and container size choices on the verified sample products.
- **Price modifiers** (for example, PET spray bottle sizes), **bulk-price tiers**, updated unit prices and line totals.
- Quantity +/- and direct quantity input; **Add to Bag**, **Add More Options**, and Checkout Preview on product pages.
- **Separate cart lines by variant**, increase/decrease/remove in cart, persistent demo cart in localStorage, estimate of R120 shipping and option to choose collection in the checkout preview.
- Save favourites, search products, category and max-price filtering, sorting and pagination, quick-add on products without required choices.
- FAQ, returns/terms, contact enquiry via email app, WhatsApp link, address, opening hours, account and order-tracking links to the original store.
- Original logo on every header/footer, mobile menu, browser favicon and mobile home-screen icon.

## Product content / images

This contains **38 curated example products**, including some publicly verified original product detail pages. The old store has a much larger product catalogue; an owner-approved **Ecwid or product CSV export** is required to migrate the complete catalogue with every photograph, every variant, live stock and all current prices.

Only **three verified original product-image URLs** were available to the earlier prototype. They are referenced over HTTPS, not embedded or AI-upscaled. Other products show deliberately labelled image placeholders rather than wrong or fabricated product photos. When an original image fails to load, the UI gracefully falls back to a placeholder.

Product prices/options reflect a **public snapshot around November 2026**, not a current stock feed. Bulk-pricing in this preview is calculated per distinct selected variant line, with option price modifiers applied on top. Production calculations must match the merchant's actual Ecwid pricing and discounts. Delivery is based on the original site's stated R120 FAQ flat rate, with possible remote delivery exceptions.

## IMPORTANT: not live commerce

These features need backend/merchant integration before this can replace the real website:

- Real checkout with bank transfer/payment gateway, order confirmation and processing.
- Real inventory, all product variants, delivery rate rules and live promotional discounts.
- User login/registration, password resets, real favourites synced across devices, order history and courier tracking.
- Secure storage/processing of customer contact/delivery data, email transactional notifications, privacy/POPIA compliance and legal review.

Checkout Preview **does not submit orders or capture payments**, and the customer-detail fields are not transmitted or saved. The WhatsApp button opens a prefilled product availability enquiry; it does not place an order. Customers wishing to buy must choose the items on the original store.

## Upload to your existing GitHub repository (PowerShell)

Repository: https://github.com/FloydKabungo/The-Nail-Art

Extract the ZIP, replace/update the project files in the existing local Git repository, then run in the repo root:

```powershell
git status
git add .
git commit -m "Add product variant selectors and full shop interactions"
git push origin main
```

If you have not cloned the repository yet, run `git clone https://github.com/FloydKabungo/The-Nail-Art.git`, copy the extracted **contents** of `The-Nail-Art` into the cloned `The-Nail-Art` folder, then execute the commands above from that folder. Do **not** put the entire folder inside another `The-Nail-Art` folder (keep `index.html` at the root). Do not force-push if there are conflicting changes.

## Original site references

- https://www.thenailart.co.za/online-store
- https://www.thenailart.co.za/faq
- https://www.thenailart.co.za/terms
- https://www.thenailart.co.za/contact
- https://www.thenailart.co.za/online-store/The-Nail-Art-UV-Gel-1-2-OZ-p428861904
- https://www.thenailart.co.za/online-store/Soft-Gel-Tips-1-12-p695641057
- https://www.thenailart.co.za/online-store/250ml-Spray-Bottle-p407697201
- https://www.thenailart.co.za/online-store/Sandalwood-Striping-Brush-p840335759

### Basic test results

Tested in headless Chromium, desktop and 390-pixel mobile widths. Verified required variant selection, price-changing options, variant cart separation, bulk pricing at 12 pieces, cart controls, checkout delivery/collection totals, catalogue filter/sort/pagination and mobile menu. No JavaScript page errors in the smoke test.
