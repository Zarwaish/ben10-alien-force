-- =======================================================================
-- BEN 10 ADMIN PANEL — SAFE SUPABASE MIGRATION
-- Safe to run in: Supabase Dashboard → SQL Editor → Run
--
-- NOTE: Storage bucket + storage policies must be configured via the
--       Supabase Dashboard UI (Storage tab), NOT via SQL.
--       This script only modifies tables you own in the public schema.
-- =======================================================================


-- -----------------------------------------------------------------------
-- SECTION 1: aliens table — add missing columns
-- -----------------------------------------------------------------------
ALTER TABLE aliens ADD COLUMN IF NOT EXISTS description  TEXT;
ALTER TABLE aliens ADD COLUMN IF NOT EXISTS power        TEXT;
ALTER TABLE aliens ADD COLUMN IF NOT EXISTS type         TEXT    DEFAULT 'Classic';
ALTER TABLE aliens ADD COLUMN IF NOT EXISTS image_url    TEXT;
ALTER TABLE aliens ADD COLUMN IF NOT EXISTS gallery      JSONB   DEFAULT '[]'::jsonb;
ALTER TABLE aliens ADD COLUMN IF NOT EXISTS watch_type   TEXT    DEFAULT 'omnitrix';
ALTER TABLE aliens ADD COLUMN IF NOT EXISTS order_index  INTEGER DEFAULT 0;


-- -----------------------------------------------------------------------
-- SECTION 2: aliens RLS — enable and create policies
-- -----------------------------------------------------------------------
ALTER TABLE aliens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for aliens"         ON aliens;
DROP POLICY IF EXISTS "Authenticated users can insert aliens" ON aliens;
DROP POLICY IF EXISTS "Authenticated users can update aliens" ON aliens;
DROP POLICY IF EXISTS "Authenticated users can delete aliens" ON aliens;

-- Anyone can read aliens (public website)
CREATE POLICY "Public read access for aliens"
  ON aliens FOR SELECT
  TO public
  USING (true);

-- Logged-in users can insert, update, delete
CREATE POLICY "Authenticated users can insert aliens"
  ON aliens FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update aliens"
  ON aliens FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete aliens"
  ON aliens FOR DELETE
  TO authenticated
  USING (true);


-- -----------------------------------------------------------------------
-- SECTION 3: profiles table — add missing columns
-- -----------------------------------------------------------------------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url  TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email       TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ DEFAULT NOW();


-- -----------------------------------------------------------------------
-- SECTION 4: profiles RLS — read/update own row
-- -----------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile"    ON profiles;
DROP POLICY IF EXISTS "Users can update own profile"  ON profiles;
DROP POLICY IF EXISTS "Public can read profiles"      ON profiles;

CREATE POLICY "Public can read profiles"
  ON profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- -----------------------------------------------------------------------
-- SECTION 5: auto-create profile row on auth.users insert
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, role, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    'user',
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email    = EXCLUDED.email,
    username = COALESCE(profiles.username, EXCLUDED.username);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- -----------------------------------------------------------------------
-- Done
-- -----------------------------------------------------------------------
SELECT
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'aliens') AS aliens_columns,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'aliens')                 AS aliens_policies,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles')               AS profiles_policies,
  'Migration complete' AS status;
