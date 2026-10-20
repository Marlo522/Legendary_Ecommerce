# Legendary Lifestyle backend

Laravel 13 with Supabase email/password authentication. Implemented: login, current-user lookup, refresh, and logout. Registration, recovery, and frontend integration are separate work; the frontend auth modal still uses simulated submissions.

Responsibilities: app/Http/Controllers handles HTTP, app/Http/Requests validates, app/Http/Middleware intercepts requests, app/Services handles authentication logic, app/Repositories queries profiles, app/Support handles Supabase HTTP, app/Models contains existing models, routes defines endpoints, and config holds settings. Login needs no additional database model or background job.

## Setup

1. Run composer install.
2. Copy .env.example only if .env does not exist. Run php artisan key:generate if APP_KEY is empty.
3. Set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and FRONTEND_URL. Only publishable or legacy anon keys are accepted for customer requests.
4. Create Supabase tables using database.md if needed. Apply database/sql/secure_auth_profiles.sql to existing databases in Supabase SQL editor. It prevents signup metadata and profile edits from granting admin privileges. Review previously created admin roles.
5. Enable Supabase email/password authentication. Create a test account and confirm its email. Keep email confirmation enabled in production.
6. Run php artisan serve --host=localhost --port=8000 and use http://localhost:5173 for the frontend. Do not mix localhost and 127.0.0.1 with cookies.

Use SESSION_DRIVER=file, SESSION_ENCRYPT=true, CACHE_STORE=file for one server. Supabase tokens stay in encrypted server storage; the HttpOnly cookie contains an encrypted session identifier. The local .env is ignored by Git.

Production requires HTTPS, APP_ENV=production, APP_DEBUG=false, SESSION_SECURE_COOKIE=true, and an exact HTTPS FRONTEND_URL. Protect APP_KEY and storage permissions. For multiple instances use shared Redis sessions/cache so locks and rate limits are shared. Configure trusted proxies explicitly. Keep frontend and API on the same site for SameSite=Lax cookies.

The legacy Laravel user migrations use integer IDs and password columns; Supabase uses UUID profiles linked to auth.users. Do not run those migrations against the Supabase schema. Login uses Supabase Auth and PostgREST and needs no local users, cache, or sessions database tables.

## API

All endpoints use /api/auth and Laravel web sessions with CSRF protection. Browser requests need Accept: application/json and credentials: 'include'.

| Method | Path | Authentication | Body | Success |
| --- | --- | --- | --- | --- |
| GET | /csrf | Public | None | 200: csrf_token |
| POST | /login | Public | email, password, optional boolean rememberMe | 200: message, user, csrf_token |
| GET | /me | Session | None | 200: user |
| POST | /refresh | Session refresh token | None | 200: user, csrf_token |
| POST | /logout | Optional session | None | 204, no body |

user includes only id, name, email, and role. Roles come from public.users, never request fields or user metadata. Protected customer routes must use AuthenticateSupabase; admin routes must additionally use EnsureAdmin.

Get /csrf first. Send its csrf_token as X-CSRF-TOKEN on POST requests. Login and refresh rotate both session ID and CSRF token; retain the returned csrf_token for later requests. Get /csrf again after logout. Never store passwords or Supabase tokens in localStorage.

~~~js
const base = 'http://localhost:8000/api/auth';
const csrf = await fetch(base + '/csrf', {
  credentials: 'include', headers: { Accept: 'application/json' },
}).then(response => response.json());
const response = await fetch(base + '/login', {
  method: 'POST',
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-CSRF-TOKEN': csrf.csrf_token,
  },
  body: JSON.stringify({ email, password, rememberMe: false }),
});
const result = await response.json();
// Check response.ok and retain result.csrf_token for later POST requests.
~~~

Sessions expire after SESSION_LIFETIME idle minutes (default 120). Without rememberMe, the cookie ends with the browser session. With rememberMe, it survives browser restarts up to the same idle timeout. On /me returning 401, POST /refresh once and retry /me. Rejected refresh tokens clear the session and require login. Session locks serialize authenticated requests to protect refresh-token rotation.

Errors have a message string. Validation: 422 with errors keyed by field (arrays of messages). Invalid credentials or sessions: 401. Missing profiles, invalid roles, untrusted origins, or forbidden admin access: 403. CSRF failure: 419. Throttling: 429 with Retry-After. Provider/configuration failure: 503 with a generic message. Unknown route: 404. Unsupported method: 405. No endpoint is paginated.

Login permits five attempts per minute per email/IP and thirty per minute per IP; the auth group permits sixty requests per minute. Configure Supabase's own auth limits too, because its public Auth API can be called directly.

Logout revokes the current Supabase session and always clears local state. Provider outages return 503 after cleanup because remote revocation could not be confirmed. Already-issued Supabase access JWTs remain valid until expiry; configure a suitably short JWT lifetime.

## Verification

Run `composer validate --no-check-publish` and `php artisan route:list --path=api --except-vendor` from `backend/`. Check `/api/catalog/products`, `/api/catalog/filters`, and `/api/cart` against the running backend, and verify login/logout with a dedicated account. Automated test suites and their configuration were removed during cleanup.

## Demo data and login accounts

After applying secure_auth_profiles.sql, rotate the secret previously exposed in database.md if you have not already done so. Use the new server-only secret for seeding. Make sure the complete schema in database.md exists and email/password authentication is enabled.

Set these in backend/.env for your development Supabase project:

~~~dotenv
APP_ENV=local
DEMO_SEED_ENABLED=true
SUPABASE_SECRET_KEY=YOUR_ROTATED_SERVER_ONLY_SECRET
DEMO_ADMIN_EMAIL=admin@legendary.test
DEMO_ADMIN_PASSWORD="YOUR_UNIQUE_ADMIN_PASSWORD"
DEMO_CUSTOMER_EMAIL=customer@legendary.test
DEMO_CUSTOMER_PASSWORD="YOUR_UNIQUE_CUSTOMER_PASSWORD"
~~~

Choose different strong passwords with at least 12 characters. These are placeholders, not built-in credentials. Do not commit .env or put the secret in frontend environment variables.

From backend run:

~~~sh
php artisan config:clear
php artisan db:seed
php artisan serve --host=localhost --port=8000
~~~

Do not run migrate:fresh or the legacy migrations against the Supabase schema. The seeders use the Supabase Admin Auth API and PostgREST, so a local PostgreSQL PHP driver/database connection is not required.

One seeder is provided for each of the 15 application tables. DatabaseSeeder runs them in dependency order. It creates:

- Two confirmed Supabase Auth accounts and their public.users profiles: an admin and a customer.
- Three categories, three demo products, five variants, and three images using existing development assets.
- A customer address, cart and items, discount, completed mock order and items, clearly marked demo review, wishlist entry, and saved look with three items.

These are confirmed accounts ready to log in; no user session is created by seeding. In Supabase check Authentication > Users for both emails, then Table Editor > users for their matching UUIDs and roles. Test them with the /api/auth CSRF/login flow above. The frontend auth modal still needs API integration.

Rerunning updates the reserved demo rows and resets only marked demo accounts to the configured passwords. It does not truncate tables. It refuses to reuse any existing account without the server-controlled legendary_demo_seed app_metadata marker, so it cannot promote or reset a normal customer's account. Use unused demo emails if it reports a collision.

The seeders require console execution, APP_ENV=local/testing, and DEMO_SEED_ENABLED=true. Production is rejected even with --force. Run one seed process at a time against a development project. Calls commit independently; if a request fails, earlier rows remain and you can rerun to finish. Demo products, mock payments, review content, and development image URLs must not be seeded into a live store.

To seed only accounts, run php artisan db:seed --class=UserSeeder. Other individual seeders require their parent data to exist. The Supabase trigger initially assigns customer to every new profile; the trusted seeder assigns the requested profile role afterward without trusting signup metadata.

After seeding, set DEMO_SEED_ENABLED=false, remove the privileged secret from the runtime environment if it is not otherwise needed, and run php artisan config:clear again. Login continues to use only the publishable key. Do not rerun the already-applied schema or auth-security patch just to seed data.


## Public catalog and product details

The React storefront uses Laravel and Supabase PostgREST with the publishable key. No direct PostgreSQL connection or new schema is required. Catalog queries always restrict products to `status=active`, variants to `is_active=true`, and review statistics to approved reviews, including when an administrator browses the public shop. Public responses contain no customer profile data.

| Method | Path | Access | Response |
| --- | --- | --- | --- |
| GET | /api/catalog/products | Public | `data: Product[], meta: {page, per_page, total, last_page}` |
| GET | /api/catalog/filters | Public | `data: {categories, colors, sizes, max_price}` |
| GET | /api/catalog/products/{slug} | Public | `data: Product`, including images, active variants, review statistics, and related products |
| GET | /api/catalog/products/{slug}/reviews | Public | Approved reviews with pagination; 6 reviews per page |

Listing parameters: `q` (name, description, category), category slug, color, size, `min_price`, `max_price`, `availability=in-stock|out-of-stock`, `collection=featured|new-arrivals`, `sort=newest|price_asc|price_desc|popularity|name`, page, and per_page (1–50, default 12). Color, size, price, and availability must match the same active variant. Price sorting uses the lowest variant price. Popularity means approved review count, not sales volume. Collection filters use the existing product flags; no collection records are invented.

Listing snapshots fetch public product data in batches and cache it on the Laravel server for 30 seconds. Filtering, derived-price sorting, and response pagination use this snapshot. This suits the current small catalog; larger catalogs should move these operations into an indexed database view or RPC. Details, reviews, and cart stock checks query Supabase directly. Cart checks never trust cached stock or browser prices.

The homepage category cards and featured products, header/footer category links, /shop, and /products/{slug} use database data. Search and filters remain in the URL, and the product breadcrumb preserves the originating filtered catalog. Missing photos, descriptions, care instructions, measurements, and reviews are shown honestly. Current seeded demo rows and their development image URLs remain database content; replace them with actual products and public production image URLs before launch.

Invalid input returns 422 with field errors; unavailable, draft, and archived products return 404; provider failures return a safe 503 message. Public browsing does not require login. Catalog routes are stateless; cart and wishlist mutations use the existing CSRF/session protection.

## Product shopping actions

| Method | Path | Access | Body / response |
| --- | --- | --- | --- |
| GET | /api/cart | Guest or signed-in session | `data: {items, count, subtotal, unavailable_items}` |
| POST | /api/cart/items | Guest or signed-in session | variant_id, quantity; adds to the existing quantity |
| POST | /api/cart/quantity | Guest or signed-in session | variant_id, quantity; replaces the quantity |
| POST | /api/cart/items/{variant}/remove | Guest or signed-in session | Removes the session item |
| POST | /api/account/wishlist | Signed-in session | slug, saved (boolean); returns `data: {saved}` |

The initial bag at /cart stores variant IDs and quantities in the encrypted Laravel server session. It does not write to the database cart tables. Every cart response calculates prices and subtotals on the server from current database variants; price overrides take precedence over product sale/base prices. Quantities must be integers from 1 to 99 and cannot exceed live stock, including repeated additions. The bag accepts at most 50 distinct variants. Checkout, payment, and inventory reservation are outside this catalog implementation.

Wishlist writes use the authenticated user ID and access token, with Supabase RLS enforcement. Saving is idempotent and removal is scoped to the authenticated user. Guests are sent to login and return to the product after signing in.

For verification, run `composer validate --no-check-publish` and inspect routes with `php artisan route:list --path=api --except-vendor`. In frontend, run `npm run lint` and `npm run build`, then check the running storefront.
