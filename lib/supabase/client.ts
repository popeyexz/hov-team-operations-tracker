import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cjmdzulucwuvzybvtgdz.supabase.co';
const defaultAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqbWR6dWx1Y3d1dnp5YnZ0Z2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4MTY0NTEsImV4cCI6MjExMDM5MjQ1MX0.rP1dJPQ-2fglkDrV2PMmMc5xItOkfgYdCsQa9rzQLxs';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultAnonKey;

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

