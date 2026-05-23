import { createClient } from '@supabase/supabase-js';

// Validate required env vars – if missing, fall back to a mock client for local development.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Determines if we are running on a local dev server.
const isDev = import.meta.env.DEV && typeof window !== 'undefined' && window.location.hostname === 'localhost';

let supabase;

if (!url || !anonKey) {
  // Missing environment variables – use a lightweight mock client.
  if (isDev) {
    console.warn('Supabase env vars missing – using dev mock client');
  } else {
    console.warn('Supabase env vars missing – using fallback mock client');
  }
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () =>
        Promise.resolve({ data: null, error: new Error('Supabase not configured – set .env') }),
      signUp: () =>
        Promise.resolve({ data: null, error: new Error('Supabase not configured – set .env') }),
      signOut: () => Promise.resolve()
    },
    from: () => ({
      select: () => ({ then: (cb) => cb({ data: [], error: null }) }),
      insert: () => ({ select: () => ({ then: (cb) => cb({ data: [], error: null }) }) })
    }),
    channel: () => ({ on: () => ({ subscribe: () => {} }) }),
    removeChannel: () => {}
  };
} else {
  // All required vars are present – create the real Supabase client.
  supabase = createClient(url, anonKey, { auth: { persistSession: true } });
}

export { supabase };
