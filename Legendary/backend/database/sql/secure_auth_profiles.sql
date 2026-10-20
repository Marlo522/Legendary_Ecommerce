-- Apply in the Supabase SQL editor after database.md.
BEGIN;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role)
    VALUES (NEW.id, NEW.email,
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'name', ''), SPLIT_PART(NEW.email, '@', 1)),
        'customer');
    RETURN NEW;
END;
$$;
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    );
$$;
-- RLS does not restrict which columns a user can update.
REVOKE UPDATE ON public.users FROM PUBLIC, anon, authenticated;
GRANT UPDATE (name, phone, avatar_url, updated_at) ON public.users TO authenticated;
COMMIT;
