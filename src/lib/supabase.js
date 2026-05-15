import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are valid URLs/strings to prevent createClient from throwing
const isValidConfig = supabaseUrl && 
                     supabaseAnonKey && 
                     supabaseUrl.startsWith('http');

if (!isValidConfig) {
  console.warn('Supabase credentials missing or invalid. Please check your .env file.');
}

// Export a safe instance or a dummy to prevent top-level crashes
export const supabase = isValidConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ 
          data: { subscription: { unsubscribe: () => {} } } 
        }),
        signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured. Add credentials to .env') }),
        signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured. Add credentials to .env') }),
        signOut: () => Promise.resolve(),
      },
      from: () => {
        const emptyResult = Promise.resolve({ data: [], error: null });
        const singleResult = Promise.resolve({ data: null, error: null });
        const chain = {
          select: () => chain,
          insert: () => chain,
          update: () => chain,
          delete: () => chain,
          upsert: () => chain,
          eq: () => chain,
          neq: () => chain,
          order: () => emptyResult,
          single: () => singleResult,
          then: (resolve) => emptyResult.then(resolve),
        };
        return chain;
      },
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
        })
      }
    };

