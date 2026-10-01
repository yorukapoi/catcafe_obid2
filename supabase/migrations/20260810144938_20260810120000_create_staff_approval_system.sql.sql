-- ============ Staff Approval System ============
-- Adds a staff_profiles table that tracks approval status for each auth user.
-- New signups start as 'pending'. The first signup is auto-approved (bootstrap).
-- Only approved staff can write to menu_items, cats, and adoption_applications.

-- ============ staff_profiles table ============
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

-- Staff profiles: a user can read their own profile; approved staff can read all
DROP POLICY IF EXISTS "staff_profiles_select_own" ON staff_profiles;
CREATE POLICY "staff_profiles_select_own" ON staff_profiles FOR SELECT
  TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM staff_profiles sp
      WHERE sp.user_id = auth.uid() AND sp.status = 'approved'
    )
  );

-- No direct INSERT/UPDATE/DELETE via the data API — all mutations go through
-- the SECURITY DEFINER functions below.
REVOKE INSERT, UPDATE, DELETE ON staff_profiles FROM anon, authenticated;

-- ============ Helper function: is current user approved staff? ============
CREATE OR REPLACE FUNCTION is_approved_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM staff_profiles
    WHERE user_id = auth.uid() AND status = 'approved'
  );
$$;

REVOKE EXECUTE ON FUNCTION is_approved_staff FROM anon;
GRANT EXECUTE ON FUNCTION is_approved_staff TO authenticated;

-- ============ Trigger: auto-create staff profile on signup ============
-- New profiles default to 'pending'. If this is the very first user, auto-approve.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_count int;
BEGIN
  SELECT count(*) INTO v_user_count FROM staff_profiles;

  IF v_user_count = 0 THEN
    -- Bootstrap: first user is auto-approved
    INSERT INTO staff_profiles (user_id, email, status, approved_by, approved_at)
    VALUES (NEW.id, NEW.email, 'approved', NEW.id, now());
  ELSE
    INSERT INTO staff_profiles (user_id, email, status)
    VALUES (NEW.id, NEW.email, 'pending');
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION handle_new_user FROM anon, authenticated;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============ Secure function: approve or reject a staff member ============
CREATE OR REPLACE FUNCTION set_staff_status(p_target_user_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Authorize the CALLER (not a parameter)
  IF NOT EXISTS (
    SELECT 1 FROM staff_profiles
    WHERE user_id = auth.uid() AND status = 'approved'
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Validate the requested status
  IF p_status NOT IN ('approved', 'rejected', 'pending') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  -- Prevent self-modification (can't approve/reject yourself)
  IF p_target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot modify your own status';
  END IF;

  -- Apply the change
  IF p_status = 'approved' THEN
    UPDATE staff_profiles
    SET status = 'approved', approved_by = auth.uid(), approved_at = now(), updated_at = now()
    WHERE user_id = p_target_user_id;
  ELSE
    UPDATE staff_profiles
    SET status = p_status, updated_at = now()
    WHERE user_id = p_target_user_id;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION set_staff_status FROM anon;
GRANT EXECUTE ON FUNCTION set_staff_status TO authenticated;

-- ============ updated_at trigger for staff_profiles ============
DROP TRIGGER IF EXISTS trg_staff_profiles_updated ON staff_profiles;
CREATE TRIGGER trg_staff_profiles_updated BEFORE UPDATE ON staff_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============ Lock down menu_items policies ============
-- Replace staff write policies to require approved staff status
DROP POLICY IF EXISTS "staff_insert_menu_items" ON menu_items;
CREATE POLICY "staff_insert_menu_items" ON menu_items FOR INSERT
  TO authenticated WITH CHECK (is_approved_staff());

DROP POLICY IF EXISTS "staff_update_menu_items" ON menu_items;
CREATE POLICY "staff_update_menu_items" ON menu_items FOR UPDATE
  TO authenticated USING (is_approved_staff()) WITH CHECK (is_approved_staff());

DROP POLICY IF EXISTS "staff_delete_menu_items" ON menu_items;
CREATE POLICY "staff_delete_menu_items" ON menu_items FOR DELETE
  TO authenticated USING (is_approved_staff());

-- ============ Lock down cats policies ============
DROP POLICY IF EXISTS "staff_insert_cats" ON cats;
CREATE POLICY "staff_insert_cats" ON cats FOR INSERT
  TO authenticated WITH CHECK (is_approved_staff());

DROP POLICY IF EXISTS "staff_update_cats" ON cats;
CREATE POLICY "staff_update_cats" ON cats FOR UPDATE
  TO authenticated USING (is_approved_staff()) WITH CHECK (is_approved_staff());

DROP POLICY IF EXISTS "staff_delete_cats" ON cats;
CREATE POLICY "staff_delete_cats" ON cats FOR DELETE
  TO authenticated USING (is_approved_staff());

-- ============ Lock down adoption_applications policies ============
-- Public INSERT stays open (anyone can apply), but reads/updates/deletes require approved staff
DROP POLICY IF EXISTS "staff_read_applications" ON adoption_applications;
CREATE POLICY "staff_read_applications" ON adoption_applications FOR SELECT
  TO authenticated USING (is_approved_staff());

DROP POLICY IF EXISTS "staff_update_applications" ON adoption_applications;
CREATE POLICY "staff_update_applications" ON adoption_applications FOR UPDATE
  TO authenticated USING (is_approved_staff()) WITH CHECK (is_approved_staff());

DROP POLICY IF EXISTS "staff_delete_applications" ON adoption_applications;
CREATE POLICY "staff_delete_applications" ON adoption_applications FOR DELETE
  TO authenticated USING (is_approved_staff());

-- ============ Backfill staff_profiles for existing users ============
-- Any users that already exist (created before the trigger) get a pending profile.
-- The first existing user is auto-approved to ensure there's at least one admin.
DO $$
DECLARE
  u record;
  v_count int := 0;
BEGIN
  SELECT count(*) INTO v_count FROM staff_profiles;

  FOR u IN SELECT id, email FROM auth.users WHERE id NOT IN (SELECT user_id FROM staff_profiles) ORDER BY created_at LOOP
    IF v_count = 0 THEN
      INSERT INTO staff_profiles (user_id, email, status, approved_by, approved_at)
      VALUES (u.id, u.email, 'approved', u.id, now());
    ELSE
      INSERT INTO staff_profiles (user_id, email, status)
      VALUES (u.id, u.email, 'pending');
    END IF;
    v_count := v_count + 1;
  END LOOP;
END $$;