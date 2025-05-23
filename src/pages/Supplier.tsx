
import React from 'react';
import { Layout } from '@/components/Layout';
import { RolePanels } from '@/components/RolePanels';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase, setupRealtimeSubscriptions } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Supplier = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();
  
  // Initialize supplier inventory and check permissions
  useEffect(() => {
    // Don't do anything if authentication is still loading
    if (isLoading) {
      return;
    }
    
    if (isAuthenticated && user?.role === 'supplier') {
      // Set up realtime subscriptions for all relevant tables
      setupRealtimeSubscriptions();
      
      // Check for RLS issues and create demo inventory if new supplier
      const setupSupplierRights = async () => {
        setIsChecking(true);
        try {
          // Ensure user is authenticated with Supabase
          const { data, error: sessionError } = await supabase.auth.getSession();
          const currentSession = data?.session;
          console.log("Auth session status:", currentSession ? "Active" : "None");
          
          if (!currentSession) {
            console.log("No active session found");
            
            // Try to refresh the session
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error("Failed to refresh session:", refreshError);
              toast({
                title: "Authentication Required",
                description: "Please log in again to manage your inventory.",
                variant: "destructive",
              });
              return;
            } else if (refreshData.session) {
              console.log("Session refreshed successfully");
            }
          }

          if (user?.id) {
            console.log("Current user ID:", user.id);
            
            // Try to fetch inventory to see if permissions are working
            const { data: inventoryData, error: inventoryError } = await supabase
              .from('inventory')
              .select('*')
              .eq('user_id', user.id)
              .limit(1);
              
            if (inventoryError) {
              console.error('Error checking supplier inventory:', inventoryError);
              toast({
                title: "Database Access Error",
                description: "Unable to access inventory. Please refresh or contact support.",
                variant: "destructive",
              });
            } else {
              console.log("Supplier inventory check successful:", inventoryData?.length || 0, "items found");
            }
            
            // Check for farmer requests targeted at this supplier
            const { data: requestsData, error: requestsError } = await supabase
              .from('requests')
              .select('*')
              .eq('type', 'purchase')
              .order('created_at', { ascending: false })
              .limit(5);
              
            if (requestsError) {
              console.error('Error checking farmer requests:', requestsError);
            } else {
              console.log("Recent purchase requests:", requestsData?.length || 0);
            }
          }
        } catch (error) {
          console.error('Error checking supplier rights:', error);
        } finally {
          setIsChecking(false);
        }
      };
      
      setupSupplierRights();
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, user, isLoading, toast]);
  
  // If still loading auth state, show a loading indicator
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading authentication status...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Supplier Dashboard</h1>
        
        {isChecking ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking permissions...</p>
          </div>
        ) : (
          <RolePanels role="supplier" />
        )}
        
        {!isAuthenticated && (
          <Card className="mt-8">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">FarmLytic for Suppliers</h2>
              <p className="mb-6">
                Manage your inventory, respond to farmer requests, and grow your 
                agricultural supply business with our integrated platform.
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => navigate('/login')}>
                  Login to Access
                </Button>
                <Button variant="outline" onClick={() => navigate('/register')}>
                  Register Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Supplier;
