import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qglghldegdikwjzileno.supabase.co';
const defaultAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbGdobGRlZ2Rpa3dqemlsZW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3MzIwMTQsImV4cCI6MjExMDMwODAxNH0.eYaZBeohuDy-2JlCFqE8X9zoTFlIyzM6pSJaeswZzfU';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultAnonKey;

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

