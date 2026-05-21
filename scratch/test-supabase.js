import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lmpvugbgdnrerucecgze.supabase.co';
const supabaseAnonKey = 'sb_publishable_xGzUSWFUkcYGA0IwIJJjbg_elILikk0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Testing connection to Supabase...');
  try {
    const start = Date.now();
    const { data, error } = await supabase.from('aliens').select('*').limit(1);
    console.log(`Query finished in ${Date.now() - start}ms`);
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success:', data);
    }
  } catch (err) {
    console.error('Unexpected exception:', err);
  }
}

run();
