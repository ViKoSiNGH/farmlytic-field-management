
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zfkivbvznyscgkguxmny.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpma2l2YnZ6bnlzY2drZ3V4bW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4OTU5NjAsImV4cCI6MjA1ODQ3MTk2MH0.qqiD2ICx_1nsXD4Ff_SeKChkO3Clm6L0joMwAjBN1_I";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'farmlytic_auth',
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
});
