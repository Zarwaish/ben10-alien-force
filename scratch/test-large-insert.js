import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lmpvugbgdnrerucecgze.supabase.co';
const supabaseAnonKey = 'sb_publishable_xGzUSWFUkcYGA0IwIJJjbg_elILikk0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Testing large base64 insert into aliens table...');
  try {
    const start = Date.now();
    
    // Generate a ~3MB base64 dummy string
    const base64Data = 'A'.repeat(3 * 1024 * 1024);
    const largeImageUrl = `data:image/png;base64,${base64Data}`;
    
    const payload = {
      name: 'Large Alien ' + Math.random().toString(36).substring(7),
      description: 'A test description',
      power: 'Test power',
      type: 'Classic',
      image_url: largeImageUrl,
      gallery: [],
      watch_type: 'omnitrix',
      order_index: 1
    };
    
    console.info('Payload size:', Math.round(largeImageUrl.length / 1024 / 1024 * 100) / 100, 'MB');
    
    const { data, error } = await supabase
      .from('aliens')
      .insert([payload])
      .select();
      
    console.log(`Insert query finished in ${Date.now() - start}ms`);
    if (error) {
      console.error('Insert Error:', error);
    } else {
      console.log('Insert Success:', data ? 'Row created (ID: ' + data[0].id + ')' : 'No data returned');
    }
  } catch (err) {
    console.error('Unexpected exception:', err);
  }
}

run();
