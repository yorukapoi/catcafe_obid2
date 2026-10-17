import { createClient } from '@supabase/supabase-js';

const runtime =
  (window as unknown as { __ENV__?: Record<string, string> }).__ENV__ ?? {};

const supabaseUrl =
  runtime.VITE_SUPABASE_URL || (import.meta.env.VITE_SUPABASE_URL as string);
const supabaseAnonKey =
  runtime.VITE_SUPABASE_ANON_KEY || (import.meta.env.VITE_SUPABASE_ANON_KEY as string);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'cat-cafe-auth',
  },
});
