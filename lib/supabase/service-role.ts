import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createServiceRoleClient() {
  if (typeof window !== 'undefined') {
    throw new Error('SECURITY VIOLATION: SUPABASE_SERVICE_ROLE_KEY client invoked in browser context.');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nlfgpswjldycdfcyymab.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not defined.');
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
