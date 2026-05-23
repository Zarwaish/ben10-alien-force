// fix_admin_profile.js
// Run with: node scripts/fix_admin_profile.js
// This script upserts the admin user's profile ensuring the admin role is set.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase env vars missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  // Get current session (you must be logged in as admin before running this script)
  const { data: { session }, error: sessErr } = await supabase.auth.getSession();
  if (sessErr || !session) {
    console.error('No active session. Please login as admin via the app, then run this script.');
    process.exit(1);
  }
  const uid = session.user.id;
  const username = session.user.user_metadata?.username || session.user.email?.split('@')[0];
  const email = session.user.email;

  const { data, error } = await supabase.from('profiles').upsert([
    {
      id: uid,
      username,
      email,
      role: 'admin'
    }
  ], { onConflict: 'id' });

  if (error) {
    console.error('Upsert error:', error.message);
    process.exit(1);
  }
  console.log('Admin profile upserted/updated successfully:', data);
}

main();
