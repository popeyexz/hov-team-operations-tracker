import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cjmdzulucwuvzybvtgdz.supabase.co';
// Fallback key ensures static collection during CI/CD build does not fail before env vars are mounted
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqbWR6dWx1Y3d1dnp5YnZ0Z2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4MTY0NTEsImV4cCI6MjExMDM5MjQ1MX0.rP1dJPQ-2fglkDrV2PMmMc5xItOkfgYdCsQa9rzQLxs';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultKey;

export const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
