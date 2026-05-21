import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
(async () => {
  const { data, error } = await supabase.from('aliens').select('*').limit(5);
  console.log('Fetched data:', data);
  if (error) console.error('Error:', error);
})();
