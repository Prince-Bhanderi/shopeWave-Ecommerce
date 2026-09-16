<div align="center">

# 🛍️ ShopWave

### A Production-Ready Full-Stack E-Commerce Platform

*Shop, checkout, and manage — end to end.*

<br>

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-API-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2451?style=flat-square&logo=razorpay&logoColor=white)
![Cashfree](https://img.shields.io/badge/Cashfree-Payments-00C1C1?style=flat-square)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=flat-square&logo=cloudinary&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

</div>

---

## 📖 Overview

**ShopWave** is a complete e-commerce web application built with **React (Vite)**, **Node.js/Express**, and **MongoDB**.

It ships with everything a real storefront needs — a customer-facing shopping experience (catalog, cart, wishlist, multi-gateway checkout, order tracking, reviews) plus a full **admin dashboard** (sales analytics, product / category / order / user / coupon management).

> [!NOTE]
> This is a **complete, runnable application** — not a static mockup. Follow the steps below to install dependencies, configure environment variables, set up MongoDB, seed demo data, and run both the API server and the frontend locally.

<br>

<div align="center">

| 💳 **4 Payment Options** | 🔐 **Security Hardened** | 📊 **Admin Analytics** | 🧩 **Fully Modular** |
|:---:|:---:|:---:|:---:|
| Cashfree · Razorpay · Stripe · COD | JWT · Helmet · Rate limiting | Revenue & order charts | Clean layered architecture |

</div>

---

## 📑 Table of Contents

<table>
<tr>
<td valign="top" width="50%">

1. [✨ Features](#-features)
2. [🧰 Tech Stack](#-tech-stack)
3. [📂 Project Structure](#-project-structure)
4. [✅ Prerequisites](#-prerequisites)
5. [⚙️ Installation](#️-installation)
6. [🔑 Environment Variables](#-environment-variables)
7. [🍃 MongoDB Setup](#-mongodb-setup)
8. [▶️ Running the App](#️-running-the-app)

</td>
<td valign="top" width="50%">

9. [🌱 Seeding Demo Data](#-seeding-demo-data)
10. [👤 Demo / Admin Credentials](#-demo--admin-credentials)
11. [💳 Payment Gateways](#-payment-gateways)
12. [📡 API Documentation](#-api-documentation)
13. [📦 Production Build](#-production-build)
14. [🚀 Deployment](#-deployment)
15. [🔒 Security Notes](#-security-notes)
16. [🩺 Troubleshooting](#-troubleshooting)

</td>
</tr>
</table>

---

## ✨ Features

<details open>
<summary><b>🛒 Customer-Facing</b></summary>

<br>

| Area | What's included |
|---|---|
| **Authentication** | Email/password auth with JWT (httpOnly cookie **+** Bearer header), persistent login, protected routes, forgot/reset password flow, profile page (info, password, saved addresses). |
| **Homepage** | Hero banner, shop-by-category, featured / latest / best-selling rails, promo banner, customer testimonials, newsletter signup. |
| **Catalog** | Keyword search, category / brand / price / rating filters, sorting, and pagination. |
| **Product Page** | Image gallery, stock-aware add-to-cart, related products, reviews list. |
| **Cart** | Quantity controls, live subtotal / discount / shipping / tax / total, coupon codes, and persistence — guests get a `localStorage`-backed cart that auto-merges into their account cart on login/register. |
| **Wishlist** | Account-gated wishlist with move-to-cart support. |
| **Checkout** | 4-step flow: contact info → shipping address → order review → payment. Server-side stock validation, stock decrement, cart clearing, and an order confirmation page. |
| **Orders** | "My Orders" history with detail view and self-service cancellation while Pending/Processing. |
| **Reviews** | Restricted to customers who have actually purchased *and received* that product. |

**Payment methods at checkout:**

- 🟢 **Cashfree** — UPI, cards, netbanking, wallets, Pay Later, EMI *(India)*
- 🔵 **Razorpay** — UPI, cards, netbanking, wallets *(India)*
- 🟣 **Stripe** — international card payments
- 🟡 **Cash on Delivery** — always available, no configuration required

</details>

<details open>
<summary><b>🛡️ Admin Dashboard</b> <code>role-gated · /admin/*</code></summary>

<br>

- **Overview stats** — revenue, orders, users, products — with sales-over-time, revenue, order-count, and product-performance charts.
- **Product CRUD** with image upload (drag-and-drop, multi-image).
- **Category CRUD** with image upload.
- **Order management** — view, update order/payment status, cancel.
- **User management** — search/filter, change role, block/unblock, delete — with safeguards so an admin cannot demote/block/delete their own account.
- **Coupon CRUD** — percentage or fixed-amount discounts, minimum purchase, expiration, usage limits.

</details>

<details open>
<summary><b>🏗️ Engineering</b></summary>

<br>

- Consistent `{ success, message, data }` / `{ success: false, message, errors }` API response envelope on **every** endpoint.
- Centralized Express error handling that normalizes Mongoose, JWT, Multer, Stripe, Razorpay, and Cashfree errors.
- **Security hardening:** bcrypt password hashing, JWT auth, role-based authorization, `helmet`, credentialed origin-locked `cors`, `express-mongo-sanitize`, `xss-clean`, rate limiting (general + stricter auth limiter), centralized validation with `express-validator`, and **no secrets committed to the repo**.
- Cloudinary image uploads with an automatic local-disk (`/uploads`) fallback in development when Cloudinary credentials are not set.
- **Server-side payment verification on all three gateways** — the client's "payment succeeded" signal is *never* trusted alone:
  - **Stripe** → backend re-fetches the Payment Intent and checks status + amount before an order is created.
  - **Razorpay** → backend recomputes the HMAC-SHA256 signature and re-fetches the order from Razorpay's API to confirm paid status + amount.
  - **Cashfree** → backend re-fetches the order from Cashfree's Orders API (and verifies the webhook signature) to confirm `PAID` status + amount before an order is created.

</details>

---

## 🧰 Tech Stack

<table>
<tr>
<th align="left" width="130">Layer</th>
<th align="left">Technologies</th>
</tr>
<tr>
<td><b>Frontend</b></td>
<td>React 19 · Vite · React Router · Redux Toolkit · Axios · React Hook Form + Zod · Tailwind CSS v4 · Recharts · Stripe.js / React Stripe Elements · Razorpay Checkout.js · Cashfree JS SDK · react-hot-toast · lucide-react</td>
</tr>
<tr>
<td><b>Backend</b></td>
<td>Node.js · Express · MongoDB + Mongoose · JWT (<code>jsonwebtoken</code>) · <code>bcryptjs</code> · Multer + Cloudinary · <code>express-validator</code> · <code>helmet</code> · <code>cors</code> · <code>express-rate-limit</code> · <code>express-mongo-sanitize</code> · <code>xss-clean</code> · Stripe · Razorpay · Cashfree</td>
</tr>
<tr>
<td><b>Database</b></td>
<td>MongoDB (local <code>mongod</code> or MongoDB Atlas)</td>
</tr>
<tr>
<td><b>Media</b></td>
<td>Cloudinary (with local disk fallback for development)</td>
</tr>
</table>

---

## 📂 Project Structure

```
ecommerce-app/
│
├── 📁 backend/
│   ├── src/
│   │   ├── config/          # db.js (Mongo connection), cloudinary.js
│   │   ├── controllers/     # route handlers (auth, products, cart, orders, payments, admin, ...)
│   │   ├── middleware/      # auth, error handling, validation, upload, rate limiting
│   │   ├── models/          # Mongoose schemas: User, Product, Category, Cart,
│   │   │                    #   Order, Review, Coupon
│   │   ├── routes/          # Express routers, one per resource
│   │   ├── seed/            # seedData.js (fixtures) + seed.js (seed/destroy script)
│   │   ├── utils/           # ApiError, ApiResponse, JWT helpers, price calc, email
│   │   ├── validators/      # express-validator rule sets per resource
│   │   ├── app.js           # Express app: middleware + route wiring
│   │   └── server.js        # Entry point: connects to Mongo, starts HTTP server
│   ├── scripts/
│   │   └── smoke-test.mjs   # Wiring/route smoke test (see note below)
│   ├── .env.example
│   └── package.json
│
├── 📁 frontend/
│   ├── src/
│   │   ├── api/             # axiosClient + one service module per backend resource
│   │   ├── components/      # common/, layout/, product/, cart/, order/, admin/, auth/, ...
│   │   ├── hooks/           # useAuth, useCart, useWishlist, useProducts, useDebounce
│   │   ├── layouts/         # MainLayout, AdminLayout
│   │   ├── pages/           # route-level pages, including pages/admin/*
│   │   ├── redux/           # store.js + slices/ (auth, cart, wishlist, categories, ui)
│   │   ├── utils/           # formatters, storage, price calc,
│   │   │                    #   Stripe / Razorpay / Cashfree helpers
│   │   ├── App.jsx          # route tree (code-split with React.lazy)
│   │   └── main.jsx         # app entry point
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
│
└── 📄 README.md
```

---

## ✅ Prerequisites

| Requirement | Notes |
|---|---|
| **Node.js 18.18+** | Any 18.18–18.x, 20.9+, or 21.1+ and up. Check with `node --version`. |
| **npm** | Ships with Node. |
| **MongoDB** | A local `mongod` instance, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster. |

**Optional (for full functionality):**

| Service | Purpose | Free tier |
|---|---|---|
| [Cashfree](https://www.cashfree.com/) | UPI / cards / netbanking / wallets / Pay Later (India) | ✅ Sandbox |
| [Razorpay](https://razorpay.com) | UPI / cards / netbanking / wallets (India) | ✅ Test mode |
| [Stripe](https://stripe.com) | International card payments | ✅ Test mode |
| [Cloudinary](https://cloudinary.com) | Hosted image uploads | ✅ Free tier |

> [!TIP]
> The app runs **without any** of these — Cash on Delivery works out of the box and image uploads fall back to local disk. See [Environment Variables](#-environment-variables).

<details>
<summary><b>⚠️ Important note on toolchain versions (click to expand)</b></summary>

<br>

`frontend/package.json` pins **exact** versions of `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, `eslint`, and `@eslint/js` (no `^` range) specifically so this project keeps running on **Node 18**.

Newer majors of these tools require higher Node versions and will fail at runtime:

| Package | Requires | Failure mode if upgraded on Node 18 |
|---|---|---|
| Vite 7+ / Rolldown | Node 20.19+ | `SyntaxError` — missing `node:util`'s `styleText` export |
| `@tailwindcss/oxide` 4.2.0+ | Node 20+ | Refuses to load its native engine |
| ESLint 10 | Node 20+ | Runtime failure |

If you're already on **Node 20.19+ or 22.12+**, you're free to bump those packages to their latest versions — just don't `npm update` them blindly on Node 18.

</details>

---

## ⚙️ Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/Prince-Bhanderi/shopeWave-Ecommerce.git
cd shopeWave-Ecommerce

# 2️⃣ Install backend dependencies
cd backend
npm install

# 3️⃣ Install frontend dependencies
cd ../frontend
npm install
```

---

## 🔑 Environment Variables

Copy each `.env.example` to `.env` and fill in your real values:

```bash
cd backend  && cp .env.example .env
cd ../frontend && cp .env.example .env
```

> [!WARNING]
> **Never commit your `.env` file or paste real API keys into `.env.example`.** `.env.example` should only ever contain **placeholder** values. Real credentials belong in `.env` (git-ignored) or in your hosting platform's environment settings.

### 🖥️ `backend/.env`

<details open>
<summary><b>Core — required</b></summary>

<br>

| Variable | Required | Description |
|---|:---:|---|
| `NODE_ENV` | ⬜ | `development` or `production` (default `development`). Controls logging verbosity and the cookie `secure` flag. |
| `PORT` | ⬜ | Port the API server listens on (default `5000`). |
| `MONGO_URI` | ✅ | MongoDB connection string.<br>Local: `mongodb://127.0.0.1:27017/ecommerce`<br>Atlas: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/ecommerce` |
| `JWT_SECRET` | ✅ | Long, random string used to sign JWTs. **Never reuse a sample value in production.** |
| `JWT_EXPIRES_IN` | ⬜ | JWT expiry, e.g. `7d`, `1h` (default `7d`). |
| `JWT_COOKIE_EXPIRES_IN` | ⬜ | Days until the auth cookie expires (default `7`). |
| `CLIENT_URL` | ✅ | Frontend origin — used for CORS and password-reset links, e.g. `http://localhost:5173`. |

</details>

<details open>
<summary><b>💳 Cashfree — optional</b></summary>

<br>

| Variable | Required | Description |
|---|:---:|---|
| `CASHFREE_APP_ID` | ⬜ | Cashfree App ID (client ID) from [Cashfree Merchant Dashboard → Developers → API Keys](https://merchant.cashfree.com/). |
| `CASHFREE_SECRET_KEY` | ⬜ | Cashfree Secret Key. **Server-side only — never expose this to the frontend.** |
| `CASHFREE_ENV` | ⬜ | `SANDBOX` (default, for testing) or `PRODUCTION` (live payments). |
| `CASHFREE_API_VERSION` | ⬜ | Cashfree PG API version header, e.g. `2023-08-01`. |
| `CASHFREE_WEBHOOK_SECRET` | ⬜ | Required only if you wire up `/api/payments/cashfree-webhook` to a real Cashfree webhook. |

> Leave `CASHFREE_APP_ID` / `CASHFREE_SECRET_KEY` blank to hide the Cashfree option at checkout — the other payment methods still work.

</details>

<details open>
<summary><b>💳 Razorpay & Stripe — optional</b></summary>

<br>

| Variable | Required | Description |
|---|:---:|---|
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | ⬜ | Enables Razorpay payments — get test keys from [dashboard.razorpay.com/app/keys](https://dashboard.razorpay.com/app/keys). Leave both blank to hide the option. |
| `RAZORPAY_WEBHOOK_SECRET` | ⬜ | Required only if you wire up `/api/payments/razorpay-webhook` to a real webhook. |
| `STRIPE_SECRET_KEY` | ⬜ | Enables card payments. Leave blank to disable Stripe — COD still works. |
| `STRIPE_WEBHOOK_SECRET` | ⬜ | Required only if you wire up `/api/payments/webhook` to a real Stripe webhook. |

</details>

<details open>
<summary><b>🖼️ Media, email & seeding — optional</b></summary>

<br>

| Variable | Required | Description |
|---|:---:|---|
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | ⬜ | Enables hosted image uploads. Leave all three blank and uploads are written to `backend/uploads` and served from `/uploads`. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `EMAIL_FROM` | ⬜ | Used to email password-reset links. Leave blank in development — the reset link is printed to the server console instead. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | ⬜ | Credentials for the admin account created by `npm run seed`. |

</details>

### 🌐 `frontend/.env`

| Variable | Required | Description |
|---|:---:|---|
| `VITE_API_URL` | ✅ | Base URL of the backend API, **including `/api`** — e.g. `http://localhost:5000/api`. |
| `VITE_CASHFREE_MODE` | ⬜ | `sandbox` (default) or `production` — tells the Cashfree JS SDK which environment to load. |
| `VITE_RAZORPAY_KEY_ID` | ⬜ | Razorpay key id (same value as the backend's `RAZORPAY_KEY_ID` — it's a public identifier, safe to expose). Leave blank to hide the option. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | ⬜ | Stripe publishable key. Leave blank to hide the card-payment option. |

> [!IMPORTANT]
> Cashfree's **secret key must never** appear in the frontend. The frontend only receives a short-lived `payment_session_id` created by the backend — that's by design.

---

## 🍃 MongoDB Setup

<table>
<tr>
<td valign="top" width="50%">

### Option A — Local MongoDB

1. Install [MongoDB Community Server](https://www.mongodb.com/docs/manual/installation/) for your OS.
2. Start it:
   ```bash
   mongod
   # or: brew services start mongodb-community
   ```
3. Use this in `backend/.env`:
   ```
   MONGO_URI=mongodb://127.0.0.1:27017/ecommerce
   ```

</td>
<td valign="top" width="50%">

### Option B — MongoDB Atlas *(free, no install)*

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. **Database Access** → create a DB user with username/password.
3. **Network Access** → allow your IP (or `0.0.0.0/0` for dev only).
4. **Connect → Drivers** → copy the string, substitute your credentials, append a DB name:
   ```
   .../ecommerce?retryWrites=true&w=majority
   ```

</td>
</tr>
</table>

> Mongoose creates collections and indexes automatically on first connection — **no manual schema setup required.**

---

## ▶️ Running the App

Run the backend and frontend in **two separate terminals**.

**Terminal 1 — API server**
```bash
cd backend
npm run dev        # → http://localhost:5000  (nodemon auto-reload)
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev        # → http://localhost:5173
```

Visit **`http://localhost:5173`**.

> The frontend calls whatever `VITE_API_URL` points to, so the backend must be running for the app to load data.

---

## 🌱 Seeding Demo Data

With `backend/.env` configured and MongoDB reachable:

```bash
cd backend
npm run seed             # populate categories, products, users, orders, reviews, coupons
npm run seed:destroy     # wipe those collections clean
```

**The seed script creates:**

| Item | Count / Detail |
|---|---|
| 👤 Accounts | 1 admin + 2 demo customers |
| 🗂️ Categories | 8 product categories |
| 📦 Products | 24 products across 10 brands — with images, stock, ratings, and a mix of featured/on-sale items |
| 🧾 Orders | A handful of past orders with varying statuses for the demo customers |
| ⭐ Reviews | Generated from delivered/shipped orders |
| 🎟️ Coupons | `WELCOME10` (10% off) · `FLAT20` ($20 off orders $100+) · `SAVE15` (15% off orders $50+) |

> Re-running `npm run seed` clears and re-populates these collections — safe to run again if your data gets into a weird state during testing.

---

## 👤 Demo / Admin Credentials

> [!CAUTION]
> **Development only.** These are seed-script defaults for local testing and demos. **Never ship these to production** — set your own `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env` before seeding a production database, and delete or re-password any demo accounts before going live.

| Role | Email | Password | Name |
|:---|:---|:---|:---|
| 🛡️ **Admin** | `admin@shopwave.dev` | `Admin@12345` | ShopWave Admin |
| 🛒 Customer | `demo@shopwave.dev` | `Demo@12345` | John Doe |
| 🛒 Customer | `jane@shopwave.dev` | `Jane@12345` | Jane Smith |

Log in at `/login` with the admin account and visit **`/admin`** for the dashboard.

---

## 💳 Payment Gateways

ShopWave supports **four** payment paths at checkout. Each gateway is independently optional — if its credentials aren't set, that option is simply hidden and the rest continue to work.

<table>
<tr>
<th align="left">Gateway</th>
<th align="left">Methods</th>
<th align="left">Currency</th>
<th align="left">Enable by setting</th>
</tr>
<tr>
<td>🟢 <b>Cashfree</b></td>
<td>UPI, cards, netbanking, wallets, Pay Later, EMI</td>
<td>INR</td>
<td><code>CASHFREE_APP_ID</code> + <code>CASHFREE_SECRET_KEY</code></td>
</tr>
<tr>
<td>🔵 <b>Razorpay</b></td>
<td>UPI, cards, netbanking, wallets</td>
<td>INR</td>
<td><code>RAZORPAY_KEY_ID</code> + <code>RAZORPAY_KEY_SECRET</code></td>
</tr>
<tr>
<td>🟣 <b>Stripe</b></td>
<td>International cards</td>
<td>USD</td>
<td><code>STRIPE_SECRET_KEY</code> + <code>VITE_STRIPE_PUBLISHABLE_KEY</code></td>
</tr>
<tr>
<td>🟡 <b>Cash on Delivery</b></td>
<td>Pay at doorstep</td>
<td>—</td>
<td>Always available</td>
</tr>
</table>

### 🔄 Cashfree Payment Flow

```
 ┌──────────┐   1. Checkout    ┌──────────┐  2. Create Order  ┌───────────┐
 │  Client  │ ───────────────► │  Backend │ ────────────────► │ Cashfree  │
 └──────────┘                  └──────────┘                   └───────────┘
      ▲                             │                               │
      │  3. payment_session_id      │                               │
      └─────────────────────────────┘                               │
      │                                                             │
      │  4. Cashfree JS SDK opens the hosted checkout ──────────────►│
      │                                                             │
      │  5. User pays (UPI / card / netbanking / wallet)             │
      │                                                             │
      ▼                                                             │
 ┌──────────┐   6. Verify      ┌──────────┐ 7. Re-fetch order status │
 │  Client  │ ───────────────► │  Backend │ ─────────────────────────┘
 └──────────┘                  └──────────┘
                                    │
                                    │ 8. Status === PAID && amount matches?
                                    ▼
                          ✅ Order created · stock decremented · cart cleared
```

> [!IMPORTANT]
> **The client's success callback is never trusted alone.** Before any order is created, the backend independently re-fetches the order from Cashfree's Orders API and confirms both the `PAID` status *and* that the paid amount matches the server-computed cart total. A manipulated client-side response cannot create a paid order.

<details>
<summary><b>🧪 Testing Cashfree in sandbox mode</b></summary>

<br>

1. Sign up at [merchant.cashfree.com](https://merchant.cashfree.com/) and switch the dashboard to **Sandbox / Test** mode.
2. Go to **Developers → API Keys** and copy your **App ID** and **Secret Key**.
3. Set them in `backend/.env`, and keep `CASHFREE_ENV=SANDBOX`.
4. Set `VITE_CASHFREE_MODE=sandbox` in `frontend/.env`.
5. At checkout, use Cashfree's published sandbox test instruments (test UPI IDs, test cards, and simulated netbanking) listed in the [Cashfree test data docs](https://www.cashfree.com/docs/payments/online/resources/sandbox-environment).

> Sandbox and production keys are **not** interchangeable — using production keys with `CASHFREE_ENV=SANDBOX` (or vice versa) will fail authentication.

</details>

<details>
<summary><b>🇮🇳 A note on currency (Razorpay & Cashfree)</b></summary>

<br>

Fresh Razorpay and Cashfree accounts are **INR-only** until international payments are separately activated. This app charges both gateways in **INR** by default for exactly that reason — see `RAZORPAY_CURRENCY` / `CASHFREE_CURRENCY` in `paymentController.js`. Stripe handles international cards.

</details>

---

## 📡 API Documentation

**Base URL:** `{VITE_API_URL}` — e.g. `http://localhost:5000/api`

All responses follow a consistent envelope:

```jsonc
// ✅ success
{ "success": true, "message": "...", "data": { /* ... */ }, "meta": { /* pagination, optional */ } }

// ❌ error
{ "success": false, "message": "...", "errors": [ /* validation details, optional */ ] }
```

Authenticated requests may use **either** an httpOnly cookie (set automatically on login/register) **or** an `Authorization: Bearer <token>` header.

`GET /api/health` — service liveness check *(no auth)*.

<details open>
<summary><b>🔐 Auth</b> — <code>/api/auth</code></summary>

<br>

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `POST` | `/register` | 🌍 Public | Create an account |
| `POST` | `/login` | 🌍 Public | Log in, returns/sets JWT |
| `POST` | `/logout` | 🔒 Private | Clear auth cookie |
| `GET` | `/me` | 🔒 Private | Current user profile |
| `PUT` | `/profile` | 🔒 Private | Update name/phone/avatar |
| `PUT` | `/change-password` | 🔒 Private | Change password |
| `POST` | `/forgot-password` | 🌍 Public | Send/generate password reset token |
| `POST` | `/reset-password/:token` | 🌍 Public | Set a new password |

</details>

<details open>
<summary><b>📦 Products</b> — <code>/api/products</code></summary>

<br>

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/` | 🌍 Public | List products — see query params below |
| `POST` | `/` | 🛡️ Admin | Create a product |
| `GET` | `/:id` | 🌍 Public | Product detail |
| `PUT` | `/:id` | 🛡️ Admin | Update a product |
| `DELETE` | `/:id` | 🛡️ Admin | Delete a product |
| `PATCH` | `/:id/stock` | 🛡️ Admin | Adjust stock directly |
| `GET` | `/:productId/reviews` | 🌍 Public | Reviews for a product |
| `POST` | `/:productId/reviews` | 🔒 Private | Add a review *(requires a delivered order containing this product)* |

**Query params for `GET /`:** `keyword`, `category`, `brand`, `minPrice`, `maxPrice`, `rating`, `sort` (`newest` \| `price-asc` \| `price-desc` \| `rating` \| `popular` \| `name-asc`), `featured`, `inStock`, `page`, `limit`

</details>

<details open>
<summary><b>🗂️ Categories</b> — <code>/api/categories</code></summary>

<br>

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/` | 🌍 Public | List categories |
| `POST` | `/` | 🛡️ Admin | Create a category |
| `GET` | `/:id` | 🌍 Public | Category detail |
| `PUT` | `/:id` | 🛡️ Admin | Update a category |
| `DELETE` | `/:id` | 🛡️ Admin | Delete a category *(blocked if it still has products)* |
| `GET` | `/:id/products` | 🌍 Public | Products in a category |

</details>

<details open>
<summary><b>🛒 Cart</b> — <code>/api/cart</code> <i>(all Private)</i></summary>

<br>

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/` | Get current user's cart |
| `POST` | `/` | Add an item — `{ productId, quantity }` |
| `DELETE` | `/` | Clear the cart |
| `PUT` | `/:itemId` | Update an item's quantity |
| `DELETE` | `/:itemId` | Remove an item |
| `POST` | `/apply-coupon` | Apply a coupon code |
| `DELETE` | `/coupon` | Remove the applied coupon |

</details>

<details open>
<summary><b>❤️ Wishlist</b> — <code>/api/wishlist</code> <i>(all Private)</i></summary>

<br>

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/` | Get wishlist |
| `POST` | `/:productId` | Add a product |
| `DELETE` | `/:productId` | Remove a product |
| `POST` | `/:productId/move-to-cart` | Move an item to the cart |

</details>

<details open>
<summary><b>🧾 Orders</b> — <code>/api/orders</code> <i>(all Private)</i></summary>

<br>

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/` | Create an order *(validates stock, computes totals, decrements stock, clears cart)* |
| `GET` | `/my-orders` | Current user's order history |
| `GET` | `/:id` | Order detail |
| `PUT` | `/:id/cancel` | Cancel an order *(only while Pending/Processing)* |

</details>

<details open>
<summary><b>⭐ Reviews</b> — <code>/api/reviews</code></summary>

<br>

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/recent` | 🌍 Public | Recent reviews across all products *(homepage testimonials)* |
| `PUT` | `/:id` | 🔒 Private | Update your own review |
| `DELETE` | `/:id` | 🔒 Private | Delete your own review |

</details>

<details open>
<summary><b>🎟️ Coupons</b> — <code>/api/coupons</code></summary>

<br>

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/check/:code` | 🔒 Private | Validate a coupon code without applying it |
| `GET` | `/` | 🛡️ Admin | List all coupons |
| `POST` | `/` | 🛡️ Admin | Create a coupon |
| `PUT` | `/:id` | 🛡️ Admin | Update a coupon |
| `DELETE` | `/:id` | 🛡️ Admin | Delete a coupon |

</details>

<details open>
<summary><b>💳 Payments</b> — <code>/api/payments</code></summary>

<br>

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `POST` | `/cashfree/create-order` | 🔒 Private | Create a Cashfree Order for the current cart total — returns a `payment_session_id` |
| `POST` | `/cashfree/verify` | 🔒 Private | Re-fetch the order from Cashfree and verify `PAID` status + amount server-side |
| `POST` | `/cashfree-webhook` | 🟢 Cashfree only | Cashfree webhook receiver *(raw body, signature-verified)* |
| `POST` | `/razorpay/create-order` | 🔒 Private | Create a Razorpay Order for the current cart total |
| `POST` | `/razorpay-webhook` | 🔵 Razorpay only | Razorpay webhook receiver *(raw body, signature-verified)* |
| `POST` | `/create-payment-intent` | 🔒 Private | Create a Stripe Payment Intent for the current cart total |
| `POST` | `/webhook` | 🟣 Stripe only | Stripe webhook receiver *(raw body, signature-verified)* |

</details>

<details open>
<summary><b>📤 Upload</b> — <code>/api/upload</code> <i>(Admin)</i></summary>

<br>

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/` | Upload up to 10 images — `multipart/form-data`, field `images` |
| `DELETE` | `/` | Delete an uploaded image — `{ publicId }` in body |

</details>

<details open>
<summary><b>🛡️ Admin</b> — <code>/api/admin</code> <i>(Admin only)</i></summary>

<br>

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/dashboard` | Aggregated stats: revenue, order counts, user counts, chart series |
| `GET` | `/orders` | List/search/filter all orders |
| `GET` | `/orders/:id` | Order detail *(admin view)* |
| `PUT` | `/orders/:id/status` | Update order status |
| `PUT` | `/orders/:id/payment-status` | Update payment status |
| `PUT` | `/orders/:id/cancel` | Cancel any order |
| `GET` | `/users` | List/search/filter users |
| `GET` | `/users/:id` | User detail |
| `PUT` | `/users/:id/role` | Change a user's role |
| `PUT` | `/users/:id/block` | Block/unblock a user |
| `DELETE` | `/users/:id` | Delete a user |
| `GET` | `/products` | List products *(admin view)* |

</details>

---

## 📦 Production Build

**Frontend**

```bash
cd frontend
npm run build       # → static assets in frontend/dist
npm run preview     # optional: serve the production build locally to sanity-check it
```

`frontend/dist` is a static bundle — deploy it to any static host (Vercel, Netlify, S3 + CloudFront, Nginx, etc.).

**Backend**

The backend runs directly on Node — **no separate build step**.

```bash
cd backend
NODE_ENV=production npm start
```

---

## 🚀 Deployment

<details open>
<summary><b>🖥️ Backend</b> — Render / Railway / Fly.io / VPS</summary>

<br>

1. Provision the service from the `backend/` directory — start command `npm start`, Node 18+.
2. Set **all** required environment variables directly in the platform's dashboard — **never commit a real `.env` file**.
3. Set `MONGO_URI` to your Atlas (or managed Mongo) connection string.
4. Set `CLIENT_URL` to your deployed frontend's **exact** origin — needed for CORS and for password-reset email links.
5. Behind a platform load balancer/proxy (Render, Railway, Heroku-style)? Already handled — `app.set('trust proxy', 1)` is set so secure cookies and rate limiting see the real client IP.
6. **Cashfree:** switch `CASHFREE_ENV` to `PRODUCTION`, swap in your **production** App ID / Secret Key, and add the deployed webhook URL (`https://your-api-domain/api/payments/cashfree-webhook`) in the Cashfree dashboard (**Developers → Webhooks**). Set `CASHFREE_WEBHOOK_SECRET` to the secret you configure there.
7. **Razorpay:** add the webhook URL (`https://your-api-domain/api/payments/razorpay-webhook`) in the Razorpay dashboard (**Settings → Webhooks**) and set `RAZORPAY_WEBHOOK_SECRET`.
8. **Stripe:** add the webhook URL (`https://your-api-domain/api/payments/webhook`) in the Stripe dashboard and set `STRIPE_WEBHOOK_SECRET` to the signing secret it gives you.

</details>

<details open>
<summary><b>🌐 Frontend</b> — Vercel / Netlify / static host</summary>

<br>

1. Build command `npm run build` · output directory `dist` · base directory `frontend/`.
2. Set `VITE_API_URL` to your deployed backend's `/api` URL, plus (optionally) `VITE_CASHFREE_MODE=production`, `VITE_RAZORPAY_KEY_ID`, and `VITE_STRIPE_PUBLISHABLE_KEY` as **build-time** environment variables.
3. This is a client-side-routed SPA — configure the host to rewrite unknown paths to `index.html`. Vercel/Netlify do this automatically for Vite projects; on Nginx use `try_files $uri /index.html;`.

</details>

<details open>
<summary><b>🍃 Database & 🖼️ Images</b></summary>

<br>

- **Database** — use MongoDB Atlas (or another managed MongoDB) in production rather than a self-hosted instance, and restrict Network Access to your backend's IP range instead of `0.0.0.0/0`.
- **Images** — configure real Cloudinary credentials in production. The local `/uploads` disk fallback is for development only and won't persist across most hosting platforms' deploys/restarts.

</details>

---

## 🔒 Security Notes

| Area | Implementation |
|---|---|
| 🔑 **Passwords** | Hashed with bcrypt (12 salt rounds) and never returned in API responses. |
| 🎫 **JWT** | Issued on login/register; accepted via httpOnly `SameSite`-scoped cookie **or** `Bearer` header. Cookie is marked `secure` automatically when `NODE_ENV=production`. |
| 🛡️ **Authorization** | All state-changing admin routes protected by both `protect` (authentication) and `authorize('admin')` (role) middleware. |
| 🧼 **Input safety** | `express-validator` on every write endpoint; MongoDB operator injection blocked with `express-mongo-sanitize`; `xss-clean` sanitizes request bodies. |
| 🪖 **Headers & CORS** | `helmet` sets standard security headers; CORS locked to `CLIENT_URL` with credentials enabled — **not** a wildcard origin. |
| 🚦 **Rate limiting** | General API: 300 req / 15 min per IP. Auth endpoints (register, login, forgot/reset password): stricter 20 req / 15 min per IP to slow credential stuffing and brute force. |
| 🟢 **Cashfree verification** | Backend re-fetches the order from Cashfree's Orders API and confirms `PAID` status **and** amount before creating an order. Webhooks are signature-verified against `CASHFREE_WEBHOOK_SECRET`. |
| 🔵 **Razorpay verification** | Backend recomputes the HMAC-SHA256 signature **and** re-fetches the order from Razorpay's API to confirm paid status + amount. |
| 🟣 **Stripe verification** | Backend re-fetches the Payment Intent from Stripe and checks status + amount — a manipulated client-side "payment succeeded" signal is never trusted alone. |
| 🤐 **Secrets** | No secrets committed to the repository. `.env` is git-ignored; only `.env.example` (placeholder values) is tracked. |

> [!WARNING]
> If a real key ever lands in a commit, **rotating it is not optional** — regenerate it in the provider's dashboard even after removing it from git history.

---

## 🩺 Troubleshooting

<details>
<summary><b>❌ <code>SyntaxError: ... 'node:util' does not provide an export named 'styleText'</code></b> (or Tailwind's oxide engine refusing to load)</summary>

<br>

The pinned toolchain versions in `frontend/package.json` got bumped past what Node 18 supports (Vite 7+/Rolldown and ESLint 10 need Node `20.19+`; `@tailwindcss/oxide` 4.2.0+ needs Node `20+`).

**Fix:** run `node --version` to confirm you're on Node 18.18+, then reinstall clean so the exact pinned versions are restored:

```bash
rm -rf node_modules package-lock.json && npm install
```

Prefer the latest tools? Upgrade Node itself to **22.12+** or **24 LTS** instead.

</details>

<details>
<summary><b>❌ <code>MongoServerError: connect ECONNREFUSED</code> on startup</b></summary>

<br>

MongoDB isn't running or `MONGO_URI` is wrong. Confirm `mongod` is running locally, or that your Atlas connection string, username, password, and IP allowlist are all correct.

</details>

<details>
<summary><b>❌ Frontend loads but no data appears / network errors in the console</b></summary>

<br>

The backend isn't running, or `VITE_API_URL` doesn't match where it's listening. Confirm `http://localhost:5000/api/health` returns `{"success":true,...}`.

</details>

<details>
<summary><b>❌ CORS errors in the browser console</b></summary>

<br>

`CLIENT_URL` in `backend/.env` must **exactly** match the frontend's origin — protocol **+** host **+** port.

</details>

<details>
<summary><b>❌ Cashfree option is hidden at checkout</b></summary>

<br>

`CASHFREE_APP_ID` and/or `CASHFREE_SECRET_KEY` are unset in `backend/.env`. This is expected by design when Cashfree isn't configured — the other payment methods remain available.

</details>

<details>
<summary><b>❌ Cashfree checkout fails with an authentication / <code>401</code> error</b></summary>

<br>

Almost always an environment mismatch. Check that:

- `CASHFREE_ENV` matches the type of keys you're using — **sandbox keys need `SANDBOX`**, production keys need `PRODUCTION`.
- `VITE_CASHFREE_MODE` on the frontend matches the backend's `CASHFREE_ENV`.
- `CASHFREE_API_VERSION` is a version your account supports (e.g. `2023-08-01`).
- The Secret Key was copied in full, with no trailing whitespace or line break.

</details>

<details>
<summary><b>❌ Cashfree payment succeeds but no order is created</b></summary>

<br>

By design, the backend only creates an order **after** independently verifying the payment. Check the backend logs for the verification step — the usual causes are:

- The verify endpoint wasn't reached (network drop on the return redirect) — the webhook is the safety net here, so confirm `CASHFREE_WEBHOOK_SECRET` and the webhook URL are configured.
- An **amount mismatch** between the Cashfree order and the server-computed cart total (e.g. the cart changed mid-checkout).
- The Cashfree order status is still `ACTIVE` rather than `PAID` — the payment hadn't settled yet when verification ran.

</details>

<details>
<summary><b>❌ Razorpay option is hidden at checkout</b></summary>

<br>

`VITE_RAZORPAY_KEY_ID` (frontend) and/or `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (backend) are unset. Expected by design — other payment methods remain available.

</details>

<details>
<summary><b>❌ Razorpay opens but fails with a currency / "international cards not supported" error</b></summary>

<br>

A fresh Razorpay account can only charge **INR** — this app charges Razorpay in INR by default for that reason (see `RAZORPAY_CURRENCY` in `paymentController.js`). If you still see this, double-check you're using your account's **test mode** keys, not live-mode keys from before activation.

</details>

<details>
<summary><b>❌ Card payment (Stripe) option is hidden at checkout</b></summary>

<br>

`VITE_STRIPE_PUBLISHABLE_KEY` (frontend) and/or `STRIPE_SECRET_KEY` (backend) are unset. Expected by design; Cash on Delivery remains available either way.

</details>

<details>
<summary><b>❌ Uploaded images disappear after a redeploy</b></summary>

<br>

Cloudinary isn't configured, so images fell back to local disk storage — which typically doesn't persist across redeploys on most hosting platforms. Set the three `CLOUDINARY_*` variables.

</details>

<details>
<summary><b>❌ Password reset email never arrives</b></summary>

<br>

SMTP isn't configured. In development the reset link is printed to the backend's console/log output instead of being emailed.

</details>

<details>
<summary><b>❌ GitHub blocks your push: "Push cannot contain secrets"</b></summary>

<br>

GitHub's secret scanning found a real API key in a commit — most often a live key accidentally pasted into `.env.example`.

**Fix:** replace the key with a placeholder, remove it from **every** commit in the history (amend, rebase, or a fresh clean commit), push again — and then **rotate that key** in the provider's dashboard regardless.

</details>

---

## 🧪 A Note on `backend/scripts/smoke-test.mjs`

This is a lightweight **wiring check** — route mounting, middleware order, validation, auth enforcement, error handling — that runs **without a live database connection**. Useful in CI or sandboxed environments where a full MongoDB instance isn't available.

> [!NOTE]
> It is **not** a substitute for real integration/E2E tests against a live database, and it is **not** a measure of business-logic correctness.

```bash
cd backend
npm run dev
```

---

## 📄 License

This project is licensed under the **[MIT License](LICENSE)**.

<br>

<div align="center">

**Built with ❤️ by [Prince Bhanderi](https://github.com/Prince-Bhanderi)**

⭐ *If you find this project useful, consider starring the repo!*

</div>
