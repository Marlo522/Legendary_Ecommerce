# Legendary Lifestyle — Database Schema & Supabase Setup Guide

This document contains:
1. **The Complete SQL Schema (`CREATE TABLE ...`)** ready to paste into the Supabase SQL Editor.
2. **Step-by-Step Supabase Authentication Setup**.
3. **Exact `.env` Configuration** to connect both Laravel backend and React frontend.

---

## Part 1: Complete PostgreSQL Schema (Supabase SQL)

Copy and run this entire script directly in **Supabase Dashboard → SQL Editor → New Query → Run**.

```sql
-- ========================================================
-- 1. ENUMS & EXTENSIONS
-- ========================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================
-- 2. USERS (Profiles linked to Supabase auth.users)
-- ========================================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    phone VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automatic trigger: When a user signs up in Supabase Auth,
-- automatically insert a profile row into public.users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
        'customer'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ========================================================
-- 3. ADDRESSES (Saved delivery addresses)
-- ========================================================
CREATE TABLE public.addresses (
    id BIGSERIAL PRIMARY KEY,                   
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    label VARCHAR(100),
    recipient_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(10) NOT NULL DEFAULT 'PH',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON public.addresses(user_id);

-- ========================================================
-- 4. CATEGORIES (T-shirts, Caps, Tote Bags)
-- ========================================================
CREATE TABLE public.categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================
-- 5. PRODUCTS
-- ========================================================
CREATE TABLE public.products (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    material VARCHAR(255),
    care_instructions TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'archived')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_featured ON public.products(is_featured, status);
CREATE INDEX idx_products_new_arrival ON public.products(is_new_arrival, status);

-- ========================================================
-- 6. PRODUCT VARIANTS (Colors, Sizes, Inventory)
-- ========================================================
CREATE TABLE public.product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    color VARCHAR(100) NOT NULL,
    color_hex VARCHAR(20),
    size VARCHAR(20),
    sku VARCHAR(100) UNIQUE NOT NULL,
    price_override DECIMAL(10, 2),
    stock_quantity INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 5,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_active ON public.product_variants(product_id, is_active);

-- ========================================================
-- 7. PRODUCT IMAGES
-- ========================================================
CREATE TABLE public.product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product_order ON public.product_images(product_id, display_order);

-- ========================================================
-- 8. DISCOUNTS (Promotions & Coupons)
-- ========================================================
CREATE TABLE public.discounts (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value DECIMAL(10, 2) NOT NULL,
    min_order_value DECIMAL(10, 2),
    max_discount_amount DECIMAL(10, 2),
    usage_limit INT,
    usage_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_discounts_code ON public.discounts(code);
CREATE INDEX idx_discounts_active ON public.discounts(is_active);

-- ========================================================
-- 9. CARTS & CART ITEMS
-- ========================================================
CREATE TABLE public.carts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_carts_user_id ON public.carts(user_id);
CREATE INDEX idx_carts_session_id ON public.carts(session_id);

CREATE TABLE public.cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_variant_id BIGINT NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(cart_id, product_variant_id)
);

-- ========================================================
-- 10. ORDERS & ORDER ITEMS
-- ========================================================
CREATE TABLE public.orders (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'packed', 'shipped', 'completed', 'cancelled')),
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    discount_id BIGINT REFERENCES public.discounts(id) ON DELETE SET NULL,
    guest_email VARCHAR(255),
    guest_name VARCHAR(255),
    guest_phone VARCHAR(50),
    shipping_address JSONB NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);

CREATE TABLE public.order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_variant_id BIGINT NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    variant_label VARCHAR(255) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

-- ========================================================
-- 11. REVIEWS (Ratings & Comments)
-- ========================================================
CREATE TABLE public.reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    order_id BIGINT REFERENCES public.orders(id) ON DELETE SET NULL,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, user_id, order_id)
);

CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_status ON public.reviews(status);

-- ========================================================
-- 12. WISHLIST ITEMS
-- ========================================================
CREATE TABLE public.wishlist_items (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlist_user_id ON public.wishlist_items(user_id);

-- ========================================================
-- 13. LOOKS (Build Your Look)
-- ========================================================
CREATE TABLE public.looks (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    name VARCHAR(255),
    color_match_label VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_looks_user_id ON public.looks(user_id);
CREATE INDEX idx_looks_session_id ON public.looks(session_id);

CREATE TABLE public.look_items (
    id BIGSERIAL PRIMARY KEY,
    look_id BIGINT NOT NULL REFERENCES public.looks(id) ON DELETE CASCADE,
    product_variant_id BIGINT NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    category_slot VARCHAR(50) NOT NULL CHECK (category_slot IN ('tshirt', 'cap', 'tote_bag')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(look_id, category_slot)
);

CREATE INDEX idx_look_items_look_id ON public.look_items(look_id);

-- ========================================================
-- 14. ROW LEVEL SECURITY (RLS) & ROLE-BASED ACCESS CONTROL (RBAC)
-- ========================================================

-- Enable RLS on every table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.looks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.look_items ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- RBAC Helper Function: Check if the current user is an Admin
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- --------------------------------------------------------
-- Policies: users
-- --------------------------------------------------------
-- Users can view and edit their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- --------------------------------------------------------
-- Protect role and identity columns on profile updates.
REVOKE UPDATE ON public.users FROM PUBLIC, anon, authenticated;
GRANT UPDATE (name, phone, avatar_url, updated_at) ON public.users TO authenticated;

-- Policies: addresses
-- --------------------------------------------------------
CREATE POLICY "Users manage own addresses" ON public.addresses
    FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- --------------------------------------------------------
-- Policies: categories
-- --------------------------------------------------------
-- Anyone (guests + buyers) can view categories
CREATE POLICY "Public can view categories" ON public.categories
    FOR SELECT USING (true);

-- Only admins can create, update, delete categories
CREATE POLICY "Admins manage categories" ON public.categories
    FOR ALL USING (public.is_admin());

-- --------------------------------------------------------
-- Policies: products
-- --------------------------------------------------------
-- Public can view active products; Admins see everything (draft, active, archived)
CREATE POLICY "Public can view active products" ON public.products
    FOR SELECT USING (status = 'active' OR public.is_admin());

CREATE POLICY "Admins manage products" ON public.products
    FOR ALL USING (public.is_admin());

-- --------------------------------------------------------
-- Policies: product_variants
-- --------------------------------------------------------
CREATE POLICY "Public can view active variants" ON public.product_variants
    FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage product variants" ON public.product_variants
    FOR ALL USING (public.is_admin());

-- --------------------------------------------------------
-- Policies: product_images
-- --------------------------------------------------------
CREATE POLICY "Public can view product images" ON public.product_images
    FOR SELECT USING (true);

CREATE POLICY "Admins manage product images" ON public.product_images
    FOR ALL USING (public.is_admin());

-- --------------------------------------------------------
-- Policies: discounts
-- --------------------------------------------------------
CREATE POLICY "Public can view active discounts" ON public.discounts
    FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage discounts" ON public.discounts
    FOR ALL USING (public.is_admin());

-- --------------------------------------------------------
-- Policies: carts & cart_items
-- --------------------------------------------------------
CREATE POLICY "Users manage own cart" ON public.carts
    FOR ALL USING (auth.uid() = user_id OR session_id IS NOT NULL OR public.is_admin());

CREATE POLICY "Users manage own cart items" ON public.cart_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_items.cart_id
            AND (carts.user_id = auth.uid() OR carts.session_id IS NOT NULL OR public.is_admin())
        )
    );

-- --------------------------------------------------------
-- Policies: orders & order_items
-- --------------------------------------------------------
-- Buyers view their own orders; Admins view all orders
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can place orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins manage orders" ON public.orders
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (orders.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Users can insert order items" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
        )
    );

-- --------------------------------------------------------
-- Policies: reviews
-- --------------------------------------------------------
-- Everyone can read approved reviews
CREATE POLICY "Public can view approved reviews" ON public.reviews
    FOR SELECT USING (status = 'approved' OR public.is_admin() OR auth.uid() = user_id);

-- Logged-in customers can submit reviews
CREATE POLICY "Users can submit reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only admins can moderate/update review status
CREATE POLICY "Admins moderate reviews" ON public.reviews
    FOR ALL USING (public.is_admin());

-- --------------------------------------------------------
-- Policies: wishlist_items
-- --------------------------------------------------------
CREATE POLICY "Users manage own wishlist" ON public.wishlist_items
    FOR ALL USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- Policies: looks & look_items (Build Your Look)
-- --------------------------------------------------------
CREATE POLICY "Users manage own looks" ON public.looks
    FOR ALL USING (auth.uid() = user_id OR session_id IS NOT NULL OR public.is_admin());

CREATE POLICY "Users manage own look items" ON public.look_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.looks
            WHERE looks.id = look_items.look_id
            AND (looks.user_id = auth.uid() OR looks.session_id IS NOT NULL OR public.is_admin())
        )
    );
```

---

## Part 2: Step-by-Step Supabase Authentication Setup

### Step 1: Enable Email / Password Provider
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project (**fpqdpqnzyxizdvrwytfp**).
3. Navigate to **Authentication** (left sidebar) → **Providers**.
4. Click on **Email**:
   - Ensure **Enable Email provider** is turned **ON**.
   - **Confirm email**:
     - *For local development / testing*: Turn **OFF** (users can log in immediately after registration without verifying email first).
     - *For production*: Turn **ON**.

### Step 2: Configure Redirect URLs
1. In **Authentication** → **URL Configuration**:
   - **Site URL**: `http://localhost:5173` (your Vite React frontend).
   - **Redirect URLs**: Add:
     - `http://localhost:5173/**`
     - `http://127.0.0.1:8000/**`

### Step 3: Setting Up Buyer vs Seller / Admin Roles
By default, every new user who signs up gets `role = 'customer'` automatically via the `on_auth_user_created` trigger.

To make an account an **Admin / Seller**:
1. Have the user sign up on your app (or create them in **Authentication → Users → Add User**).
2. Go to **Table Editor** → select `users`.
3. Locate the user's row and change the `role` field from `customer` to `admin`.
4. Or run this SQL query in the **SQL Editor**:
   ```sql
   UPDATE public.users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
   ```

---

## Part 3: What to Put in Your `.env`

### 1. Backend `.env` (`backend/.env`)

In Supabase, find your database connection credentials under:
**Project Settings** (gear icon) → **Database** → **Connection parameters** (or **Connection string** → **Session pooler**).

Update your `backend/.env` with these exact keys:

```dotenv
# ========================================================
# SUPABASE POSTGRESQL DATABASE CONNECTION
# ========================================================
DB_CONNECTION=pgsql
# IMPORTANT: Use your Supabase host (NOT 127.0.0.1)
# Direct connection host: db.<project-ref>.supabase.co
# Pooler host (recommended): aws-0-<region>.pooler.supabase.com
DB_HOST=db.fpqdpqnzyxizdvrwytfp.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=YOUR_SUPABASE_DATABASE_PASSWORD
DB_SSLMODE=require

# ========================================================
# SUPABASE API & AUTHENTICATION KEYS
# ========================================================
# Found in Project Settings -> API
SUPABASE_URL=https://fpqdpqnzyxizdvrwytfp.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_qjKIT_kEcHRo_Wa5T_pLAQ_mBJN0pAp
SUPABASE_SECRET_KEY=YOUR_SERVER_ONLY_SECRET_KEY
SUPABASE_JWKS_URL=https://fpqdpqnzyxizdvrwytfp.supabase.co/auth/v1/.well-known/jwks.json
```

> [!TIP]
> **Database Host & Port**:
> - If your network supports IPv6: `DB_HOST=db.fpqdpqnzyxizdvrwytfp.supabase.co`, `DB_PORT=5432`, `DB_USERNAME=postgres`.
> - If your network is IPv4-only, Supabase provides a **Connection Pooler** (Session mode on port 5432 or Transaction mode on port 6543) under **Database Settings → Connection pooling**. The username will look like `postgres.fpqdpqnzyxizdvrwytfp`.

---

### 2. Frontend `.env` (`frontend/.env`)

Create or update `frontend/.env` to connect React directly to Supabase Auth and the Laravel backend:

```dotenv
# Laravel API Base URL
VITE_API_BASE_URL=http://127.0.0.1:8000/api

# Supabase Auth Client Credentials
VITE_SUPABASE_URL=https://fpqdpqnzyxizdvrwytfp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_qjKIT_kEcHRo_Wa5T_pLAQ_mBJN0pAp
```


## Laravel login API

The API uses Supabase Auth and PostgREST with encrypted Laravel server sessions. Customer authentication does not use the secret/service-role key. See README.md for setup and API contracts.

Apply database/sql/secure_auth_profiles.sql to existing databases in Supabase SQL editor. The corrected schema above gives new databases the same protections. Audit existing admin roles if the previous signup trigger was used; this patch does not change existing accounts.

A secret key previously appeared in this tracked guide. Rotate it in Supabase and update legitimate server consumers; deleting it here does not remove it from Git history.

The legacy Laravel migrations use integer user IDs and password columns rather than this schema's UUID profiles linked to auth.users. Do not run those migrations against the Supabase schema. Login does not need local user, cache, or session database tables.

The frontend example above applies to direct Supabase clients. For Laravel cookie sessions use VITE_API_BASE_URL=http://localhost:8000/api, credentials: 'include', and the CSRF flow in README.md. Use the same hostname for frontend and backend during development.
