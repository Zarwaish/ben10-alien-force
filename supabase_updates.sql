-- =======================================================================
-- BEN 10 ADMIN PANEL — COMPLETE SUPABASE FIX SCRIPT
-- Run this entire file in: Supabase Dashboard → SQL Editor → Run
-- =======================================================================

-- -----------------------------------------------------------------------
-- SECTION 1: profiles table
-- -----------------------------------------------------------------------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url  TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email       TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ DEFAULT NOW();

-- Auto-create profile row on new signup
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
-- SECTION 2: aliens table — add missing columns
-- -----------------------------------------------------------------------
ALTER TABLE aliens ADD COLUMN IF NOT EXISTS watch_type   TEXT    DEFAULT 'omnitrix';
ALTER TABLE aliens ADD COLUMN IF NOT EXISTS order_index  INTEGER DEFAULT 0;
ALTER TABLE aliens ADD COLUMN IF NOT EXISTS gallery      JSONB   DEFAULT '[]'::jsonb;
ALTER TABLE aliens ADD COLUMN IF NOT EXISTS type         TEXT    DEFAULT 'Classic';
ALTER TABLE aliens ADD COLUMN IF NOT EXISTS power        TEXT;
ALTER TABLE aliens ADD COLUMN IF NOT EXISTS description  TEXT;

-- -----------------------------------------------------------------------
-- SECTION 3: aliens RLS policies (THE FIX — this is why inserts were failing)
-- -----------------------------------------------------------------------
ALTER TABLE aliens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for aliens"        ON aliens;
DROP POLICY IF EXISTS "Authenticated users can insert aliens" ON aliens;
DROP POLICY IF EXISTS "Authenticated users can update aliens" ON aliens;
DROP POLICY IF EXISTS "Authenticated users can delete aliens" ON aliens;

CREATE POLICY "Public read access for aliens"
  ON aliens FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can insert aliens"
  ON aliens FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update aliens"
  ON aliens FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete aliens"
  ON aliens FOR DELETE TO authenticated USING (true);

-- -----------------------------------------------------------------------
-- SECTION 4: Storage bucket + policies
-- -----------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('alien-assets', 'alien-assets', true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Access"                       ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload"      ON storage.objects;
DROP POLICY IF EXISTS "Users can update own uploads"        ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own uploads"        ON storage.objects;

CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT USING (bucket_id = 'alien-assets');

CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'alien-assets');

CREATE POLICY "Users can update own uploads"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'alien-assets');

CREATE POLICY "Users can delete own uploads"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'alien-assets');

-- -----------------------------------------------------------------------
-- SECTION 5: profiles RLS
-- -----------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Done!
SELECT 'All fixes applied successfully.' AS status;
