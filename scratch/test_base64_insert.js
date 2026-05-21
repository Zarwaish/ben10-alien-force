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
  console.log('Generating 500KB base64 string...');
  const base64Data = 'data:image/png;base64,' + 'A'.repeat(500 * 1024);

  console.log('Inserting alien with base64 image_url...');
  const testPayload = {
    name: 'Base64 Alien ' + Date.now(),
    description: 'This is a test alien with base64 image.',
    power: 'Testing Base64',
    image_url: base64Data,
    type: 'Classic',
    watch_type: 'omnitrix',
    order_index: 100,
    gallery: []
  };

  const { data: inserted, error: insertErr } = await supabase.from('aliens').insert([testPayload]).select();
  if (insertErr) {
    console.error('Error inserting base64 alien:', insertErr);
  } else {
    console.log('Insert succeeded! ID:', inserted[0].id);
  }
}

test();
