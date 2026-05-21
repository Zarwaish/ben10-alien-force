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

console.log('Supabase URL:', url);
console.log('Supabase Anon Key:', anonKey ? 'Found' : 'Missing');

const supabase = createClient(url, anonKey);

async function test() {
  console.log('Testing connection...');
  
  // 1. Check profiles
  console.log('Querying profiles...');
  const { data: profiles, error: profErr } = await supabase.from('profiles').select('*').limit(5);
  if (profErr) {
    console.error('Error fetching profiles:', profErr);
  } else {
    console.log('Profiles:', profiles);
  }

  // 2. Check aliens schema and rows
  console.log('Querying aliens...');
  const { data: aliens, error: alienErr } = await supabase.from('aliens').select('*').limit(5);
  if (alienErr) {
    console.error('Error fetching aliens:', alienErr);
  } else {
    console.log('Aliens count:', aliens.length);
    console.log('Aliens sample:', aliens[0]);
  }

  // 3. Test insert
  console.log('Inserting test alien...');
  const testPayload = {
    name: 'Test Alien ' + Date.now(),
    description: 'This is a test alien created by debugger.',
    power: 'Debugging, Testing',
    image_url: 'https://example.com/test.png',
    type: 'Classic',
    watch_type: 'omnitrix',
    order_index: 999,
    gallery: []
  };

  const { data: inserted, error: insertErr } = await supabase.from('aliens').insert([testPayload]).select();
  if (insertErr) {
    console.error('Error inserting alien:', insertErr);
  } else {
    console.log('Insert succeeded! Inserted alien:', inserted);
  }

  // 4. Test storage upload
  console.log('Testing storage upload to alien-assets...');
  const testBuffer = Buffer.from('test image data');
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from('alien-assets')
    .upload('test-' + Date.now() + '.txt', testBuffer, {
      contentType: 'text/plain'
    });

  if (uploadErr) {
    console.error('Error uploading file to storage:', uploadErr);
  } else {
    console.log('Upload succeeded! Upload data:', uploadData);
  }
}

test();
