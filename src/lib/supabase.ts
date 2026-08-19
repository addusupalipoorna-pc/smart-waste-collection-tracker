import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://unidpyfrqifxxpiibfgr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuaWRweWZycWlmeHhwaWliZmdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1OTc3ODIsImV4cCI6MjEwMTE3Mzc4Mn0.uZHstSpNo_beJrRbGt_0CtgrUiSlsV39EBnGNzbTPZ4';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
