# Backend preparation

This repository currently deploys as a static GitHub Pages site. The browser code stores catalogue edits, carts, order requests and wholesale enquiries in `localStorage`; those records are private to one browser and are not delivered to the shop. The admin page is not authenticated. **Do not use the current admin or order storage for real customer operations.**

## Recommended production architecture

- Keep the existing HTML/CSS/vanilla-JavaScript front end.
- Add a separate HTTPS API service (Node.js + Express is a straightforward fit) and a managed PostgreSQL database.
- Use server-side sessions in Secure, HttpOnly, SameSite cookies for admin authentication. Do not put admin credentials or privileged API keys in front-end JavaScript.
- Treat server records as the source of truth. Browser storage may be used only for a temporary cart or UI preferences.
- Send order and wholesale submissions to the API. Show a success confirmation only after the API confirms it has stored the request.
- Add email notifications to the shop after the API and mail provider are configured.
- Keep secrets in the hosting provider's environment variables, never in this repository.

## Migration sequence

1. Choose the API host and PostgreSQL provider.
2. Implement the endpoints and data model in [api-contract.md](./api-contract.md).
3. Add admin login, session handling, role checks and rate limiting.
4. Move product catalogue and stock to PostgreSQL; add product image uploads to object storage.
5. Persist orders and wholesale enquiries through the API, then notify the shop by email.
6. Replace the current localStorage reads/writes in `app.js` with an API client. Keep a clearly labelled local preview mode only for development.
7. Test mobile, checkout, admin permissions, validation, duplicate submissions, backups and restore before launch.

## Deployment note

GitHub Pages can continue serving the static front end, but it cannot run the API or PostgreSQL. The API and database must be deployed separately. Configure the front-end API base URL per environment and enable CORS only for the real website origin.

See [api-contract.md](./api-contract.md) for the proposed request/response contract.
