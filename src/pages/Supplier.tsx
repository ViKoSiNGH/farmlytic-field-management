
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
  
  // Fix RLS policies for the supplier - set up demo inventory if needed
  useEffect(() => {
    if (isAuthenticated && user?.role === 'supplier') {
      // Check for RLS issues and create demo inventory if new supplier
      const setupSupplierRights = async () => {
        try {
          // Try to fetch inventory to see if permissions are working
          const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .limit(1);
            
          if (error) {
            console.error('Error checking supplier inventory:', error);
            
            // Try to insert a demo item anyway - this will help verify if RLS policy needs fixing
            const demoItem = {
              user_id: user.id,
              name: 'Sample Fertilizer',
              type: 'Fertilizer',
              quantity: 100,
              unit: 'kg',
              price: 25,
              available: true
            };
            
            const { error: insertError } = await supabase
              .from('inventory')
              .insert(demoItem);
              
            if (insertError) {
              console.error('Error setting up supplier inventory:', insertError);
            } else {
              console.log('Sample inventory item added silently');
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
