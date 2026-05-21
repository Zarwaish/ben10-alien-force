import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase env missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Setting up realtime subscription on aliens...');
  const channel = supabase.channel('public:test-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'aliens' }, payload => {
      console.log('Realtime event received:', payload);
    })
    .subscribe();

  // Wait briefly then insert a test alien
  await new Promise(r => setTimeout(r, 2000));
  console.log('Inserting test alien');
  const { data, error } = await supabase.from('aliens').insert([
    {
      name: 'RealtimeTestAlien',
      description: 'Test insert for realtime',
      power: 'test',
      type: 'Classic',
      image_url: '',
      watch_type: 'omnitrix',
      order_index: 9999,
    }
  ]).select();
  if (error) console.error('Insert error', error);
  else console.log('Insert success', data);

  // Keep process alive for a few seconds to receive event
  await new Promise(r => setTimeout(r, 5000));
  console.log('Cleaning up');
  supabase.removeChannel(channel);
}

main();
