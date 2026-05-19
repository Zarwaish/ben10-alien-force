const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lmpvugbgdnrerucecgze.supabase.co';
const supabaseKey = 'sb_publishable_xGzUSWFUkcYGA0IwIJJjbg_elILikk0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthInsert() {
  console.log('Registering test user...');
  const email = `test${Date.now()}@plumber.com`;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'password123'
  });

  if (authError) {
    console.error('Signup failed:', authError);
    return;
  }

  console.log('Logged in as:', authData.user.id);
  
  const payload = {
    name: 'TestAlienAuth',
    description: 'Test',
    power: 'Test',
    image_url: 'https://example.com/img.png',
    gallery: [],
    type: 'Classic',
    created_at: new Date().toISOString()
  };

  console.log('Inserting alien...');
  const { data, error } = await supabase.from('aliens').insert([payload]).select();
  
  if (error) {
    console.error('Insert failed even with Auth:', error);
  } else {
    console.log('Insert succeeded with Auth!', data);
  }
}

testAuthInsert();
