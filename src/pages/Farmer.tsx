
import React, { useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { RolePanels } from '@/components/RolePanels';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase, setupRealtimeSubscriptions } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Farmer = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Initialize farmer settings and realtime subscriptions
  useEffect(() => {
    if (isAuthenticated && user?.role === 'farmer') {
      // Set up realtime subscriptions for all relevant tables
      setupRealtimeSubscriptions();
      
      // Check if farmer has any fields yet
      const setupFarmerDefaults = async () => {
        try {
          const { data: fields, error } = await supabase
            .from('fields')
            .select('*')
            .eq('user_id', user.id)
            .limit(1);
            
          // No automatic redirects or toasts - just check if fields exist
          console.log("Farmer has fields:", fields && fields.length > 0);
          
          // Check inventory availability to ensure we can display items from suppliers
          const { data: inventoryItems, error: inventoryError } = await supabase
            .from('inventory')
            .select('*')
            .eq('available', true)
            .limit(5);
            
          if (inventoryError) {
            console.error('Error checking inventory:', inventoryError);
          } else {
            console.log("Available inventory items:", inventoryItems?.length || 0);
          }
        } catch (error) {
          console.error('Error checking farmer setup:', error);
        }
      };
      
      setupFarmerDefaults();
    }
  }, [isAuthenticated, user, toast]);
  
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Farmer Dashboard</h1>
        <RolePanels role="farmer" />
        
        {!isAuthenticated && (
          <Card className="mt-8">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">FarmLytic for Farmers</h2>
              <p className="mb-6">
                Manage your crops, track field conditions, get advice from specialists, 
                and connect with suppliers - all in one place.
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

export default Farmer;
