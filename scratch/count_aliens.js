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
  const { data: aliens, error } = await supabase.from('aliens').select('id, name, watch_type, order_index, created_at');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Total aliens: ${aliens.length}`);
    aliens.forEach((a, i) => {
      console.log(`${i+1}. Name: "${a.name}", Watch: "${a.watch_type}", Order: ${a.order_index}, Created: ${a.created_at}`);
    });
  }
}

test();
