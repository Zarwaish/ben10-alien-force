-- ==========================================
-- BEN 10 ADMIN PANEL - NEW SUPABASE SCHEMA
-- ==========================================

-- 1. admin_users
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. aliens
CREATE TABLE IF NOT EXISTS aliens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  power TEXT,
  type TEXT DEFAULT 'Classic',
  watch_type TEXT DEFAULT 'omnitrix',
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  species TEXT,
  planet TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. watches
CREATE TABLE IF NOT EXISTS watches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. transformations
CREATE TABLE IF NOT EXISTS transformations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alien_id UUID REFERENCES aliens(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. admin_activity
CREATE TABLE IF NOT EXISTS admin_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE aliens ENABLE ROW LEVEL SECURITY;
ALTER TABLE watches ENABLE ROW LEVEL SECURITY;
ALTER TABLE transformations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access for aliens" ON aliens FOR SELECT TO public USING (true);
CREATE POLICY "Public read access for watches" ON watches FOR SELECT TO public USING (true);
CREATE POLICY "Public read access for transformations" ON transformations FOR SELECT TO public USING (true);

-- Admin write access (allowing unauthenticated inserts if needed for the current local setup)
CREATE POLICY "Public insert access for aliens" ON aliens FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public update access for aliens" ON aliens FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public delete access for aliens" ON aliens FOR DELETE TO public USING (true);

CREATE POLICY "Public insert access for transformations" ON transformations FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public update access for transformations" ON transformations FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public delete access for transformations" ON transformations FOR DELETE TO public USING (true);

-- ==========================================
-- STORAGE SETUP
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('alien-images', 'alien-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('transformation-images', 'transformation-images', true) ON CONFLICT DO NOTHING;

-- Storage Policies

-- alien-images
CREATE POLICY "Public Select alien-images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'alien-images');
CREATE POLICY "Public Insert alien-images" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'alien-images');
CREATE POLICY "Public Update alien-images" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'alien-images');
CREATE POLICY "Public Delete alien-images" ON storage.objects FOR DELETE TO public USING (bucket_id = 'alien-images');

-- transformation-images
CREATE POLICY "Public Select transformation-images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'transformation-images');
CREATE POLICY "Public Insert transformation-images" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'transformation-images');
CREATE POLICY "Public Update transformation-images" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'transformation-images');
CREATE POLICY "Public Delete transformation-images" ON storage.objects FOR DELETE TO public USING (bucket_id = 'transformation-images');
