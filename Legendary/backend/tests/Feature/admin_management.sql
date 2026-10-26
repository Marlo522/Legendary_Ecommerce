-- Run with psql -v ON_ERROR_STOP=1 against a disposable copy of the Supabase schema.
BEGIN;

INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES ('a0000000-0000-4000-8000-000000000001', 'admin@example.test', '{"name":"Admin"}'),
       ('b0000000-0000-4000-8000-000000000001', 'buyer@example.test', '{"name":"Buyer"}');
UPDATE public.users SET role = 'admin' WHERE email = 'admin@example.test';
SELECT set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-000000000001', true);
INSERT INTO public.categories (id, name, slug) VALUES (1, 'T-shirts', 't-shirts');
INSERT INTO public.products (id, category_id, name, slug, base_price, sale_price, status)
VALUES (1, 1, 'Everyday tee', 'everyday-tee', 500, 450, 'active');
INSERT INTO public.product_variants (id, product_id, color, size, sku, price_override, stock_quantity)
VALUES (1, 1, 'Black', 'M', 'TEE-BLK-M', NULL, 10), (2, 1, 'White', 'M', 'TEE-WHT-M', 250, 7);

CREATE FUNCTION pg_temp.check_result(condition boolean, message text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    IF condition IS DISTINCT FROM true THEN
        RAISE EXCEPTION 'Assertion failed: %', message;
    END IF;
END;
$$;

DO $$
<<admin_save_order_test>>
DECLARE
    payload jsonb := '{
        "guest_name":"Buyer","guest_email":"buyer@example.test","guest_phone":"09123456789",
        "shipping_address":{"recipient_name":"Buyer","phone":"09123456789","address_line_1":"1 Test Street","city":"Manila","province":"Metro Manila","postal_code":"1000","country":"PH"},
        "status":"pending","payment_method":"Cash on delivery","payment_status":"pending",
        "shipping_fee":50,"discount_amount":100,
        "items":[{"variant_id":1,"quantity":2},{"variant_id":2,"quantity":3}]
    }';
    order_id bigint;
    other_id bigint;
    stamp timestamptz;
    before_count bigint;
    changed jsonb;
BEGIN
    order_id := public.admin_save_order(NULL, payload);
    PERFORM pg_temp.check_result((SELECT subtotal = 1650 AND total = 1600 FROM public.orders WHERE id = order_id), 'authoritative sale and variant prices, shipping, discount');
    PERFORM pg_temp.check_result((SELECT stock_quantity = 8 FROM public.product_variants WHERE id = 1), 'initial reservation');
    PERFORM pg_temp.check_result((SELECT stock_quantity = 4 FROM public.product_variants WHERE id = 2), 'second variant reservation');
    PERFORM pg_temp.check_result((SELECT count(*) = 2 FROM public.order_items WHERE order_items.order_id = admin_save_order_test.order_id), 'order item snapshots');

    SELECT count(*) INTO before_count FROM public.orders;
    BEGIN
        PERFORM public.admin_save_order(NULL, jsonb_set(payload, '{items}', '[{"variant_id":1,"quantity":1},{"variant_id":2,"quantity":99}]'));
        RAISE EXCEPTION 'Expected stock validation';
    EXCEPTION WHEN SQLSTATE 'P0001' THEN
        IF SQLERRM NOT LIKE 'Insufficient stock%' THEN RAISE; END IF;
    END;
    PERFORM pg_temp.check_result((SELECT count(*) = before_count FROM public.orders), 'failed multi-item order leaves no order');
    PERFORM pg_temp.check_result((SELECT stock_quantity = 8 FROM public.product_variants WHERE id = 1), 'failed order rolls back earlier stock changes');

    SELECT updated_at INTO stamp FROM public.orders WHERE id = order_id;
    BEGIN
        PERFORM public.admin_save_order(order_id, payload, stamp - interval '1 second');
        RAISE EXCEPTION 'Expected stale version rejection';
    EXCEPTION WHEN SQLSTATE '40001' THEN NULL;
    END;
    PERFORM pg_temp.check_result((SELECT stock_quantity = 8 FROM public.product_variants WHERE id = 1), 'stale write has no stock effect');

    UPDATE public.products SET sale_price = 400 WHERE id = 1;
    changed := jsonb_set(payload, '{items}', '[{"variant_id":1,"quantity":3}]');
    PERFORM public.admin_save_order(order_id, changed, stamp);
    PERFORM pg_temp.check_result((SELECT subtotal = 1350 AND total = 1300 FROM public.orders WHERE id = order_id), 'existing unit price remains a historical snapshot');
    PERFORM pg_temp.check_result((SELECT stock_quantity = 7 FROM public.product_variants WHERE id = 1), 'editing quantities applies net stock difference');
    PERFORM pg_temp.check_result((SELECT stock_quantity = 7 FROM public.product_variants WHERE id = 2), 'removed item is restocked');

    SELECT updated_at INTO stamp FROM public.orders WHERE id = order_id;
    changed := jsonb_set(changed, '{status}', '"cancelled"');
    PERFORM public.admin_save_order(order_id, changed, stamp);
    PERFORM pg_temp.check_result((SELECT stock_quantity = 10 FROM public.product_variants WHERE id = 1), 'cancellation restores reserved stock');
    SELECT updated_at INTO stamp FROM public.orders WHERE id = order_id;
    PERFORM public.admin_save_order(order_id, changed, stamp);
    PERFORM pg_temp.check_result((SELECT stock_quantity = 10 FROM public.product_variants WHERE id = 1), 'repeated cancellation does not restock twice');

    SELECT updated_at INTO stamp FROM public.orders WHERE id = order_id;
    BEGIN
        PERFORM public.admin_save_order(order_id, jsonb_set(changed, '{status}', '"pending"'), stamp);
        RAISE EXCEPTION 'Expected cancelled status protection';
    EXCEPTION WHEN SQLSTATE 'P0001' THEN
        IF SQLERRM <> 'This order status transition is not allowed.' THEN RAISE; END IF;
    END;
    PERFORM public.admin_delete_order(order_id, stamp);
    PERFORM pg_temp.check_result((SELECT deleted_at IS NOT NULL FROM public.orders WHERE id = order_id), 'deletion retains order for reporting');
    PERFORM pg_temp.check_result((SELECT stock_quantity = 10 FROM public.product_variants WHERE id = 1), 'deleting cancelled order does not restock again');

    changed := jsonb_set(payload, '{items}', '[{"variant_id":1,"quantity":1}]');
    changed := jsonb_set(changed, '{discount_amount}', '0');
    other_id := public.admin_save_order(NULL, changed);
    SELECT updated_at INTO stamp FROM public.orders WHERE id = other_id;
    PERFORM public.admin_delete_order(other_id, stamp);
    PERFORM pg_temp.check_result((SELECT stock_quantity = 10 FROM public.product_variants WHERE id = 1), 'deleting unpaid pending order restores stock');

    changed := jsonb_set(changed, '{payment_status}', '"paid"');
    other_id := public.admin_save_order(NULL, changed);
    SELECT updated_at INTO stamp FROM public.orders WHERE id = other_id;
    BEGIN
        PERFORM public.admin_delete_order(other_id, stamp);
        RAISE EXCEPTION 'Expected paid-order retention';
    EXCEPTION WHEN SQLSTATE 'P0001' THEN
        IF SQLERRM NOT LIKE 'Only unpaid%' THEN RAISE; END IF;
    END;
    BEGIN
        PERFORM public.admin_save_order(other_id, jsonb_set(changed, '{items}', '[{"variant_id":1,"quantity":2}]'), stamp);
        RAISE EXCEPTION 'Expected paid item protection';
    EXCEPTION WHEN SQLSTATE 'P0001' THEN
        IF SQLERRM NOT LIKE 'Items and amounts cannot change%' THEN RAISE; END IF;
    END;
    BEGIN
        PERFORM public.admin_save_order(other_id, jsonb_set(changed, '{payment_status}', '"pending"'), stamp);
        RAISE EXCEPTION 'Expected payment downgrade protection';
    EXCEPTION WHEN SQLSTATE 'P0001' THEN
        IF SQLERRM <> 'This payment status transition is not allowed.' THEN RAISE; END IF;
    END;

    BEGIN
        PERFORM public.admin_save_order(NULL, jsonb_set(payload, '{discount_amount}', '999999'));
        RAISE EXCEPTION 'Expected discount validation';
    EXCEPTION WHEN SQLSTATE 'P0001' THEN
        IF SQLERRM NOT LIKE 'Discount must not exceed%' THEN RAISE; END IF;
    END;
    PERFORM pg_temp.check_result((SELECT stock_quantity = 9 FROM public.product_variants WHERE id = 1), 'invalid discount rolls back all reservations');

    BEGIN
        PERFORM public.admin_save_order(NULL, jsonb_set(payload, '{items}', '[{"variant_id":1,"quantity":-1}]'));
        RAISE EXCEPTION 'Expected negative quantity validation';
    EXCEPTION WHEN SQLSTATE 'P0001' THEN
        IF SQLERRM NOT LIKE 'Select distinct variants%' THEN RAISE; END IF;
    END;
    BEGIN
        PERFORM public.admin_save_order(NULL, jsonb_set(payload, '{items}', '[{"variant_id":1,"quantity":1},{"variant_id":1,"quantity":1}]'));
        RAISE EXCEPTION 'Expected duplicate variant validation';
    EXCEPTION WHEN SQLSTATE 'P0001' THEN
        IF SQLERRM NOT LIKE 'Select distinct variants%' THEN RAISE; END IF;
    END;
    UPDATE public.product_variants SET is_active = false WHERE id = 2;
    BEGIN
        PERFORM public.admin_save_order(NULL, jsonb_set(payload, '{items}', '[{"variant_id":2,"quantity":1}]'));
        RAISE EXCEPTION 'Expected inactive variant validation';
    EXCEPTION WHEN SQLSTATE 'P0001' THEN
        IF SQLERRM <> 'A selected variant is inactive or archived.' THEN RAISE; END IF;
    END;

    PERFORM set_config('request.jwt.claim.sub', 'b0000000-0000-4000-8000-000000000001', true);
    BEGIN
        PERFORM public.admin_save_order(NULL, payload);
        RAISE EXCEPTION 'Expected customer denial';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
        PERFORM public.admin_delete_order(other_id, stamp);
        RAISE EXCEPTION 'Expected customer delete denial';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
END;
$$;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA auth TO authenticated;
SELECT pg_temp.check_result(NOT has_function_privilege('anon', 'public.admin_save_order(bigint,jsonb,timestamptz)', 'EXECUTE'), 'anonymous cannot call order writes');
SELECT pg_temp.check_result(has_function_privilege('authenticated', 'public.admin_save_order(bigint,jsonb,timestamptz)', 'EXECUTE'), 'authenticated role may reach the checked function');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'b0000000-0000-4000-8000-000000000001', true);
SELECT pg_temp.check_result((SELECT count(*) = 0 FROM public.orders), 'customer cannot read guest orders');
SELECT set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-000000000001', true);
SELECT pg_temp.check_result((SELECT count(*) = 1 FROM public.orders), 'admin lists exclude deleted retained orders');
RESET ROLE;

ROLLBACK;
SELECT 'Admin order transaction assertions passed.' AS result;
