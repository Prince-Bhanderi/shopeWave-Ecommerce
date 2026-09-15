# ShopWave — Full-Stack E-Commerce Platform

A production-ready e-commerce web application built with React (Vite), Node.js/Express, and
MongoDB. It includes customer-facing shopping (catalog, cart, wishlist, checkout with Stripe,
Razorpay, or Cash on Delivery, order tracking, reviews) and a full admin dashboard (sales
analytics, product / category / order / user / coupon management).

This is a complete, runnable application — not a static mockup. Follow the steps below to install
dependencies, configure environment variables, set up MongoDB, seed demo data, and run both the
API server and the frontend locally.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Environment Variables](#environment-variables)
7. [MongoDB Setup](#mongodb-setup)
8. [Running the App](#running-the-app)
9. [Seeding Demo Data](#seeding-demo-data)
10. [Demo / Admin Credentials](#demo--admin-credentials)
11. [API Documentation](#api-documentation)
12. [Production Build](#production-build)
13. [Deployment](#deployment)
14. [Security Notes](#security-notes)
15. [Troubleshooting](#troubleshooting)

---

## Features

**Customer-facing**

- Email/password authentication with JWT (httpOnly cookie + Bearer header), persistent login,
  protected routes, forgot/reset password flow, and a profile page (info, password, saved
  addresses).
- Homepage with hero banner, shop-by-category, featured / latest / best-selling product rails,
  promo banner, customer testimonials, and a newsletter signup.
- Product catalog with keyword search, category/brand/price/rating filters, sorting, and
  pagination.
- Product details page with an image gallery, stock-aware add-to-cart, related products, and a
  reviews list.
- Shopping cart with quantity controls, live subtotal/discount/shipping/tax/total, coupon codes,
  and persistence — guests get a `localStorage`-backed cart that automatically merges into their
  account cart on login/register.
- Wishlist (requires an account) with move-to-cart support.
- 4-step checkout: contact info → shipping address → order review → payment (Cash on Delivery,
  Stripe card payment, or Razorpay — UPI/cards/netbanking/wallets), with server-side stock
  validation, stock decrement, cart clearing, and an order confirmation page.
- Order history ("My Orders") with order detail view and self-service cancellation while an order
  is still Pending/Processing.
- Product reviews restricted to customers who have purchased and received that product.

**Admin dashboard** (role-gated, `/admin/*`)

- Overview stats (revenue, orders, users, products) with sales-over-time, revenue, order-count,
  and product-performance charts.
- Product CRUD with image upload (drag-and-drop, multi-image).
- Category CRUD with image upload.
- Order management: view, update order/payment status, cancel.
- User management: search/filter, change role, block/unblock, delete — with safeguards so an
  admin cannot demote/block/delete their own account.
- Coupon CRUD (percentage or fixed-amount discounts, minimum purchase, expiration, usage limits).

**Engineering**

- Consistent `{ success, message, data }` / `{ success: false, message, errors }` API response
  envelope on every endpoint.
- Centralized Express error handling that normalizes Mongoose, JWT, Multer, and Stripe errors.
- Security hardening: bcrypt password hashing, JWT auth, role-based authorization, `helmet`,
  `cors` (credentialed, origin-locked to `CLIENT_URL`), `express-mongo-sanitize`, `xss-clean`,
  rate limiting (general + a stricter limiter on auth routes), centralized validation with
  `express-validator`, and no secrets committed to the repo.
- Cloudinary image uploads with an automatic local-disk (`/uploads`) fallback in development when
  Cloudinary credentials are not set.
- Stripe Payment Intents flow where the backend re-verifies the payment intent's status and amount
  server-side before an order is ever created — the client's confirmation is never trusted alone.
- Razorpay Orders flow with the same guarantee: the backend recomputes the HMAC-SHA256 payment
  signature and re-fetches the order from Razorpay's API to confirm it's paid and the amount
  matches, before an order is created.

---

## Tech Stack

**Frontend:** React 19, Vite, React Router, Redux Toolkit, Axios, React Hook Form + Zod, Tailwind
CSS v4, Recharts, Stripe.js/React Stripe Elements, Razorpay Checkout.js, react-hot-toast,
lucide-react.

**Backend:** Node.js, Express, MongoDB + Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, Multer +
Cloudinary, `express-validator`, `helmet`, `cors`, `express-rate-limit`, `express-mongo-sanitize`,
`xss-clean`, Stripe, Razorpay.

---

## Project Structure

```
ecommerce-app/
├── backend/
│   ├── src/
│   │   ├── config/          # db.js (Mongo connection), cloudinary.js
│   │   ├── controllers/     # route handlers (auth, products, cart, orders, admin, ...)
│   │   ├── middleware/      # auth, error handling, validation, upload, rate limiting
│   │   ├── models/          # Mongoose schemas: User, Product, Category, Cart, Order,
│   │   │                    #   Review, Coupon
│   │   ├── routes/          # Express routers, one per resource
│   │   ├── seed/            # seedData.js (fixtures) + seed.js (seed/destroy script)
│   │   ├── utils/           # ApiError, ApiResponse, JWT helpers, price calculations, email
│   │   ├── validators/      # express-validator rule sets per resource
│   │   ├── app.js           # Express app: middleware + route wiring
│   │   └── server.js        # Entry point: connects to Mongo, starts the HTTP server
│   ├── scripts/
│   │   └── smoke-test.mjs   # Wiring/route smoke test (see note below)
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/              # axiosClient + one service module per backend resource
│   │   ├── components/       # common/, layout/, product/, cart/, order/, admin/, auth/, ...
│   │   ├── hooks/             # useAuth, useCart, useWishlist, useProducts, useDebounce
│   │   ├── layouts/           # MainLayout, AdminLayout
│   │   ├── pages/             # route-level pages, including pages/admin/*
│   │   ├── redux/             # store.js + slices/ (auth, cart, wishlist, categories, ui)
│   │   ├── utils/              # formatters, storage (localStorage), price calc, Stripe/Razorpay helpers
│   │   ├── App.jsx            # route tree (code-split with React.lazy)
│   │   └── main.jsx           # app entry point
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## Prerequisites

- **Node.js 18.18+** (any 18.18–18.x, 20.9+, or 21.1+ and up — see note below) and npm.
- **Note on toolchain versions:** `frontend/package.json` pins exact versions of `vite`,
  `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, `eslint`, and `@eslint/js` (no `^`
  range) specifically so this project keeps running on Node 18. Newer majors of these tools
  (Vite 7+, Tailwind's `@tailwindcss/oxide` 4.2.0+, ESLint 10) require Node `20.19+`/`22.12+`/`20+`
  respectively and will fail at runtime with a cryptic `SyntaxError` (missing `node:util`'s
  `styleText` export) or refuse to load their native engine if upgraded past those pins. If you're
  on Node 20.19+ or 22.12+ already, you're free to bump those packages to their latest versions —
  just don't `npm update` them blindly on Node 18. Check your version with `node --version`.
- **MongoDB** — a local `mongod` instance, or a free [MongoDB Atlas](https://www.mongodb.com/atlas)
  cluster
- Optional, for full functionality: a free [Stripe](https://stripe.com) test account (card
  payments), a free [Razorpay](https://razorpay.com) test account (UPI/cards/netbanking/wallets —
  Razorpay accounts are INR by default, see the `RAZORPAY_CURRENCY` note in
  `paymentController.js`), and a [Cloudinary](https://cloudinary.com) account (hosted image
  uploads). The app runs without any of these — see [Environment Variables](#environment-variables).

---

## Installation

```bash
# 1. Clone the repository, then from the project root:

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```

---

## Environment Variables

Copy each `.env.example` to `.env` and fill in real values:

```bash
cd backend && cp .env.example .env
cd ../frontend && cp .env.example .env
```

### `backend/.env`

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | No (default `development`) | `development` or `production`. Controls logging verbosity and cookie `secure` flag. |
| `PORT` | No (default `5000`) | Port the API server listens on. |
| `MONGO_URI` | **Yes** | MongoDB connection string. Local example: `mongodb://127.0.0.1:27017/ecommerce`. Atlas example: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/ecommerce`. |
| `JWT_SECRET` | **Yes** | Long, random string used to sign JWTs. Never reuse a sample value in production. |
| `JWT_EXPIRES_IN` | No (default `7d`) | JWT expiry, e.g. `7d`, `1h`. |
| `JWT_COOKIE_EXPIRES_IN` | No (default `7`) | Days until the auth cookie expires. |
| `CLIENT_URL` | **Yes** | Frontend origin, used for CORS and password-reset email links, e.g. `http://localhost:5173`. |
| `STRIPE_SECRET_KEY` | No | Enables card payments. Leave blank to disable Stripe — Cash on Delivery still works. |
| `STRIPE_WEBHOOK_SECRET` | No | Required only if you wire up the `/api/payments/webhook` endpoint to a real Stripe webhook. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | No | Enables Razorpay payments (get test keys from [dashboard.razorpay.com/app/keys](https://dashboard.razorpay.com/app/keys)). Leave both blank to hide the Razorpay option — Cash on Delivery / Stripe still work. |
| `RAZORPAY_WEBHOOK_SECRET` | No | Required only if you wire up the `/api/payments/razorpay-webhook` endpoint to a real Razorpay webhook. |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | No | Enables hosted image uploads. Leave all three blank and uploads are written to `backend/uploads` and served from `/uploads` instead. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `EMAIL_FROM` | No | Used to email password-reset links. Leave blank in development — the reset link is printed to the server console instead of emailed. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | No (used by seed script) | Credentials for the admin account created by `npm run seed`. |

### `frontend/.env`

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | **Yes** | Base URL of the backend API, including `/api`, e.g. `http://localhost:5000/api`. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key. Leave blank to hide the card-payment option at checkout (Cash on Delivery remains available). |
| `VITE_RAZORPAY_KEY_ID` | No | Razorpay key id (same value as the backend's `RAZORPAY_KEY_ID` — it's a public identifier, safe to expose). Leave blank to hide the Razorpay option at checkout. |

---

## MongoDB Setup

**Option A — Local MongoDB**

1. Install MongoDB Community Server for your OS ([instructions](https://www.mongodb.com/docs/manual/installation/)).
2. Start it: `mongod` (or via your OS service manager / `brew services start mongodb-community`).
3. Use `MONGO_URI=mongodb://127.0.0.1:27017/ecommerce` in `backend/.env`.

**Option B — MongoDB Atlas (free tier, no local install)**

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Under **Database Access**, create a database user with a username/password.
3. Under **Network Access**, allow your current IP (or `0.0.0.0/0` for development only).
4. Copy the connection string from **Connect → Drivers**, substitute your username/password, and
   set it as `MONGO_URI` in `backend/.env`. Add a database name at the end of the path, e.g.
   `.../ecommerce?retryWrites=true&w=majority`.

Mongoose creates collections and indexes automatically on first connection — no manual schema
setup is required.

---

## Running the App

Run the backend and frontend in two separate terminals.

**Terminal 1 — API server**

```bash
cd backend
npm run dev        # starts on http://localhost:5000 with nodemon auto-reload
```

**Terminal 2 — Frontend**

```bash
cd frontend
npm run dev         # starts on http://localhost:5173
```

Visit `http://localhost:5173`. The frontend proxies API calls to whatever `VITE_API_URL` points
to, so the backend must be running for the app to load data.

---

## Seeding Demo Data

With `backend/.env` configured and MongoDB reachable:

```bash
cd backend
npm run seed             # populates categories, products, users, orders, reviews, coupons
npm run seed:destroy     # wipes those collections clean
```

The seed script creates:

- 1 admin account and 2 demo customer accounts (see [credentials](#demo--admin-credentials))
- 8 product categories
- 24 products across 10 brands, with images, stock, ratings, and a mix of featured/on-sale items
- A handful of past orders (varying statuses) for the demo customers
- Reviews generated from delivered/shipped orders
- 3 sample coupon codes: `WELCOME10` (10% off), `FLAT20` ($20 off orders $100+), `SAVE15` (15%
  off orders $50+)

Re-running `npm run seed` clears and re-populates these collections, so it's safe to run again if
your data gets into a weird state during testing.

---

## Demo / Admin Credentials

> **Development only.** These are seed-script defaults for local testing and demoing the app.
> Never ship these credentials to a production deployment — set your own `ADMIN_EMAIL` /
> `ADMIN_PASSWORD` in `backend/.env` before seeding a production database, and delete or
> re-password any demo accounts before going live.

| Role | Email | Password | Name |
|---|---|---|---|
| Admin | `admin@shopwave.dev` | `Admin@12345` | ShopWave Admin |
| Customer | `demo@shopwave.dev` | `Demo@12345` | John Doe |
| Customer | `jane@shopwave.dev` | `Jane@12345` | Jane Smith |

Log in at `/login` with the admin account and visit `/admin` for the dashboard.

---

## API Documentation

Base URL: `{VITE_API_URL}` (e.g. `http://localhost:5000/api`). All responses follow:

```jsonc
// success
{ "success": true, "message": "...", "data": { /* ... */ }, "meta": { /* pagination, optional */ } }

// error
{ "success": false, "message": "...", "errors": [ /* validation details, optional */ ] }
```

Authenticated requests may use either an httpOnly cookie (set automatically on login/register) or
an `Authorization: Bearer <token>` header.

`GET /api/health` — service liveness check (no auth).

### Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Create an account |
| POST | `/login` | Public | Log in, returns/sets JWT |
| POST | `/logout` | Private | Clear auth cookie |
| GET | `/me` | Private | Current user profile |
| PUT | `/profile` | Private | Update name/phone/avatar |
| PUT | `/change-password` | Private | Change password |
| POST | `/forgot-password` | Public | Send/generate password reset token |
| POST | `/reset-password/:token` | Public | Set a new password |

### Products — `/api/products`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List products — query params: `keyword`, `category`, `brand`, `minPrice`, `maxPrice`, `rating`, `sort` (`newest`\|`price-asc`\|`price-desc`\|`rating`\|`popular`\|`name-asc`), `featured`, `inStock`, `page`, `limit` |
| POST | `/` | Admin | Create a product |
| GET | `/:id` | Public | Product detail |
| PUT | `/:id` | Admin | Update a product |
| DELETE | `/:id` | Admin | Delete a product |
| PATCH | `/:id/stock` | Admin | Adjust stock directly |
| GET | `/:productId/reviews` | Public | Reviews for a product |
| POST | `/:productId/reviews` | Private | Add a review (must have a delivered order containing this product) |

### Categories — `/api/categories`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List categories |
| POST | `/` | Admin | Create a category |
| GET | `/:id` | Public | Category detail |
| PUT | `/:id` | Admin | Update a category |
| DELETE | `/:id` | Admin | Delete a category (blocked if it still has products) |
| GET | `/:id/products` | Public | Products in a category |

### Cart — `/api/cart` (all Private)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get current user's cart |
| POST | `/` | Add an item (`{ productId, quantity }`) |
| DELETE | `/` | Clear the cart |
| PUT | `/:itemId` | Update an item's quantity |
| DELETE | `/:itemId` | Remove an item |
| POST | `/apply-coupon` | Apply a coupon code |
| DELETE | `/coupon` | Remove the applied coupon |

### Wishlist — `/api/wishlist` (all Private)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get wishlist |
| POST | `/:productId` | Add a product |
| DELETE | `/:productId` | Remove a product |
| POST | `/:productId/move-to-cart` | Move an item to the cart |

### Orders — `/api/orders` (all Private)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create an order (validates stock, computes totals, decrements stock, clears cart) |
| GET | `/my-orders` | Current user's order history |
| GET | `/:id` | Order detail |
| PUT | `/:id/cancel` | Cancel an order (only while Pending/Processing) |

### Reviews — `/api/reviews`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/recent` | Public | Recent reviews across all products (homepage testimonials) |
| PUT | `/:id` | Private | Update your own review |
| DELETE | `/:id` | Private | Delete your own review |

### Coupons — `/api/coupons`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/check/:code` | Private | Validate a coupon code without applying it |
| GET | `/` | Admin | List all coupons |
| POST | `/` | Admin | Create a coupon |
| PUT | `/:id` | Admin | Update a coupon |
| DELETE | `/:id` | Admin | Delete a coupon |

### Payments — `/api/payments`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/create-payment-intent` | Private | Create a Stripe Payment Intent for the current cart total |
| POST | `/webhook` | Stripe only | Stripe webhook receiver (raw body, signature-verified) |
| POST | `/razorpay/create-order` | Private | Create a Razorpay Order for the current cart total |
| POST | `/razorpay-webhook` | Razorpay only | Razorpay webhook receiver (raw body, signature-verified) |

### Upload — `/api/upload` (Admin)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Upload up to 10 images (`multipart/form-data`, field `images`) |
| DELETE | `/` | Delete an uploaded image (`{ publicId }` in body) |

### Admin — `/api/admin` (Admin only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Aggregated stats: revenue, order counts, user counts, chart series |
| GET | `/orders` | List/search/filter all orders |
| GET | `/orders/:id` | Order detail (admin view) |
| PUT | `/orders/:id/status` | Update order status |
| PUT | `/orders/:id/payment-status` | Update payment status |
| PUT | `/orders/:id/cancel` | Cancel any order |
| GET | `/users` | List/search/filter users |
| GET | `/users/:id` | User detail |
| PUT | `/users/:id/role` | Change a user's role |
| PUT | `/users/:id/block` | Block/unblock a user |
| DELETE | `/users/:id` | Delete a user |
| GET | `/products` | List products (admin view) |

---

## Production Build

**Frontend**

```bash
cd frontend
npm run build       # outputs static assets to frontend/dist
npm run preview     # optional: serve the production build locally to sanity-check it
```

`frontend/dist` is a static bundle — deploy it to any static host (Vercel, Netlify, S3 +
CloudFront, Nginx, etc.).

**Backend**

The backend runs directly on Node — there is no separate build step.

```bash
cd backend
NODE_ENV=production npm start
```

---

## Deployment

**Backend (Render / Railway / Fly.io / a VPS)**

1. Provision the service from the `backend/` directory (start command: `npm start`; Node 18+).
2. Set all required environment variables from the table above directly in the platform's
   dashboard — never commit a real `.env` file.
3. Set `MONGO_URI` to your Atlas (or managed Mongo) connection string.
4. Set `CLIENT_URL` to your deployed frontend's exact origin (needed for CORS and for
   password-reset email links to point at the right place).
5. If you're behind a platform load balancer/proxy (Render, Railway, Heroku-style), that's already
   accounted for — `app.set('trust proxy', 1)` is set so secure cookies and rate limiting see the
   real client IP.
6. If using Stripe, add the deployed webhook URL (`https://your-api-domain/api/payments/webhook`)
   in the Stripe dashboard and set `STRIPE_WEBHOOK_SECRET` to the signing secret it gives you.
7. If using Razorpay, add the deployed webhook URL
   (`https://your-api-domain/api/payments/razorpay-webhook`) in the Razorpay dashboard (Settings →
   Webhooks) and set `RAZORPAY_WEBHOOK_SECRET` to the secret you choose there.

**Frontend (Vercel / Netlify / static host)**

1. Build command: `npm run build`; output directory: `dist`; base directory: `frontend/`.
2. Set `VITE_API_URL` to your deployed backend's `/api` URL and (optionally)
   `VITE_STRIPE_PUBLISHABLE_KEY` / `VITE_RAZORPAY_KEY_ID` as build-time environment variables.
3. Because this is a client-side-routed SPA, configure the host to rewrite unknown paths to
   `index.html` (Vercel/Netlify do this automatically for Vite projects; on Nginx use
   `try_files $uri /index.html;`).

**Database**

Use MongoDB Atlas (or another managed MongoDB) in production rather than a self-hosted instance,
and restrict Network Access to your backend's IP range instead of `0.0.0.0/0`.

**Images**

Configure real Cloudinary credentials in production — the local `/uploads` disk fallback is meant
for development only and won't persist across most hosting platforms' deploys/restarts.

---

## Security Notes

- Passwords are hashed with bcrypt (12 salt rounds) and never returned in API responses.
- JWTs are issued on login/register and accepted via either an httpOnly, `SameSite`-scoped cookie
  or a `Bearer` header; the cookie is marked `secure` automatically when `NODE_ENV=production`.
- All state-changing admin routes are protected by both authentication (`protect`) and
  role-authorization (`authorize('admin')`) middleware.
- Input is validated with `express-validator` on every write endpoint; MongoDB operator injection
  is blocked with `express-mongo-sanitize`, and `xss-clean` sanitizes request bodies.
- `helmet` sets standard security headers; CORS is locked to `CLIENT_URL` with credentials
  enabled (not a wildcard origin).
- General API requests are rate-limited (300 / 15 min per IP); auth endpoints (register, login,
  forgot/reset password) use a stricter limiter (20 / 15 min per IP) to slow down credential
  stuffing / brute force attempts.
- Stripe payments are verified server-side: the backend re-fetches the Payment Intent from Stripe
  and checks its status and amount before creating an order — a manipulated client-side "payment
  succeeded" signal alone is never trusted.
- Razorpay payments get the same treatment: the backend recomputes the HMAC-SHA256 signature
  Razorpay returns and re-fetches the order from Razorpay's API to confirm it's paid and the
  amount matches, before creating an order.
- No secrets are committed to the repository; `.env` is git-ignored and only `.env.example`
  (placeholder values) is tracked.

---

## Troubleshooting

- **`SyntaxError: The requested module 'node:util' does not provide an export named 'styleText'`
  (or Tailwind/`@tailwindcss/oxide` refusing to load its native engine) when running
  `npm run dev`/`npm run build` in `frontend/`** — this means the pinned toolchain versions in
  `package.json` got bumped past what Node 18 supports (Vite 7+/Rolldown and ESLint 10 need Node
  `20.19+`; `@tailwindcss/oxide` 4.2.0+ needs Node `20+`). Run `node --version` to confirm you're
  on Node 18.18+, then reinstall clean (`rm -rf node_modules package-lock.json && npm install`) so
  the exact pinned versions in `package.json` are restored rather than newer ones. If you'd rather
  use the latest tool versions, upgrade Node itself to 22.12+ or 24 LTS instead.
- **"MongoServerError: connect ECONNREFUSED" on startup** — MongoDB isn't running or `MONGO_URI`
  is wrong. Confirm `mongod` is running locally, or that your Atlas connection string, username,
  password, and IP allowlist are correct.
- **Frontend loads but no data appears / network errors in the console** — the backend isn't
  running, or `VITE_API_URL` doesn't match where it's listening. Confirm `http://localhost:5000/api/health`
  returns `{"success":true,...}`.
- **CORS errors in the browser console** — `CLIENT_URL` in `backend/.env` must exactly match the
  frontend's origin (protocol + host + port).
- **Card payment option is hidden at checkout** — `VITE_STRIPE_PUBLISHABLE_KEY` (frontend) and/or
  `STRIPE_SECRET_KEY` (backend) are unset. This is expected/by design when Stripe isn't
  configured; Cash on Delivery remains available either way.
- **Razorpay option is hidden at checkout** — `VITE_RAZORPAY_KEY_ID` (frontend) and/or
  `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (backend) are unset. Same as above — expected by
  design, other payment methods remain available.
- **Razorpay checkout opens but the payment fails with a currency/"international cards not
  supported" error** — a fresh Razorpay account can only charge INR; this app charges Razorpay in
  INR by default for exactly that reason (see `RAZORPAY_CURRENCY` in `paymentController.js`). If
  you still see this, double-check `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` are your account's
  **test mode** keys, not live-mode keys used before completing Razorpay's activation.
- **Uploaded images don't show up after a redeploy** — Cloudinary isn't configured, so images fell
  back to local disk storage, which typically doesn't persist across redeploys on most hosting
  platforms. Set the three `CLOUDINARY_*` variables.
- **Password reset email never arrives** — SMTP isn't configured. In development, the reset link
  is printed to the backend's console/log output instead.

---

## A note on `backend/scripts/smoke-test.mjs`

This is a lightweight wiring check (route mounting, middleware order, validation, auth
enforcement, error handling) that runs without a live database connection — useful in CI or
sandboxed environments where a full MongoDB instance isn't available. It is **not** a substitute
for real integration/E2E tests against a live database and is not a measure of business-logic
correctness. Run it with:

```bash
cd backend
npm run smoke-test
```

---

## License

MIT — free to use, modify, and build on for your own projects.
