# File Guide

This guide covers the loading fixes, database-backed product catalog/details, shopping actions, and documentation changes made in this conversation. Change labels describe work relative to the start of those tasks; Git may still show an already-existing file as untracked.

## How the Features Connect

1. React routes render the catalog, product detail, and bag pages.
2. Shared UI components use the API client and data hooks to call Laravel.
3. Laravel controllers validate requests and delegate to services.
4. CatalogRepository uses the existing SupabaseClient to read Supabase PostgREST data with the publishable key.
5. CatalogService prepares public product information and applies listing rules.
6. CartService checks live variants and prices before updating the Laravel session bag.
7. WishlistController writes through Supabase using the signed-in user's token and ID.

Catalog responses are public and contain active products/variants and approved review data. Bag and wishlist mutations retain session and CSRF protection.

## Infrastructure and Loading

| File | Change | Purpose |
| --- | --- | --- |
| [backend/Dockerfile](backend/Dockerfile) | Modified | Adds the development PHP configuration and installs locked Composer dependencies into the image so Docker can populate the dependency volume. |
| [backend/php-development.ini](backend/php-development.ini) | Created | Enables OPcache for the PHP CLI server, with timestamp checks so development edits are picked up. |
| [docker-compose.yml](docker-compose.yml) | Modified | Mounts a dedicated backend dependency volume and the PHP settings. Synchronizes Composer dependencies when the backend starts, then starts Laravel. |

The loading work also changed authentication and API files listed below. A guest session check now avoids the extra CSRF/refresh request chain. PHP caching and the Docker dependency volume reduce repeated framework loading through the Windows file mount.

## Backend

| File | Change | Purpose |
| --- | --- | --- |
| [backend/app/Http/Controllers/CatalogController.php](backend/app/Http/Controllers/CatalogController.php) | Created | Provides public product listings, filter metadata, product details, and paginated approved reviews. |
| [backend/app/Http/Controllers/CartController.php](backend/app/Http/Controllers/CartController.php) | Created | Exposes session bag retrieval, additions, quantity replacement, and item removal. |
| [backend/app/Http/Controllers/WishlistController.php](backend/app/Http/Controllers/WishlistController.php) | Created | Saves or removes a product using the authenticated user and Supabase RLS. Saving an existing entry is idempotent. |
| [backend/app/Http/Controllers/AuthController.php](backend/app/Http/Controllers/AuthController.php) | Modified | Returns the current CSRF token alongside the restored user, allowing later actions to reuse it. |
| [backend/app/Http/Middleware/AuthenticateSupabase.php](backend/app/Http/Middleware/AuthenticateSupabase.php) | Modified | Returns a session_missing error when there is no access token, allowing the client to skip unnecessary refresh requests. |
| [backend/app/Http/Requests/CatalogRequest.php](backend/app/Http/Requests/CatalogRequest.php) | Created | Validates search, category, color, size, collection, price range, availability, sorting, and pagination parameters. |
| [backend/app/Http/Requests/CartItemRequest.php](backend/app/Http/Requests/CartItemRequest.php) | Created | Validates a variant ID and an integer quantity from 1 to 99. |
| [backend/app/Repositories/CatalogRepository.php](backend/app/Repositories/CatalogRepository.php) | Created | Reads public products, categories, variants, images, and approved reviews through the existing Supabase client. Caches listing/category data for 30 seconds; product and cart lookups remain live. |
| [backend/app/Services/CatalogService.php](backend/app/Services/CatalogService.php) | Created | Calculates effective variant prices, stock flags, and review statistics; applies catalog search/filter/sort rules and pagination; supplies filter metadata and related products. |
| [backend/app/Services/CartService.php](backend/app/Services/CartService.php) | Created | Stores variant IDs and quantities in the server session, validates live availability, and recalculates integer-cent prices and subtotals from database values. |
| [backend/routes/catalog.php](backend/routes/catalog.php) | Created | Defines the public catalog listing, filter metadata, product detail, and review routes. |
| [backend/routes/cart.php](backend/routes/cart.php) | Created | Defines bag routes. Mutations use session locks to serialize changes from concurrent requests. |
| [backend/routes/account.php](backend/routes/account.php) | Modified | Adds the authenticated wishlist save/remove endpoint alongside the existing account routes. |
| [backend/routes/web.php](backend/routes/web.php) | Modified | Registers catalog and cart route groups. Keeps catalog reads stateless and preserves session protection on cart, account, and admin routes. Also received formatter changes. |
| [backend/bootstrap/app.php](backend/bootstrap/app.php) | Modified | Returns a safe catalog-specific error message for catalog service outages. |

## Frontend

| File | Change | Purpose |
| --- | --- | --- |
| [frontend/src/pages/CatalogPage.jsx](frontend/src/pages/CatalogPage.jsx) | Created | Renders /shop with a responsive grid, product count, category navigation, filters, sorting, URL-backed state, and pagination. |
| [frontend/src/pages/ProductDetailPage.jsx](frontend/src/pages/ProductDetailPage.jsx) | Created | Renders /products/:slug with the image gallery, shopping controls, reviews, related products, and a breadcrumb back to the originating filtered catalog. |
| [frontend/src/pages/CartPage.jsx](frontend/src/pages/CartPage.jsx) | Created | Renders /cart with live-priced bag items, quantity controls, removal, subtotal, stock warnings, and loading/error/empty states. |
| [frontend/src/components/CatalogFilters.jsx](frontend/src/components/CatalogFilters.jsx) | Created | Provides search, category, collection, color, size, price, and availability inputs, with apply and clear actions. |
| [frontend/src/components/ProductCard.jsx](frontend/src/components/ProductCard.jsx) | Created | Displays a database product's photo, name, category, price, options, stock, badges, detail link, and separate wishlist control. |
| [frontend/src/components/ProductGrid.jsx](frontend/src/components/ProductGrid.jsx) | Created | Shares the responsive two/three/four-column grid and loading skeletons between product listings. |
| [frontend/src/components/ProductImage.jsx](frontend/src/components/ProductImage.jsx) | Created | Renders a database image URL with meaningful alternative text, lazy loading, and an unavailable-image state for missing or failed images. |
| [frontend/src/components/ProductPurchase.jsx](frontend/src/components/ProductPurchase.jsx) | Created | Handles color, size, and quantity selection, variant pricing, stock display, bag submission, wishlist controls, and expandable product information. |
| [frontend/src/components/ProductReviews.jsx](frontend/src/components/ProductReviews.jsx) | Created | Loads and paginates approved database reviews, displaying ratings, dates, comments, and loading/error/empty states. |
| [frontend/src/components/WishlistButton.jsx](frontend/src/components/WishlistButton.jsx) | Created | Sends signed-in wishlist mutations, displays pending/saved/error states, and directs guests to login with a product return destination. |
| [frontend/src/components/StorefrontProvider.jsx](frontend/src/components/StorefrontProvider.jsx) | Created | Shares catalog metadata and the session bag across storefront components. Applies successful bag responses so the header count updates immediately. |
| [frontend/src/services/storefrontContext.js](frontend/src/services/storefrontContext.js) | Created | Defines the React context shared by the storefront provider and its consumers. |
| [frontend/src/hooks/useStorefront.js](frontend/src/hooks/useStorefront.js) | Created | Provides access to shared storefront metadata, bag state, and update/retry actions. |
| [frontend/src/components/CategoryCards.jsx](frontend/src/components/CategoryCards.jsx) | Modified | Replaces the fixed category array and imported category photos with database categories, product counts, and product image URLs. |
| [frontend/src/components/FeaturedProducts.jsx](frontend/src/components/FeaturedProducts.jsx) | Modified | Replaces hardcoded products and prices with the featured-products API and reusable product grid. |
| [frontend/src/components/Header.jsx](frontend/src/components/Header.jsx) | Modified | Loads category links from shared database metadata, links Shop to /shop, and displays a bag link with its item count. |
| [frontend/src/components/Footer.jsx](frontend/src/components/Footer.jsx) | Modified | Uses database-driven category links, links to the catalog/new arrivals, and connects sign-in and wishlist destinations. |
| [frontend/src/components/HeroSection.jsx](frontend/src/components/HeroSection.jsx) | Modified | Prioritizes the main hero image during loading and connects the primary shopping action to /shop. |
| [frontend/src/layouts/StorefrontLayout.jsx](frontend/src/layouts/StorefrontLayout.jsx) | Modified | Wraps public/customer pages in the storefront provider, resetting shared state when the authenticated user changes. |
| [frontend/src/routes/AppRoutes.jsx](frontend/src/routes/AppRoutes.jsx) | Modified | Registers /shop, /products/:slug, and /cart with lazy-loaded page modules and loading fallbacks. |
| [frontend/src/hooks/useApiResource.js](frontend/src/hooks/useApiResource.js) | Modified | Allows public requests to disable authentication refresh and prevents data/errors from an old path being shown for a new request. |
| [frontend/src/services/apiClient.js](frontend/src/services/apiClient.js) | Modified | Preserves API error codes, skips refresh when the server reports no session, and reuses returned CSRF tokens. Existing cookie and refresh behavior remains available. |
| [frontend/src/features/auth/authPaths.js](frontend/src/features/auth/authPaths.js) | Modified | Accepts safe product-detail return destinations after login, supporting guests who sign in from a wishlist action. |
| [frontend/src/pages/account/WishlistPage.jsx](frontend/src/pages/account/WishlistPage.jsx) | Modified | Links saved products to their detail pages, reuses product images, and adds database-backed removal controls. |

## Build and Dependency Configuration

| File | Change | Purpose |
| --- | --- | --- |
| [frontend/package.json](frontend/package.json) | Modified | Removed the test script and frontend test-only dependencies. |
| [frontend/package-lock.json](frontend/package-lock.json) | Modified | Synchronized the frontend dependency graph after removing test tools. |
| [frontend/vite.config.js](frontend/vite.config.js) | Modified | Removed Vitest settings and its deleted setup-file reference. |
| [backend/composer.json](backend/composer.json) | Modified | Removed test packages, the test script, and test-class autoloading. |
| [backend/composer.lock](backend/composer.lock) | Modified | Synchronized locked packages after removing the backend test tools. |

## Removed Files and Tooling

The cleanup removed the following files and folders at the user's request:

| Removed path | Reason |
| --- | --- |
| `backend/tests/` | Removed all backend test classes and the test base class. |
| `frontend/src/test/` | Removed frontend tests, fixtures, and test setup. |
| `backend/phpunit.xml` | Removed configuration for the deleted backend suite. |
| `backend/.phpunit.result.cache` | Removed generated test results. |
| `frontend/src/App.css` | Removed an unimported stylesheet containing comments only. |
| `frontend/src/assets/react.svg` | Removed an unused React starter logo. |
| `frontend/src/assets/vite.svg` | Removed an unused Vite starter logo. |
| `frontend/src/assets/hero.png` | Removed an unused image with no application references. |
| `frontend/public/icons.svg` | Removed an unused starter icon sheet. |
| `frontend/README.md` | Removed generic template documentation; the project README covers setup. |

Removed Vitest, jsdom, Testing Library, PHPUnit, Mockery, and their unused dependencies. Updated both package manifests and lockfiles, removed test scripts and test autoloading, and removed the Vite test configuration. The database-referenced product photos remain available.

## Documentation

| File | Change | Purpose |
| --- | --- | --- |
| [README.md](README.md) | Modified | Adds the project overview, actual stack/ports, environment setup, Docker/local startup, pages, verification commands, and current scope. |
| [FILE_GUIDE.md](FILE_GUIDE.md) | Created | Explains every repository file created or modified during the loading and catalog work in this conversation. |
| [backend/README.md](backend/README.md) | Modified | Documents catalog/cart/wishlist routes, validation, response shapes, pricing/stock behavior, caching, session storage, tests, and limitations. |

## Verification

The implementation was verified before cleanup with automated tests and desktop/mobile/tablet browser checks. The test files and tooling have now been removed.

Current verification uses the frontend production build and lint, Composer validation, Laravel route inspection, and live API/page checks. Two existing React effect warnings remain in AuthProvider.jsx and useApiResource.js.

## Current Limitations

- The bag stores selections in the encrypted Laravel server session; database cart tables are not used by this flow.
- Checkout, payment, and inventory reservation are unfinished.
- Catalog listing data is cached for 30 seconds and processed in Laravel. A larger catalog should move filtering/sorting into an indexed database view or RPC.
- Popularity sorting uses approved review count.
- Featured and new-arrival collections use existing product flags.
- The database currently contains seeded demo products with development image URLs.
- Care instructions and size measurements require actual product data; the interface does not invent them.
- Existing authentication, account/admin foundations, database schema, seeders, and configuration are dependencies of this work. Files from those earlier foundations are included above only where this conversation modified them.

Temporary browser-check scripts, screenshots, build output, dependency folders, and runtime caches are generated artifacts and are outside this source-file inventory.
