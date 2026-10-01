-- ============ menu_items ============
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(6,2) NOT NULL DEFAULT 0,
  image_url text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'coffee',
  dietary_tags text[] NOT NULL DEFAULT '{}',
  is_available boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_menu_items" ON menu_items;
CREATE POLICY "public_read_menu_items" ON menu_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "staff_insert_menu_items" ON menu_items;
CREATE POLICY "staff_insert_menu_items" ON menu_items FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "staff_update_menu_items" ON menu_items;
CREATE POLICY "staff_update_menu_items" ON menu_items FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "staff_delete_menu_items" ON menu_items;
CREATE POLICY "staff_delete_menu_items" ON menu_items FOR DELETE
  TO authenticated USING (true);

-- ============ cats ============
CREATE TABLE IF NOT EXISTS cats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age text NOT NULL DEFAULT '',
  breed text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  gallery_urls text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'resident',
  favorite_toys text[] NOT NULL DEFAULT '{}',
  good_with_kids boolean NOT NULL DEFAULT true,
  good_with_pets boolean NOT NULL DEFAULT true,
  backstory text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_cats" ON cats;
CREATE POLICY "public_read_cats" ON cats FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "staff_insert_cats" ON cats;
CREATE POLICY "staff_insert_cats" ON cats FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "staff_update_cats" ON cats;
CREATE POLICY "staff_update_cats" ON cats FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "staff_delete_cats" ON cats;
CREATE POLICY "staff_delete_cats" ON cats FOR DELETE
  TO authenticated USING (true);

-- ============ adoption_applications ============
CREATE TABLE IF NOT EXISTS adoption_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  housing_type text NOT NULL DEFAULT 'rent',
  landlord_permission boolean NOT NULL DEFAULT false,
  household_members int NOT NULL DEFAULT 1,
  other_pets text NOT NULL DEFAULT '',
  selected_cat_id uuid REFERENCES cats(id) ON DELETE SET NULL,
  selected_cat_name text NOT NULL DEFAULT '',
  previous_experience text NOT NULL DEFAULT '',
  daily_routine text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'under_review',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE adoption_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_applications" ON adoption_applications;
CREATE POLICY "public_insert_applications" ON adoption_applications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "staff_read_applications" ON adoption_applications;
CREATE POLICY "staff_read_applications" ON adoption_applications FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "staff_update_applications" ON adoption_applications;
CREATE POLICY "staff_update_applications" ON adoption_applications FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "staff_delete_applications" ON adoption_applications;
CREATE POLICY "staff_delete_applications" ON adoption_applications FOR DELETE
  TO authenticated USING (true);

-- ============ Indexes ============
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_cats_status ON cats(status);
CREATE INDEX IF NOT EXISTS idx_applications_status ON adoption_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created ON adoption_applications(created_at DESC);

-- ============ updated_at trigger ============
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_menu_items_updated ON menu_items;
CREATE TRIGGER trg_menu_items_updated BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_cats_updated ON cats;
CREATE TRIGGER trg_cats_updated BEFORE UPDATE ON cats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_applications_updated ON adoption_applications;
CREATE TRIGGER trg_applications_updated BEFORE UPDATE ON adoption_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();