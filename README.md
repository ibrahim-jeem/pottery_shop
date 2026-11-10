# Pottery Shop — Bangladesh

A responsive, multi-page storefront prototype for the Pottery Shop brand.

## Pages
- Home: editorial landing page, featured product preview and craft story.
- Shop: catalogue populated only from the 21 existing local product photographs in `img/pottery_shop_1.jpg` through `pottery_shop_21.jpg`.
- Our story: Bangladesh-inspired brand story and studio film.
- Wholesale: wholesale and custom-order enquiry form.
- Checkout: cart review, Bangladesh delivery details and payment preference selection.
- Studio workspace: local product editor, order-request list and wholesale enquiry list.

## Run locally
No build step is required. Open `index.html` or run `python -m http.server 8000` from the repository root.

## Important — current technical status
This is a **front-end MVP / prototype**, not yet a production full-stack commerce system.
- Cart, product edits, order requests and wholesale enquiries use browser localStorage. They are not shared across devices and do not reach the shop.
- The Studio Workspace has no authentication. It is not secure and must not be used with real customer data.
- Checkout records a preferred payment method only. It does not collect money or initiate a payment.
- bKash, Nagad, Rocket and card payments require a merchant account and a server-side integration through SSLCOMMERZ, aamarPay or another approved provider. Never put API secrets in browser JavaScript.
- Cash on delivery is a request only; the shop must confirm availability, delivery charge and final order details.
- The 21 local photographs are the supplied product-photo set. Draft product titles and descriptions are generic until the shop confirms exact names, dimensions, prices and stock.
- Editorial stock images are only for storytelling and are never used as shop inventory. See `img/REFERENCE-PHOTO-SOURCES.md`.
- No address or map is shown because a verified physical location has not been provided.

## Before launch
1. Choose a backend/database (for example Supabase or a custom API) for products, stock, customer enquiries and orders.
2. Add secure admin authentication, authorization, validation, rate limiting and server-side audit logs.
3. Configure server-side payment sessions and verified payment callbacks for bKash/Nagad/Rocket/cards through a merchant gateway.
4. Confirm product titles, descriptions, categories, dimensions, BDT prices, stock and shipping rules.
5. Add verified contact details, delivery/returns/privacy/terms policies and business address only after confirmation.
6. Replace temporary editorial images with owned or licensed assets as preferred; add the client's Google Flow pottery-making videos when ready.
7. Test mobile, accessibility, performance, checkout and real gateway sandbox flows before launch.

## Assets
- Product photography: `img/pottery_shop_1.jpg` to `img/pottery_shop_21.jpg`.
- Logo: `img/logo.jpg`.
- Existing studio video/audio: `img/STUDIO FILM.mp4`, `img/Artisan_Hands.mp3`.
- Editorial image sources and license notes: `img/REFERENCE-PHOTO-SOURCES.md`.

## Deployment
The prototype can be deployed as a static site using GitHub Pages, Netlify or Vercel. A static deployment does not provide production order storage, authentication or payment processing; connect the backend before accepting real orders.