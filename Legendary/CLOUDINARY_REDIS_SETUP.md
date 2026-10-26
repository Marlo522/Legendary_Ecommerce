# Cloudinary and Redis setup for Legendary

The React storefront calls Laravel; Laravel talks to Supabase, Cloudinary, and Redis. Supabase continues to store accounts, orders, and product records. Cloudinary stores image files and serves their HTTPS URLs. Redis caches public catalog data and can optionally hold shared sessions.

## 1. Fix the account data error

The configured Supabase database returned HTTP 400, code `42703`: `column orders.deleted_at does not exist`. Recent order queries used that column before its schema update was applied.

Account/admin order reads now retry without that filter only for this exact missing-column error. Customer ownership filters, authorization, sorting, and pagination are retained. Databases that have the column keep excluding deleted orders. Other provider errors still surface as errors.

Complete the permanent database update:

1. Open your Supabase project, then **SQL Editor**.
2. If this is a new project, create the schema using [backend/database.md](backend/database.md). Preserve an existing database.
3. Apply [secure_auth_profiles.sql](backend/database/sql/secure_auth_profiles.sql) if not already applied.
4. Open [admin_management.sql](backend/database/sql/admin_management.sql), copy the whole script into SQL Editor, and run it. It adds `orders.deleted_at`, updates its read policy, and creates the transactional admin order functions. It is repeatable.
5. Verify in SQL Editor:

   ```sql
   SELECT column_name
   FROM information_schema.columns
   WHERE table_schema = 'public'
     AND table_name = 'orders'
     AND column_name = 'deleted_at';
   ```

6. Reload the account dashboard, My Orders, admin dashboard, and admin Orders. Order editing/deletion requires the full SQL update even though reads support the older schema.

Do not run `migrate:fresh` or the legacy Laravel migrations against your Supabase database. Redis and Cloudinary do not replace this database update.

## 2. Configure Cloudinary image storage

### Create the product environment and credentials

1. Create or sign in to your account at [Cloudinary](https://cloudinary.com/).
2. Select the product environment you want Legendary to use.
3. Open **Settings > API Keys**. Copy its **Cloud name**, **API Key**, and **API Secret**. See [Cloudinary's credential instructions](https://cloudinary.com/documentation/developer_onboarding_faq_find_credentials).
4. Edit your existing `backend/.env`. Add these values, replacing every placeholder:

   ```dotenv
   PRODUCT_IMAGE_STORAGE=cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLOUDINARY_FOLDER=legendary/products
   ```

   Keep these credentials in the backend. The frontend needs no Cloudinary environment variables. Keep `.env` out of Git.

5. From the project root, reload Laravel configuration:

   ```powershell
   docker compose exec backend php artisan config:clear
   ```

   For native PHP, run `php artisan config:clear` from `backend/`.

### Upload through the existing admin form

1. Sign in with an administrator account.
2. Open **Admin > Products**, then edit a saved product.
3. Under **Product images**, choose a JPEG, PNG, or WebP file of at most 5 MB.
4. Enter its description and display position, then click **Upload image**.
5. Laravel validates the file and sends a server-authenticated upload to Cloudinary. It saves the returned `secure_url` into Supabase `product_images.image_url`.
6. Confirm that the image appears in Cloudinary's Media Library and that the product image URL begins with `https://res.cloudinary.com/`. Open the storefront product page to check delivery.

Uploads use the existing Laravel HTTP client and [Cloudinary Upload API](https://cloudinary.com/documentation/upload_images). No Cloudinary SDK, unsigned upload preset, or frontend secret is required. Cloudinary public IDs start with `legendary/products/`; the Media Library's visual folder layout depends on your environment's folder mode.

If the database write fails after uploading, Laravel attempts to delete the new asset. A cleanup failure is recorded in Laravel's log without credentials. Removing a saved product image currently removes its database association; remove unused assets in Cloudinary's Media Library when desired.

### Existing images and local storage

Existing image URLs continue to work. Switching the setting affects new uploads and does not migrate previous files.

To use local uploads instead:

```dotenv
PRODUCT_IMAGE_STORAGE=local
APP_URL=http://localhost:8000
```

Run `docker compose exec backend php artisan config:clear` and `docker compose exec backend php artisan storage:link`. Local uploads require persistent `storage/app/public` and the public storage link. Cloudinary uploads do not need that link.

The Docker PHP configuration allows 5 MB uploads with an 8 MB request limit. Native PHP and any production reverse proxy need compatible upload/request limits too.

## 3. Set up local Redis with Docker (recommended on Windows)

The Compose file includes an optional `cache` profile with Redis, a health check, a persistent volume, and a port bound to this computer's loopback interface. The backend Dockerfile installs PhpRedis, Laravel's configured Redis client.

1. Start Docker Desktop with Linux containers enabled.
2. In `backend/.env`, set:

   ```dotenv
   CACHE_STORE=redis
   CACHE_PREFIX=legendary_cache_
   REDIS_CLIENT=phpredis
   REDIS_HOST=redis
   REDIS_USERNAME=null
   REDIS_PASSWORD=null
   REDIS_PORT=6379
   REDIS_SCHEME=tcp
   REDIS_DB=0
   REDIS_CACHE_DB=1
   SESSION_DRIVER=file
   ```

   Leave `REDIS_URL` unset for this local setup. The hostname `redis` resolves between Compose containers. Keep `SESSION_DRIVER=file` to change only caching.

3. From the project root, build and start the applications with Redis:

   ```powershell
   docker compose --profile cache up -d --build
   docker compose exec backend php artisan config:clear
   ```

4. Check Redis and the PHP extension:

   ```powershell
   docker compose --profile cache ps
   docker compose exec redis redis-cli ping
   docker compose exec backend php --ri redis
   ```

   Redis should be healthy, `ping` should return `PONG`, and PHP should report Redis support enabled.

5. Verify Laravel's actual cache connection:

   ```powershell
   docker compose exec backend php artisan tinker
   ```

   In Tinker, run:

   ```php
   config('cache.default'); // "redis"
   Cache::put('legendary_setup_check', 'working', 60);
   Cache::get('legendary_setup_check'); // "working"
   Cache::forget('legendary_setup_check');
   exit
   ```

6. Open the shop and categories. Existing catalog snapshots now use Redis automatically for their 30-second TTL. Product and inventory writes invalidate the product snapshot. Product details and shopping-bag stock checks continue to query Supabase directly.

Normal startup without `--profile cache` does not start a stopped Redis service. Use the profile whenever starting this configuration.

### Native PHP with the Docker Redis server

1. Start only Redis from the project root: `docker compose --profile cache up -d redis`.
2. Use `REDIS_HOST=127.0.0.1` in `backend/.env`.
3. Install/enable PhpRedis for the exact native PHP version, architecture, and thread-safety build you use. Confirm with `php --ri redis`.
4. Run `php artisan config:clear` and start Laravel from `backend/`.

The extension installed in the Docker image does not install an extension into Windows PHP. Running the backend in Docker avoids that separate Windows installation.

## 4. Use hosted Redis for deployment

1. Create a managed Redis database with your hosting provider or Redis Cloud.
2. Copy the endpoint, port, username, password, and TLS requirements from its connection settings. Use the provider's native Redis/TCP endpoint; Laravel's Redis client does not use an HTTP/REST API endpoint.
3. Configure the backend environment:

   ```dotenv
   CACHE_STORE=redis
   CACHE_PREFIX=legendary_production_cache_
   REDIS_CLIENT=phpredis
   REDIS_HOST=your_provider_hostname
   REDIS_PORT=your_provider_port
   REDIS_USERNAME=your_provider_username
   REDIS_PASSWORD="your_provider_password"
   REDIS_SCHEME=tls
   REDIS_DB=0
   REDIS_CACHE_DB=0
   ```

   The database index must match the provider. Many managed services support only database 0. If your provider supplies no username, use `REDIS_USERNAME=null`. Enable TLS when its endpoint requires TLS; keep certificate verification enabled. A provider-supplied `rediss://` connection URL may be used as `REDIS_URL` instead; it overrides matching host/credential/database values, so remove a stale URL when switching setups.

4. Ensure your deployed PHP runtime has PhpRedis. Use private networking or provider access restrictions for the Redis endpoint.
5. Run `php artisan config:clear`, then the same Tinker cache write/read/delete check above. For a production deployment that caches configuration, run `php artisan config:cache` after setting all environment values.
6. Your deployed backend uses hosted Redis directly; it does not need the local Compose Redis service.

For several Laravel instances, you may additionally set `SESSION_DRIVER=redis` and `SESSION_CONNECTION=default`, then reload configuration. Switching session stores signs current users out and resets session shopping bags. Choose Redis persistence and memory/eviction settings that retain sessions if you use Redis for them.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Account data unavailable | Apply the full Supabase SQL update above; inspect the failed API response and Laravel log. Missing tables, denied access, or an outage still require correcting the underlying issue. |
| Cloudinary upload returns 503 | Confirm all three backend credentials belong to the same Cloudinary environment, select `PRODUCT_IMAGE_STORAGE=cloudinary`, clear Laravel config, and check provider availability. |
| Image upload rejected or empty file | Use JPEG/PNG/WebP within 5 MB; check PHP `upload_max_filesize`, `post_max_size`, and reverse proxy request limits. |
| Class Redis not found | Rebuild the backend image or install PhpRedis in the native PHP runtime actually serving Laravel. |
| Redis connection refused | Start the cache profile; use `REDIS_HOST=redis` inside Docker and `127.0.0.1` for native PHP. |
| Redis authentication/TLS/database error | Check the provider's endpoint, username/password, scheme, supported database index, and any overriding `REDIS_URL`. |
| Configuration changes have no effect | Clear/rebuild Laravel's config cache in the serving environment and restart long-running workers if present. |

To return to file caching, set `CACHE_STORE=file` and clear configuration. If sessions were moved too, set `SESSION_DRIVER=file` before stopping Redis.

## Official references

- [Cloudinary credentials](https://cloudinary.com/documentation/developer_onboarding_faq_find_credentials)
- [Cloudinary upload authentication and responses](https://cloudinary.com/documentation/upload_images)
- [Cloudinary Upload API and asset deletion](https://cloudinary.com/documentation/image_upload_api_reference)
- [Laravel Redis configuration and clients](https://laravel.com/framework/docs/redis)
- [Redis on Docker](https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/docker/)
- [Redis Cloud TLS](https://redis.io/docs/latest/operate/rc/security/database-security/tls-ssl/)
