import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ytdltanztbigryanjoyy.supabase.co';
const anonKey = 'sb_publishable_Vb-Wjw0Q1nMn6vMDeFsTMw_Z2mPZe16';

const supabase = createClient(supabaseUrl, anonKey);

async function runMigration() {
  console.log('=== Production Schema Migration via REST API ===');
  console.log('URL:', supabaseUrl);
  
  // Step 1: Check what columns exist
  console.log('\n--- Step 1: Check current schema ---');
  const { data: testRow, error: checkErr } = await supabase.from('aliens').select('*').limit(1);
  if (checkErr) {
    console.error('Error reading aliens table:', checkErr);
    return;
  }
  
  const existingColumns = testRow.length > 0 ? Object.keys(testRow[0]) : [];
  console.log('Existing columns:', existingColumns);

  const needed = ['gallery', 'ultimate_image_url', 'species', 'planet'];
  const missing = needed.filter(col => !existingColumns.includes(col));
  const present = needed.filter(col => existingColumns.includes(col));
  
  console.log('Required columns present:', present);
  console.log('Required columns MISSING:', missing);

  if (missing.length === 0) {
    console.log('\n✅ All required columns already exist! No migration needed.');
  } else {
    console.log(`\n⚠️  Missing columns: ${missing.join(', ')}`);
    console.log('These need to be added via Supabase Dashboard SQL Editor.');
    console.log('\nSQL to run in Supabase Dashboard:');
    console.log('---');
    for (const col of missing) {
      if (col === 'gallery') {
        console.log(`ALTER TABLE aliens ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;`);
      } else if (col === 'ultimate_image_url') {
        console.log(`ALTER TABLE aliens ADD COLUMN IF NOT EXISTS ultimate_image_url TEXT;`);
      } else if (col === 'species') {
        console.log(`ALTER TABLE aliens ADD COLUMN IF NOT EXISTS species TEXT;`);
      } else if (col === 'planet') {
        console.log(`ALTER TABLE aliens ADD COLUMN IF NOT EXISTS planet TEXT;`);
      }
    }
    console.log('NOTIFY pgrst, \'reload schema\';');
    console.log('---');
  }

  // Step 2: Check storage bucket
  console.log('\n--- Step 2: Check storage bucket ---');
  const { data: bucket, error: bucketErr } = await supabase.storage.getBucket('alien-assets');
  if (bucketErr) {
    console.error('alien-assets bucket NOT FOUND:', bucketErr.message);
    console.log('\nSQL to create bucket in Supabase Dashboard:');
    console.log('---');
    console.log(`INSERT INTO storage.buckets (id, name, public) VALUES ('alien-assets', 'alien-assets', true) ON CONFLICT (id) DO NOTHING;`);
    console.log(`ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`);
    console.log(`DROP POLICY IF EXISTS "Public Select alien-assets" ON storage.objects;`);
    console.log(`CREATE POLICY "Public Select alien-assets" ON storage.objects FOR SELECT TO public USING (bucket_id = 'alien-assets');`);
    console.log(`DROP POLICY IF EXISTS "Public Insert alien-assets" ON storage.objects;`);
    console.log(`CREATE POLICY "Public Insert alien-assets" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'alien-assets');`);
    console.log(`DROP POLICY IF EXISTS "Public Update alien-assets" ON storage.objects;`);
    console.log(`CREATE POLICY "Public Update alien-assets" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'alien-assets') WITH CHECK (bucket_id = 'alien-assets');`);
    console.log(`DROP POLICY IF EXISTS "Public Delete alien-assets" ON storage.objects;`);
    console.log(`CREATE POLICY "Public Delete alien-assets" ON storage.objects FOR DELETE TO public USING (bucket_id = 'alien-assets');`);
    console.log('---');
  } else {
    console.log('✅ alien-assets bucket EXISTS:', JSON.stringify(bucket));
  }

  // Step 3: Verify CRUD operations work
  console.log('\n--- Step 3: Test alien CRUD ---');
  
  // Test INSERT
  const testAlien = {
    name: '__test_migration_alien__',
    description: 'Temp alien for schema migration test',
    power: 'Testing',
    type: 'Classic',
    watch_type: 'omnitrix',
    order_index: 9999
  };
  
  // Only add columns we know exist
  if (present.includes('species')) testAlien.species = 'Test Species';
  if (present.includes('planet')) testAlien.planet = 'Test Planet';
  if (present.includes('gallery')) testAlien.gallery = [];
  if (present.includes('ultimate_image_url')) testAlien.ultimate_image_url = null;

  const { data: created, error: createErr } = await supabase.from('aliens').insert([testAlien]).select();
  if (createErr) {
    console.error('❌ CREATE test FAILED:', createErr.message);
  } else {
    console.log('✅ CREATE works. Created alien id:', created[0].id);
    
    // Test UPDATE
    const { data: updated, error: updateErr } = await supabase
      .from('aliens')
      .update({ description: 'Updated description' })
      .eq('id', created[0].id)
      .select();
    if (updateErr) {
      console.error('❌ UPDATE test FAILED:', updateErr.message);
    } else {
      console.log('✅ UPDATE works.');
    }
    
    // Test DELETE (cleanup)
    const { error: deleteErr } = await supabase
      .from('aliens')
      .delete()
      .eq('id', created[0].id);
    if (deleteErr) {
      console.error('❌ DELETE test FAILED:', deleteErr.message);
    } else {
      console.log('✅ DELETE works. Test alien cleaned up.');
    }
  }

  console.log('\n=== Schema Verification Summary ===');
  console.log(`aliens table accessible: ✅`);
  console.log(`Columns present: ${present.join(', ') || 'none'}`);
  console.log(`Columns MISSING: ${missing.length === 0 ? 'none ✅' : missing.join(', ') + ' ⚠️'}`);
  console.log(`Storage bucket alien-assets: ${bucketErr ? '❌ MISSING' : '✅ EXISTS'}`);
}

runMigration().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
