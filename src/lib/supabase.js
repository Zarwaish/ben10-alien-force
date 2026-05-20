import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lmpvugbgdnrerucecgze.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_xGzUSWFUkcYGA0IwIJJjbg_elILikk0';

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
          gt: () => chain,
          gte: () => chain,
          lt: () => chain,
          lte: () => chain,
          like: () => chain,
          ilike: () => chain,
          is: () => chain,
          in: () => chain,
          contains: () => chain,
          containedBy: () => chain,
          filter: () => chain,
          match: () => chain,
          limit: () => chain,
          range: () => chain,
          order: () => chain,
          single: () => singleResult,
          maybeSingle: () => singleResult,
          then: (resolve) => emptyResult.then(resolve),
        };
        return chain;
      },
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
        })
      },
      channel: () => {
        const mockChannel = {
          on: () => mockChannel,
          subscribe: () => mockChannel
        };
        return mockChannel;
      },
      removeChannel: () => {}
    };

