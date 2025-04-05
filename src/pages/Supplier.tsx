
import React from 'react';
import { Layout } from '@/components/Layout';
import { RolePanels } from '@/components/RolePanels';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Supplier = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Initialize supplier inventory silently without prompts
  useEffect(() => {
    if (isAuthenticated && user?.role === 'supplier') {
      // Check for RLS issues and create demo inventory if new supplier - but without prompts
      const setupSupplierRights = async () => {
        try {
          // Try to fetch inventory to see if permissions are working
          const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .limit(1);
            
          if (error) {
            console.error('Error checking supplier inventory:', error);
          } else {
            console.log("Supplier inventory check successful:", data?.length || 0, "items found");
            
            // Check if user is connected to Supabase auth
            const { data: session } = await supabase.auth.getSession();
            console.log("Auth session status:", session?.session ? "Active" : "None");
            if (user?.id) {
              console.log("Current user ID:", user.id);
            }
          }
        } catch (error) {
          console.error('Error checking supplier rights:', error);
        }
      };
      
      setupSupplierRights();
    }
  }, [isAuthenticated, user]);
  
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Supplier Dashboard</h1>
        <RolePanels role="supplier" />
        
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
