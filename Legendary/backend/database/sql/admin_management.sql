-- Apply after database.md and secure_auth_profiles.sql in Supabase SQL editor.
BEGIN;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_stock_nonnegative' AND conrelid = 'public.product_variants'::regclass) THEN
        ALTER TABLE public.product_variants ADD CONSTRAINT admin_stock_nonnegative CHECK (stock_quantity >= 0 AND low_stock_threshold >= 0 AND (price_override IS NULL OR price_override >= 0)) NOT VALID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_prices_valid' AND conrelid = 'public.products'::regclass) THEN
        ALTER TABLE public.products ADD CONSTRAINT admin_prices_valid CHECK (base_price >= 0 AND (sale_price IS NULL OR (sale_price >= 0 AND sale_price <= base_price))) NOT VALID;
    END IF;
END;
$$;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT
USING (deleted_at IS NULL AND (auth.uid() = user_id OR public.is_admin()));

CREATE OR REPLACE FUNCTION public.admin_save_order(
    p_order_id bigint, p_payload jsonb, p_expected_updated_at timestamptz DEFAULT NULL
) RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    previous public.orders%ROWTYPE;
    variant record;
    line record;
    old_line public.order_items%ROWTYPE;
    result_id bigint;
    desired_status text := p_payload->>'status';
    shipping numeric := (p_payload->>'shipping_fee')::numeric;
    discount numeric := (p_payload->>'discount_amount')::numeric;
    calculated_subtotal numeric := 0;
    calculated_unit_price numeric;
    old_quantity integer;
    desired_quantity integer;
    locked boolean := false;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'This action is not allowed.' USING ERRCODE = '42501';
    END IF;
    IF desired_status IS NULL OR desired_status NOT IN ('pending','confirmed','packed','shipped','completed','cancelled')
       OR shipping IS NULL OR shipping < 0 OR shipping > 999999.99 OR shipping <> round(shipping, 2)
       OR discount IS NULL OR discount < 0 OR discount > 99999999.99 OR discount <> round(discount, 2)
       OR jsonb_typeof(p_payload->'items') IS DISTINCT FROM 'array'
       OR jsonb_array_length(p_payload->'items') NOT BETWEEN 1 AND 50
       OR COALESCE(p_payload->>'guest_name','') = '' OR COALESCE(p_payload->>'guest_email','') = ''
       OR jsonb_typeof(p_payload->'shipping_address') IS DISTINCT FROM 'object' THEN
        RAISE EXCEPTION 'Enter valid customer, delivery, amount, and item information.' USING ERRCODE = 'P0001';
    END IF;
    IF EXISTS (
        SELECT 1 FROM jsonb_to_recordset(p_payload->'items') AS x(variant_id bigint, quantity numeric)
        WHERE x.variant_id IS NULL OR x.quantity IS NULL OR x.quantity < 1 OR x.quantity > 99 OR x.quantity <> trunc(x.quantity)
    ) OR (SELECT count(*) FROM jsonb_array_elements(p_payload->'items')) <>
         (SELECT count(DISTINCT x.variant_id) FROM jsonb_to_recordset(p_payload->'items') AS x(variant_id bigint)) THEN
        RAISE EXCEPTION 'Select distinct variants and quantities from 1 to 99.' USING ERRCODE = 'P0001';
    END IF;

    IF p_order_id IS NOT NULL THEN
        SELECT * INTO previous FROM public.orders WHERE id = p_order_id AND deleted_at IS NULL FOR UPDATE;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Order not found.' USING ERRCODE = 'P0002';
        END IF;
        IF p_expected_updated_at IS NULL OR previous.updated_at <> p_expected_updated_at THEN
            RAISE EXCEPTION 'The order changed. Reload before saving.' USING ERRCODE = '40001';
        END IF;
        IF desired_status <> previous.status AND NOT (
            (previous.status = 'pending' AND desired_status IN ('confirmed','cancelled')) OR
            (previous.status = 'confirmed' AND desired_status IN ('packed','cancelled')) OR
            (previous.status = 'packed' AND desired_status IN ('shipped','cancelled')) OR
            (previous.status = 'shipped' AND desired_status = 'completed')
        ) THEN
            RAISE EXCEPTION 'This order status transition is not allowed.' USING ERRCODE = 'P0001';
        END IF;
        locked := previous.status IN ('shipped','completed','cancelled') OR previous.payment_status IN ('paid','refunded');
        IF locked AND (
            shipping <> previous.shipping_fee OR discount <> previous.discount_amount OR
            EXISTS (
                (SELECT x.variant_id, x.quantity FROM jsonb_to_recordset(p_payload->'items') AS x(variant_id bigint, quantity integer)
                 EXCEPT SELECT product_variant_id, quantity FROM public.order_items WHERE order_id = p_order_id)
                UNION ALL
                (SELECT product_variant_id, quantity FROM public.order_items WHERE order_id = p_order_id
                 EXCEPT SELECT x.variant_id, x.quantity FROM jsonb_to_recordset(p_payload->'items') AS x(variant_id bigint, quantity integer))
            )
        ) THEN
            RAISE EXCEPTION 'Items and amounts cannot change after payment, shipment, or cancellation.' USING ERRCODE = 'P0001';
        END IF;
    ELSE
        IF desired_status NOT IN ('pending','confirmed') THEN
            RAISE EXCEPTION 'New orders must start pending or confirmed.' USING ERRCODE = 'P0001';
        END IF;
    END IF;

    IF p_order_id IS NULL AND p_payload->>'payment_status' NOT IN ('pending','paid','failed') THEN
        RAISE EXCEPTION 'A new order cannot start refunded.' USING ERRCODE = 'P0001';
    END IF;
    IF p_order_id IS NOT NULL AND p_payload->>'payment_status' <> previous.payment_status AND NOT (
        (previous.payment_status = 'pending' AND p_payload->>'payment_status' IN ('paid','failed')) OR
        (previous.payment_status = 'failed' AND p_payload->>'payment_status' IN ('pending','paid')) OR
        (previous.payment_status = 'paid' AND p_payload->>'payment_status' = 'refunded')
    ) THEN
        RAISE EXCEPTION 'This payment status transition is not allowed.' USING ERRCODE = 'P0001';
    END IF;

    -- Lock every affected variant in a stable order before checking or changing stock.
    PERFORM v.id FROM public.product_variants v
    WHERE v.id IN (
        SELECT x.variant_id FROM jsonb_to_recordset(p_payload->'items') AS x(variant_id bigint)
        UNION SELECT product_variant_id FROM public.order_items WHERE order_id = p_order_id
    ) ORDER BY v.id FOR UPDATE;

    IF (SELECT count(*) FROM public.product_variants WHERE id IN (
        SELECT x.variant_id FROM jsonb_to_recordset(p_payload->'items') AS x(variant_id bigint)
    )) <> jsonb_array_length(p_payload->'items') THEN
        RAISE EXCEPTION 'One or more selected variants no longer exist.' USING ERRCODE = 'P0001';
    END IF;

    IF p_order_id IS NULL THEN
        INSERT INTO public.orders (
            order_number, status, subtotal, shipping_fee, discount_amount, total, guest_name,
            guest_email, guest_phone, shipping_address, payment_method, payment_status, notes
        ) VALUES (
            'LL-' || upper(replace(gen_random_uuid()::text, '-', '')), desired_status, 0, shipping, discount, 0,
            p_payload->>'guest_name', p_payload->>'guest_email', p_payload->>'guest_phone',
            p_payload->'shipping_address', p_payload->>'payment_method', p_payload->>'payment_status', p_payload->>'notes'
        ) RETURNING id INTO result_id;
    ELSE
        result_id := p_order_id;
    END IF;

    FOR line IN SELECT * FROM jsonb_to_recordset(p_payload->'items') AS x(variant_id bigint, quantity integer)
    LOOP
        SELECT v.*, p.name AS product_name, p.status AS product_status,
            COALESCE(v.price_override, p.sale_price, p.base_price) AS current_price
        INTO variant FROM public.product_variants v JOIN public.products p ON p.id = v.product_id
        WHERE v.id = line.variant_id;
        SELECT * INTO old_line FROM public.order_items
        WHERE order_id = p_order_id AND product_variant_id = line.variant_id;
        old_quantity := COALESCE(old_line.quantity, 0);
        IF desired_status <> 'cancelled' AND (p_order_id IS NULL OR line.quantity > old_quantity)
           AND (NOT variant.is_active OR variant.product_status <> 'active') THEN
            RAISE EXCEPTION 'A selected variant is inactive or archived.' USING ERRCODE = 'P0001';
        END IF;
        IF previous.status = 'cancelled' THEN
            old_quantity := 0;
        END IF;
        desired_quantity := CASE WHEN desired_status = 'cancelled' THEN 0 ELSE line.quantity END;
        IF variant.stock_quantity + old_quantity < desired_quantity THEN
            RAISE EXCEPTION 'Insufficient stock for SKU %.', variant.sku USING ERRCODE = 'P0001';
        END IF;
        UPDATE public.product_variants SET stock_quantity = stock_quantity + old_quantity - desired_quantity,
            updated_at = clock_timestamp() WHERE id = line.variant_id;
        calculated_unit_price := COALESCE(old_line.unit_price, variant.current_price);
        calculated_subtotal := calculated_subtotal + calculated_unit_price * line.quantity;
        IF old_line.id IS NULL THEN
            INSERT INTO public.order_items (order_id, product_variant_id, product_name, variant_label, quantity, unit_price, line_total)
            VALUES (result_id, line.variant_id, variant.product_name,
                concat_ws(' / ', variant.color, variant.size), line.quantity, calculated_unit_price, calculated_unit_price * line.quantity);
        ELSE
            UPDATE public.order_items SET quantity = line.quantity, line_total = calculated_unit_price * line.quantity,
                updated_at = clock_timestamp() WHERE id = old_line.id;
        END IF;
    END LOOP;

    IF p_order_id IS NOT NULL THEN
        FOR old_line IN SELECT * FROM public.order_items WHERE order_id = p_order_id
            AND product_variant_id NOT IN (
                SELECT x.variant_id FROM jsonb_to_recordset(p_payload->'items') AS x(variant_id bigint)
            )
        LOOP
            IF previous.status <> 'cancelled' THEN
                UPDATE public.product_variants SET stock_quantity = stock_quantity + old_line.quantity,
                    updated_at = clock_timestamp() WHERE id = old_line.product_variant_id;
            END IF;
            DELETE FROM public.order_items WHERE id = old_line.id;
        END LOOP;
    END IF;
    IF discount > calculated_subtotal OR calculated_subtotal + shipping - discount > 99999999.99 THEN
        RAISE EXCEPTION 'Discount must not exceed the subtotal and total must be within the supported amount.' USING ERRCODE = 'P0001';
    END IF;
    UPDATE public.orders SET status = desired_status, subtotal = calculated_subtotal,
        shipping_fee = shipping, discount_amount = discount, total = calculated_subtotal + shipping - discount,
        guest_name = p_payload->>'guest_name', guest_email = p_payload->>'guest_email',
        guest_phone = p_payload->>'guest_phone', shipping_address = p_payload->'shipping_address',
        payment_method = p_payload->>'payment_method', payment_status = p_payload->>'payment_status',
        notes = p_payload->>'notes', updated_at = clock_timestamp()
    WHERE id = result_id;
    RETURN result_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_order(p_order_id bigint, p_expected_updated_at timestamptz)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    previous public.orders%ROWTYPE;
    line record;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'This action is not allowed.' USING ERRCODE = '42501';
    END IF;
    SELECT * INTO previous FROM public.orders WHERE id = p_order_id AND deleted_at IS NULL FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found.' USING ERRCODE = 'P0002';
    END IF;
    IF p_expected_updated_at IS NULL OR previous.updated_at <> p_expected_updated_at THEN
        RAISE EXCEPTION 'The order changed. Reload before deleting.' USING ERRCODE = '40001';
    END IF;
    IF previous.status NOT IN ('pending','cancelled') OR previous.payment_status NOT IN ('pending','failed') THEN
        RAISE EXCEPTION 'Only unpaid pending or cancelled orders can be deleted. Completed purchases are retained for reporting.' USING ERRCODE = 'P0001';
    END IF;
    IF previous.status <> 'cancelled' THEN
        PERFORM v.id FROM public.product_variants v JOIN public.order_items i ON i.product_variant_id = v.id
        WHERE i.order_id = p_order_id ORDER BY v.id FOR UPDATE OF v;
        FOR line IN SELECT * FROM public.order_items WHERE order_id = p_order_id LOOP
            UPDATE public.product_variants SET stock_quantity = stock_quantity + line.quantity,
                updated_at = clock_timestamp() WHERE id = line.product_variant_id;
        END LOOP;
    END IF;
    UPDATE public.orders SET deleted_at = clock_timestamp(), status = 'cancelled',
        updated_at = clock_timestamp() WHERE id = p_order_id;
    RETURN p_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_save_order(bigint,jsonb,timestamptz) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_delete_order(bigint,timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_save_order(bigint,jsonb,timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_order(bigint,timestamptz) TO authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;
