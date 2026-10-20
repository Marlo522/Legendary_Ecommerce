# Legendary Lifestyle

A modern streetwear e-commerce website for **T-shirts, caps, and tote bags**, built with **React 19 + Vite (JavaScript)**, **Laravel 13 (PHP)**, and **Supabase (PostgreSQL & Auth)**.

The storefront loads products, categories, images, variants, inventory, and approved reviews from Supabase through the Laravel API.

---

## Structure & Ports

| Application | Address | Technology |
| --- | --- | --- |
| Storefront | http://localhost:5173 | React 19, Vite, Tailwind CSS |
| Backend API | http://localhost:8000/api | Laravel 13 |
| Database & authentication | Your configured Supabase project | PostgreSQL, Supabase Auth, PostgREST |

```text
Legendary/
├── frontend/          # React storefront, customer account, and admin interface
├── backend/           # Laravel API, validation, services, repositories, and tests
├── docker-compose.yml # Local frontend and backend containers
├── README.md          # Project overview and setup
└── FILE_GUIDE.md      # Explanation of files created and modified
```

---

## Quick Start

### 1. Configure the environment

For first-time setup, create `backend/.env` from `backend/.env.example`. Preserve an existing `.env`.

For a new Supabase database, follow [the database setup guide](backend/database.md). Existing databases should use their existing schema and apply only needed updates, including [the auth profile security patch](backend/database/sql/secure_auth_profiles.sql). The legacy Laravel user migrations do not match the Supabase UUID profile schema.

The storefront uses `/api` by default; Vite forwards requests to Laravel. Supabase credentials belong in the backend environment. Normal application requests use the publishable key.

### 2. Start with Docker

Requires Docker Desktop with Docker Compose.

```powershell
# Build and start both applications
docker compose up -d --build
```

If `APP_KEY` is empty on first setup, generate it:

```powershell
docker compose exec backend php artisan key:generate
```

Open **http://localhost:5173**.

Useful commands:

```powershell
# Follow application logs
docker compose logs -f

# Stop the applications
docker compose down
```

Docker stores Composer dependencies in a dedicated volume and enables PHP bytecode caching to reduce loading delays on Windows.

### Run without Docker

Requires **PHP 8.4 or newer**, **Composer 2**, and **Node.js 24**. Configure the environment above first.

Backend terminal:

```powershell
cd backend
composer install
# Run php artisan key:generate only if APP_KEY is empty.
php artisan serve --host=localhost --port=8000
```

Frontend terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Use `localhost` consistently for the frontend and backend so session cookies work correctly. There is no root-level `npm run dev`; run the applications in their respective folders or use Docker.

---

## Available Features

- Database-backed homepage categories and featured products.
- Product catalog with search, category, color, size, price, availability, and collection filters.
- Sorting by newest, price, name, and popularity based on approved review count.
- Product details with image galleries, variant selection, stock, pricing, material, care information, reviews, and related products.
- Session shopping bag with server-calculated prices, quantity updates, removal, and live stock validation.
- Supabase login, session restoration, refresh, and logout.
- Customer order history, order details, addresses, and wishlist.
- Admin overview and product, customer, and order views.

## Main Pages

| Page | Route |
| --- | --- |
| Home | `/` |
| Product catalog | `/shop` |
| Product details | `/products/:slug` |
| Shopping bag | `/cart` |
| Sign in | `/login` |
| Customer account | `/account` |
| Saved products | `/account/wishlist` |
| Administration | `/admin` |

## Verification

Frontend, from `frontend/`:

```powershell
npm run lint
npm run build
```

Backend, from `backend/`:

```powershell
composer validate --no-check-publish
php artisan route:list --path=api --except-vendor
```

The automated test suites and their tooling were removed during the requested cleanup. After changes, check the running shop, product pages, login, and bag against the API.

## Current Scope

Checkout, payments, inventory reservation, the interactive Build Your Look flow, registration/recovery, and full admin editing are unfinished. The current shopping bag is stored in the Laravel server session.

Existing seeded demo products are database records. Replace demo content and development image URLs with real product information and hosted images before production use. Missing care instructions and size measurements are displayed explicitly.

Catalog listings use a 30-second server cache; details and cart stock checks query Supabase directly. Larger catalogs will need database-side filtering and sorting.

## Documentation

- [File guide and change explanations](FILE_GUIDE.md)
- [Backend setup and API contracts](backend/README.md)
- [Database schema and Supabase setup](backend/database.md)
- [Website requirements](backend/Requirements.md)
- [Design specification](backend/Design.md)
- [Project coding instructions](backend/AI.md)
- [Backend agent instructions](backend/AGENTS.md)
