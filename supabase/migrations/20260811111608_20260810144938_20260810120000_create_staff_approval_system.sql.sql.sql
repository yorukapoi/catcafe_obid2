/*
# Staff approval and protected staff administration

1. New Tables
- `staff_profiles` stores one approval record for each Supabase Auth user.
- `id` identifies the profile.
- `user_id` links the profile to `auth.users` and is unique.
- `email` stores the signup email for staff administration display.
- `status` is `pending`, `approved`, or `rejected`.
- `approved_by` records which approved staff member granted access.
- `approved_at`, `created_at`, and `updated_at` track approval and profile history.

2. Authentication and Signup Behavior
- A database trigger creates a pending staff profile whenever a new Auth user is created.
- The first user is automatically approved so the café can be bootstrapped.
- Existing Auth users without profiles are backfilled; only the first existing user is automatically approved.

3. Security
- Row level security is enabled on `staff_profiles`.
- Users can read their own profile, while approved staff can read all staff profiles.
- Direct staff-profile writes are revoked from browser roles.
- Approval and rejection are performed through a server-side function that requires the caller to be approved and prevents self-approval or self-rejection.
- Menu, cat, and application writes and application reads now require an approved staff profile.
- Public menu and cat reads and public adoption-application inserts remain available.

4. Important Notes
- Approval is checked in the database for every protected write, so hiding the dashboard is not the only security boundary.
- The migration is safe to re-run and does not delete existing application data.
*/

CREATE TABLE IF NOT EXISTS staff_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_profiles_select_own" ON staff_profiles;
CREATE POLICY "staff_profiles_select_own" ON staff_profiles FOR SELECT
  TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.staff_profiles manager
      WHERE manager.user_id = auth.uid() AND manager.status = 'approved'
    )
  );

REVOKE INSERT, UPDATE, DELETE ON staff_profiles FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_approved_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE user_id = auth.uid() AND status = 'approved'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_approved_staff() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_approved_staff() TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_count integer;
BEGIN
  SELECT count(*) INTO v_profile_count FROM public.staff_profiles;

  IF v_profile_count = 0 THEN
    INSERT INTO public.staff_profiles (user_id, email, status, approved_by, approved_at)
    VALUES (NEW.id, COALESCE(NEW.email, ''), 'approved', NEW.id, now());
  ELSE
    INSERT INTO public.staff_profiles (user_id, email, status)
    VALUES (NEW.id, COALESCE(NEW.email, ''), 'pending');
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_staff_status(p_target_user_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_approved_staff() THEN
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
    SET status = p_status, approved_by = NULL, approved_at = NULL, updated_at = now()
    WHERE user_id = p_target_user_id;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_staff_status(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.set_staff_status(uuid, text) TO authenticated;

DROP TRIGGER IF EXISTS trg_staff_profiles_updated ON staff_profiles;
CREATE TRIGGER trg_staff_profiles_updated BEFORE UPDATE ON staff_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP POLICY IF EXISTS "staff_insert_menu_items" ON menu_items;
CREATE POLICY "staff_insert_menu_items" ON menu_items FOR INSERT
  TO authenticated WITH CHECK (public.is_approved_staff());

DROP POLICY IF EXISTS "staff_update_menu_items" ON menu_items;
CREATE POLICY "staff_update_menu_items" ON menu_items FOR UPDATE
  TO authenticated USING (public.is_approved_staff()) WITH CHECK (public.is_approved_staff());

DROP POLICY IF EXISTS "staff_delete_menu_items" ON menu_items;
CREATE POLICY "staff_delete_menu_items" ON menu_items FOR DELETE
  TO authenticated USING (public.is_approved_staff());

DROP POLICY IF EXISTS "staff_insert_cats" ON cats;
CREATE POLICY "staff_insert_cats" ON cats FOR INSERT
  TO authenticated WITH CHECK (public.is_approved_staff());

DROP POLICY IF EXISTS "staff_update_cats" ON cats;
CREATE POLICY "staff_update_cats" ON cats FOR UPDATE
  TO authenticated USING (public.is_approved_staff()) WITH CHECK (public.is_approved_staff());

DROP POLICY IF EXISTS "staff_delete_cats" ON cats;
CREATE POLICY "staff_delete_cats" ON cats FOR DELETE
  TO authenticated USING (public.is_approved_staff());

DROP POLICY IF EXISTS "staff_read_applications" ON adoption_applications;
CREATE POLICY "staff_read_applications" ON adoption_applications FOR SELECT
  TO authenticated USING (public.is_approved_staff());

DROP POLICY IF EXISTS "staff_update_applications" ON adoption_applications;
CREATE POLICY "staff_update_applications" ON adoption_applications FOR UPDATE
  TO authenticated USING (public.is_approved_staff()) WITH CHECK (public.is_approved_staff());

DROP POLICY IF EXISTS "staff_delete_applications" ON adoption_applications;
CREATE POLICY "staff_delete_applications" ON adoption_applications FOR DELETE
  TO authenticated USING (public.is_approved_staff());

DO $$
DECLARE
  u record;
  v_profile_count integer;
BEGIN
  SELECT count(*) INTO v_profile_count FROM public.staff_profiles;

  FOR u IN
    SELECT id, email
    FROM auth.users
    WHERE NOT EXISTS (
      SELECT 1 FROM public.staff_profiles existing WHERE existing.user_id = auth.users.id
    )
    ORDER BY created_at
  LOOP
    IF v_profile_count = 0 THEN
      INSERT INTO public.staff_profiles (user_id, email, status, approved_by, approved_at)
      VALUES (u.id, COALESCE(u.email, ''), 'approved', u.id, now());
    ELSE
      INSERT INTO public.staff_profiles (user_id, email, status)
      VALUES (u.id, COALESCE(u.email, ''), 'pending');
    END IF;
    v_profile_count := v_profile_count + 1;
  END LOOP;
END;
$$;