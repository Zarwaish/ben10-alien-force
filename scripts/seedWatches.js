import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Load Supabase credentials from .env for Node execution
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase env vars missing – cannot seed data');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const watches = [
  // Omnitrix watches
  {
    name: 'Omnitrix Classic',
    description: 'Original alien transformation device',
    type: 'omnitrix',
    order_index: 1,
    image_url: 'https://example.com/omnitrix_classic.png',
    status: 'available'
  },
  {
    name: 'Omnitrix Pro',
    description: 'Advanced version with more alien slots',
    type: 'omnitrix',
    order_index: 2,
    image_url: 'https://example.com/omnitrix_pro.png',
    status: 'available'
  },
  // Ultimatrix watches
  {
    name: 'Ultimatrix Starter',
    description: 'First generation Ultimatrix',
    type: 'ultimatrix',
    order_index: 1,
    image_url: 'https://example.com/ultimatrix_starter.png',
    status: 'available'
  },
  {
    name: 'Ultimatrix Elite',
    description: 'High‑end Ultimatrix with extra features',
    type: 'ultimatrix',
    order_index: 2,
    image_url: 'https://example.com/ultimatrix_elite.png',
    status: 'available'
  },
  // Shared watches (both devices)
  {
    name: 'Universal Watch',
    description: 'Works on both Omnitrix and Ultimatrix',
    type: 'both',
    order_index: 99,
    image_url: 'https://example.com/universal_watch.png',
    status: 'available'
  }
];

async function seed() {
  const { data, error } = await supabase.from('watches').insert(watches);
  if (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
  console.log('Seeded watches:', data);
}

seed();
