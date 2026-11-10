# Pottery Shop — Bangladesh

A lightweight, responsive multi-page storefront built around the supplied product photographs in `/img`.

## Pages
- Home — editorial landing page, collection preview and studio story.
- Shop — catalogue using only the 21 supplied local product images.
- Our story — Bangladesh-inspired brand storytelling and video placeholder for your Google Flow clips.
- Wholesale — enquiry form.
- Checkout — local demo order request flow.
- Admin — local demo product editor, order list and wholesale enquiry list.

## Run locally
No build step is required. Open `index.html` directly, or serve this folder with any static web server (for example `python -m http.server 8000`).

## Before launch — important
This repository version is a front-end MVP. Forms, cart, orders and admin edits use browser localStorage and are visible only in the current browser/device. The admin page has no authentication and is not secure. Do not use it for real customer data yet.

To launch commercially:
1. Connect a backend/database (e.g. Supabase or a custom API) for products, stock, customers, enquiries and orders.
2. Add authenticated admin access with role-based permissions.
3. Integrate SSLCOMMERZ or aamarPay server-side for bKash, Nagad, Rocket and card payments. Never put gateway secrets in browser code. Keep COD as a backend-confirmed option.
4. Replace draft product names/descriptions and set real BDT prices, stock and delivery rules in the admin workflow. The initial catalogue uses generic editable names because product details and prices were not supplied.
5. Add your Google Flow studio videos to the Story page and replace the temporary editorial images with licensed/owned images if desired.
6. Add the actual business contact details, delivery policy, return policy, privacy policy and terms. No physical address or map is shown because a verified location has not been provided.

## Visual assets
- Shop catalogue: `img/pottery_shop_1.jpg` through `img/pottery_shop_21.jpg` (existing supplied images).
- Editorial images: temporary Unsplash image URLs. See `img/REFERENCE-PHOTO-SOURCES.md` for original source pages and licensing references.
- Slow-network loader: CSS pottery wheel and vase-forming animation. It appears only when the browser reports a slow connection or data-saving mode.

## Deploy
This is static-site compatible. Enable GitHub Pages for the `main` branch, root folder, or deploy the repository root to Netlify/Vercel. A production backend and payment integration are separate required launch steps.
