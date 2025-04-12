
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zfkivbvznyscgkguxmny.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpma2l2YnZ6bnlzY2drZ3V4bW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4OTU5NjAsImV4cCI6MjA1ODQ3MTk2MH0.qqiD2ICx_1nsXD4Ff_SeKChkO3Clm6L0joMwAjBN1_I";

// Create a single supabase client for the entire app
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'farmlytic_auth',
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Enable real-time subscriptions for all relevant tables
const TABLES_TO_SYNC = ['inventory', 'requests', 'profiles'];
let realtimeSetup = false;

export const setupRealtimeSubscriptions = async () => {
  if (realtimeSetup) return;
  
  try {
    TABLES_TO_SYNC.forEach(table => {
      supabase
        .channel(`public:${table}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table 
        }, (payload) => {
          console.log(`Realtime update for ${table}:`, payload);
        })
        .subscribe();
    });
    
    realtimeSetup = true;
    console.log('Realtime subscriptions set up for:', TABLES_TO_SYNC.join(', '));
  } catch (error) {
    console.error('Error setting up realtime subscriptions:', error);
  }
};

// Add enhanced debug logging for authentication events
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session ? 'User authenticated' : 'No session');
  
  // Force refresh of auth state in local storage
  if (session) {
    localStorage.setItem('farmlytic_auth', JSON.stringify(session));
  }
});

console.log('Supabase client initialized with persistSession and autoRefreshToken');

// Refresh the Supabase session to ensure we have an active one
supabase.auth.refreshSession();
