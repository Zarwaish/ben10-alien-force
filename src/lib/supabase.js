import { createClient } from '@supabase/supabase-js';

// Validate required env vars – if missing, throw a clear error in production
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isDev = import.meta.env.DEV && typeof window !== 'undefined' && window.location.hostname === 'localhost';

let supabase;

if (!url || !anonKey) {
  if (isDev) {
    console.warn('Supabase env vars missing – using dev mock client');
    // Minimal mock client for local development without real Supabase
    supabase = {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured – set .env') }),
        signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured – set .env') }),
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
    const errMsg = 'Supabase configuration missing or invalid. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.';
    console.error(errMsg);
    throw new Error(errMsg);
  }
} else {
  supabase = createClient(url, anonKey);
}

export { supabase };
