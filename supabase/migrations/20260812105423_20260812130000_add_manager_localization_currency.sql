/*
# Add manager permissions, bilingual content, and global currency settings

1. Staff permissions
- Adds `staff_profiles.role`, defaulting to `staff`.
- Only profiles with `role = 'manager'` and `status = 'approved'` can view other staff profiles or call the staff approval function.
- Regular approved staff keep their existing café management access but cannot manage staff accounts.
- Direct writes to `staff_profiles` remain revoked; approval changes stay inside the protected database function.

2. Bilingual content
- Adds Macedonian name and description fields to menu items.
- Adds Macedonian bio and backstory fields to cat profiles.
- Existing English content remains intact and is used as a fallback until Macedonian text is entered.

3. Currency settings
- Creates the single-row `cafe_settings` table.
- Stores the global display currency (`USD` or `MKD`) and the USD-to-MKD conversion rate.
- Menu prices remain stored canonically in USD so changing the display currency never changes the underlying value.
- Approved staff can update the global currency setting; public visitors can read it.

4. Security
- Enables RLS on `cafe_settings`.
- Public users may read the currency setting.
- Only approved staff may update the currency setting.
- Manager authorization is enforced by SECURITY DEFINER helper functions with a fixed search path.
*/

ALTER TABLE public.staff_profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'staff';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'staff_profiles_role_check'
      AND conrelid = 'public.staff_profiles'::regclass
  ) THEN
    ALTER TABLE public.staff_profiles
      ADD CONSTRAINT staff_profiles_role_check CHECK (role IN ('staff', 'manager'));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.is_approved_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff_profiles
    WHERE user_id = auth.uid()
      AND status = 'approved'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff_profiles
    WHERE user_id = auth.uid()
      AND status = 'approved'
      AND role = 'manager'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_approved_staff() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_approved_staff() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_manager() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_manager() TO authenticated;

DROP POLICY IF EXISTS "staff_profiles_select_own" ON public.staff_profiles;
DROP POLICY IF EXISTS "staff_profiles_select_own_or_manager" ON public.staff_profiles;
CREATE POLICY "staff_profiles_select_own_or_manager" ON public.staff_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_manager());

CREATE OR REPLACE FUNCTION public.set_staff_status(p_target_user_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF NOT public.is_manager() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_status NOT IN ('approved', 'rejected', 'pending') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  IF p_target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot modify your own status';
  END IF;

  IF p_status = 'approved' THEN
    UPDATE public.staff_profiles
    SET status = 'approved', approved_by = auth.uid(), approved_at = now(), updated_at = now()
    WHERE user_id = p_target_user_id;
  ELSE
    UPDATE public.staff_profiles
    SET status = p_status, updated_at = now()
    WHERE user_id = p_target_user_id;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_staff_status(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.set_staff_status(uuid, text) TO authenticated;

ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS name_mk text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description_mk text NOT NULL DEFAULT '';

ALTER TABLE public.cats
  ADD COLUMN IF NOT EXISTS bio_mk text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS backstory_mk text NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS public.cafe_settings (
  id text PRIMARY KEY DEFAULT 'default',
  currency text NOT NULL DEFAULT 'USD',
  usd_to_mkd_rate numeric(10,4) NOT NULL DEFAULT 57.0000,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cafe_settings_singleton CHECK (id = 'default'),
  CONSTRAINT cafe_settings_currency_check CHECK (currency IN ('USD', 'MKD')),
  CONSTRAINT cafe_settings_rate_check CHECK (usd_to_mkd_rate > 0)
);

ALTER TABLE public.cafe_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.cafe_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_cafe_settings" ON public.cafe_settings;
CREATE POLICY "public_read_cafe_settings" ON public.cafe_settings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "approved_staff_update_cafe_settings" ON public.cafe_settings;
CREATE POLICY "approved_staff_update_cafe_settings" ON public.cafe_settings FOR UPDATE
  TO authenticated
  USING (public.is_approved_staff())
  WITH CHECK (public.is_approved_staff());

REVOKE INSERT, DELETE ON public.cafe_settings FROM anon, authenticated;
GRANT SELECT ON public.cafe_settings TO anon, authenticated;
GRANT UPDATE ON public.cafe_settings TO authenticated;

DROP TRIGGER IF EXISTS trg_cafe_settings_updated ON public.cafe_settings;
CREATE TRIGGER trg_cafe_settings_updated
  BEFORE UPDATE ON public.cafe_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
