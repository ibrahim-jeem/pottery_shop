# Proposed API contract (not implemented)

Base path: `/api/v1`. All endpoints use HTTPS and JSON unless noted. This is an implementation contract for the upcoming backend; no API server is included in this static repository yet.

## Public endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/products` | Return published products and public prices/availability |
| GET | `/products/:id` | Return one published product |
| POST | `/orders` | Validate and create an order request |
| POST | `/wholesale-enquiries` | Validate and store a wholesale enquiry |

Order creation must calculate prices and totals on the server from current product records. Never trust a client-supplied total or price. Return an order reference only after the database transaction commits. Use an idempotency key to prevent accidental duplicate submissions.

## Admin endpoints (authenticated)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/admin/session` | Sign in and establish a secure session |
| DELETE | `/admin/session` | Sign out |
| GET | `/admin/orders` | List orders with pagination and filters |
| PATCH | `/admin/orders/:id` | Update order status or internal notes |
| DELETE | `/admin/orders/:id` | Soft-delete/archive an order; retain an audit record |
| GET | `/admin/wholesale-enquiries` | List wholesale enquiries |
| PATCH | `/admin/wholesale-enquiries/:id` | Update enquiry status/internal notes |
| DELETE | `/admin/wholesale-enquiries/:id` | Archive an enquiry |
| POST | `/admin/products` | Create a product |
| PATCH | `/admin/products/:id` | Update product details, price, stock, offer price and best-seller flag |
| DELETE | `/admin/products/:id` | Archive a product |

Deleting an order in the production system should default to an archive/soft-delete operation, not irreversible row deletion. Keep an audit trail recording who changed it and when.

## Initial relational model

- `admin_users`: id, email (unique), password_hash, role, is_active, created_at, last_login_at
- `products`: id, slug (unique), name, category, description, image_url, price_bdt, offer_price_bdt, stock_quantity, is_published, is_best_seller, created_at, updated_at, archived_at
- `orders`: id, public_reference (unique), customer_name, email, phone, delivery_address, customer_note, subtotal_bdt, delivery_fee_bdt, total_bdt, payment_method, payment_status, order_status, created_at, updated_at, archived_at
- `order_items`: id, order_id (foreign key), product_id (nullable foreign key), product_name_snapshot, unit_price_bdt_snapshot, quantity, line_total_bdt
- `wholesale_enquiries`: id, public_reference (unique), name, business, email, phone, request_type, estimated_quantity, message, enquiry_status, created_at, updated_at, archived_at
- `admin_audit_log`: id, admin_user_id, action, entity_type, entity_id, metadata_json, created_at

Use integer minor units (poisha) or a fixed-precision numeric type for money; never floating-point arithmetic for authoritative totals. Keep product-name and price snapshots on order items so later catalogue edits do not rewrite order history.

## Security and operational requirements

- Passwords hashed with Argon2id or bcrypt; never store plaintext passwords.
- Secure, HttpOnly, SameSite session cookies; CSRF protection for cookie-authenticated mutations.
- Server-side authorization on every admin endpoint; hiding admin UI is not access control.
- Validate and normalize all inputs on the server; enforce Bangladesh phone validation as a usability check, not the only security check.
- Rate-limit login and public submission endpoints; add bot protection if abuse appears.
- Use parameterized SQL, output encoding, secure upload validation and size limits.
- Restrict CORS to the production front-end origin; use HTTPS everywhere.
- Keep secrets in environment variables; rotate credentials and restrict database network access.
- Automated database backups, restore tests, monitoring and error logging without exposing customer data.
- Define retention and privacy policy for customer/order data.

## Current status

This file describes the target architecture only. The current site still uses browser-local storage; no orders or enquiries are transmitted to the shop until the API is implemented and connected.
