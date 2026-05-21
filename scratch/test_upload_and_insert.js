import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env
const envPath = path.resolve('d:/ben10-alien-force/.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const url = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, anonKey);

async function test() {
  console.log('1. Testing storage upload...');
  const testBuffer = Buffer.from('test image data');
  const filename = `test-${Date.now()}.txt`;
  
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from('alien-assets')
    .upload(filename, testBuffer, {
      contentType: 'text/plain',
      cacheControl: '3600',
      upsert: true
    });

  if (uploadErr) {
    console.error('Storage upload FAILED:', uploadErr);
    console.log('Note: If this is an RLS error, please ensure you ran the updated SQL script in your Supabase SQL Editor.');
    return;
  }
  
  console.log('Storage upload SUCCEEDED! Upload data:', uploadData);
  
  const { data: { publicUrl } } = supabase.storage
    .from('alien-assets')
    .getPublicUrl(filename);
    
  console.log('Generated Public URL:', publicUrl);

  console.log('2. Testing database insertion with uploaded URL...');
  const testPayload = {
    name: 'Verified Alien ' + Date.now(),
    description: 'This is a test alien verified by the developer.',
    power: 'Verification, Integrity',
    image_url: publicUrl,
    type: 'Classic',
    watch_type: 'both',
    order_index: 5,
    gallery: [publicUrl]
  };

  const { data: inserted, error: insertErr } = await supabase.from('aliens').insert([testPayload]).select();
  if (insertErr) {
    console.error('Database insertion FAILED:', insertErr);
  } else {
    console.log('Database insertion SUCCEEDED! Inserted alien:', inserted[0]);
  }
}

test();
