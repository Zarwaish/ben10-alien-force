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
  console.log('Querying pg_policies...');
  const { data, error } = await supabase.from('aliens').select('id').limit(1);
  console.log('Querying aliens table directly:');
  console.log('Data:', data);
  console.log('Error:', error);
}

test();
