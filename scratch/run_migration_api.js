// Supabase Management API Migration Script
// Uses the Supabase Management API to run SQL directly on the production project
// This requires a Supabase Personal Access Token (PAT)
// Get it from: https://supabase.com/dashboard/account/tokens

const PROJECT_REF = 'ytdltanztbigryanjoyy';
const SUPABASE_URL = `https://ytdltanztbigryanjoyy.supabase.co`;

// The SQL to run
const MIGRATION_SQL = `
-- Add missing columns
ALTER TABLE aliens ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;
ALTER TABLE aliens ADD COLUMN IF NOT EXISTS ultimate_image_url TEXT;

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('alien-assets', 'alien-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policies
DROP POLICY IF EXISTS "Public Select alien-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert alien-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Update alien-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete alien-assets" ON storage.objects;

CREATE POLICY "Public Select alien-assets" ON storage.objects FOR SELECT TO public USING (bucket_id = 'alien-assets');
CREATE POLICY "Public Insert alien-assets" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'alien-assets');
CREATE POLICY "Public Update alien-assets" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'alien-assets') WITH CHECK (bucket_id = 'alien-assets');
CREATE POLICY "Public Delete alien-assets" ON storage.objects FOR DELETE TO public USING (bucket_id = 'alien-assets');

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
`;

async function runMigrationViaAPI(pat) {
  console.log('=== Running Migration via Supabase Management API ===');
  console.log('Project:', PROJECT_REF);

  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pat}`
      },
      body: JSON.stringify({ query: MIGRATION_SQL })
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!response.ok) {
      console.error('Management API error:', response.status, data);
    } else {
      console.log('Migration successful!', data);
    }
  } catch (err) {
    console.error('Request failed:', err.message);
  }
}

// Check for PAT in environment or args
const pat = process.env.SUPABASE_ACCESS_TOKEN || process.argv[2];
if (!pat) {
  console.error('ERROR: No Personal Access Token provided.');
  console.error('Usage: node scratch/run_migration_api.js <your-pat>');
  console.error('Get your PAT from: https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

runMigrationViaAPI(pat);
