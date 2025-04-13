
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zfkivbvznyscgkguxmny.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpma2l2YnZ6bnlzY2drZ3V4bW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4OTU5NjAsImV4cCI6MjA1ODQ3MTk2MH0.qqiD2ICx_1nsXD4Ff_SeKChkO3Clm6L0joMwAjBN1_I";

// Create a single supabase client for the entire app with improved configuration
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
    // Ensure the client is connected to the realtime server
    await supabase.realtime.setAuth(SUPABASE_PUBLISHABLE_KEY);
    
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
        .subscribe((status) => {
          console.log(`Subscription status for ${table}:`, status);
        });
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
    console.log('Session stored in localStorage');
  }
});

// Ensure we have an active session by refreshing on startup
(async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error refreshing session:', error);
    } else if (data.session) {
      console.log('Active session found:', data.session.user.id);
      setupRealtimeSubscriptions();
    } else {
      console.log('No active session found, will need to log in');
    }
  } catch (e) {
    console.error('Error checking session:', e);
  }
})();

// Export a function to do a full auth refresh when needed
export const refreshAuthSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Failed to refresh auth session:', error);
      return false;
    }
    console.log('Auth session refreshed successfully');
    setupRealtimeSubscriptions();
    return true;
  } catch (e) {
    console.error('Error during auth refresh:', e);
    return false;
  }
};
