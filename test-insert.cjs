const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lmpvugbgdnrerucecgze.supabase.co';
const supabaseKey = 'sb_publishable_xGzUSWFUkcYGA0IwIJJjbg_elILikk0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('Testing fallback insert omitting ID entirely...');
  const payload = {
    name: 'TestAlien',
    description: 'Test',
    power: 'Test',
    image_url: 'https://example.com/img.png',
    gallery: [],
    type: 'Classic',
    created_at: new Date().toISOString()
  };

  const { data: d2, error: e2 } = await supabase.from('aliens').insert([payload]).select();
  
  if (e2) {
    console.error('Insert failed:', e2);
  } else {
    console.log('Insert succeeded:', d2);
  }
}

testInsert();
