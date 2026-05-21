import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lmpvugbgdnrerucecgze.supabase.co';
const supabaseAnonKey = 'sb_publishable_xGzUSWFUkcYGA0IwIJJjbg_elILikk0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Testing insert into aliens table...');
  try {
    const start = Date.now();
    const payload = {
      name: 'Test Alien ' + Math.random().toString(36).substring(7),
      description: 'A test description',
      power: 'Test power',
      type: 'Classic',
      image_url: 'https://example.com/test.png',
      gallery: [],
      watch_type: 'omnitrix',
      order_index: 1
    };
    
    console.info('Payload:', payload);
    
    const { data, error } = await supabase
      .from('aliens')
      .insert([payload])
      .select();
      
    console.log(`Insert query finished in ${Date.now() - start}ms`);
    if (error) {
      console.error('Insert Error:', error);
    } else {
      console.log('Insert Success:', data);
    }
  } catch (err) {
    console.error('Unexpected exception:', err);
  }
}

run();
