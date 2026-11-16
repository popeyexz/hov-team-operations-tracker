import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qglghldegdikwjzileno.supabase.co';
// Fallback key ensures static collection during CI/CD build does not fail before env vars are mounted
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbGdobGRlZ2Rpa3dqemlsZW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3MzIwMTQsImV4cCI6MjExMDMwODAxNH0.eYaZBeohuDy-2JlCFqE8X9zoTFlIyzM6pSJaeswZzfU';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultKey;

export const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
