-- =======================================================================
-- BEN 10 PRODUCTION MIGRATION — Run in Supabase Dashboard SQL Editor
-- Project: ytdltanztbigryanjoyy
-- Go to: https://supabase.com/dashboard/project/ytdltanztbigryanjoyy/editor
-- =======================================================================

-- STEP 1: Add missing columns to aliens table
ALTER TABLE aliens ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;
ALTER TABLE aliens ADD COLUMN IF NOT EXISTS ultimate_image_url TEXT;

-- STEP 2: Create storage bucket for alien images
INSERT INTO storage.buckets (id, name, public)
VALUES ('alien-assets', 'alien-assets', true)
ON CONFLICT (id) DO NOTHING;

-- STEP 3: Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create storage policies (drop old ones first for clean state)
DROP POLICY IF EXISTS "Public Select alien-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert alien-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Update alien-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete alien-assets" ON storage.objects;

CREATE POLICY "Public Select alien-assets"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'alien-assets');

CREATE POLICY "Public Insert alien-assets"
  ON storage.objects FOR INSERT TO public
  WITH CHECK (bucket_id = 'alien-assets');

CREATE POLICY "Public Update alien-assets"
  ON storage.objects FOR UPDATE TO public
  USING (bucket_id = 'alien-assets')
  WITH CHECK (bucket_id = 'alien-assets');

CREATE POLICY "Public Delete alien-assets"
  ON storage.objects FOR DELETE TO public
  USING (bucket_id = 'alien-assets');

-- STEP 5: Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- STEP 6: Verification — run this to confirm everything worked
SELECT
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'aliens' AND column_name = 'gallery') AS gallery_exists,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'aliens' AND column_name = 'ultimate_image_url') AS ultimate_image_url_exists,
  (SELECT COUNT(*) FROM storage.buckets WHERE id = 'alien-assets') AS bucket_exists,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%alien-assets%') AS storage_policies,
  'Migration complete' AS status;
