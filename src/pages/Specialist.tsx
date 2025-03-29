
import React from 'react';
import { Layout } from '@/components/Layout';
import { RolePanels } from '@/components/RolePanels';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Specialist = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Create demo advice requests for testing if user is authenticated and a specialist
    const createDemoRequests = async () => {
      if (!isAuthenticated || user?.role !== 'specialist') return;

      try {
        // Check if demo requests already exist for this specialist
        const { data: existingRequests, error: checkError } = await supabase
          .from('requests')
          .select('*')
          .eq('target_id', user.id)
          .eq('type', 'advice');

        if (checkError) {
          console.error('Error checking for existing requests:', checkError);
          return;
        }

        // Only create demo requests if none exist
        if (!existingRequests || existingRequests.length === 0) {
          // Create 2 demo advice requests
          const demoRequests = [
            {
              farmer_id: 'demo-farmer-1',
              type: 'advice',
              description: 'I have some tomato plants showing yellow leaves and spots. Could this be a fungal infection? What treatment would you recommend?',
              status: 'pending',
              target_id: user.id,
              contact_phone: '555-123-4567',
              contact_email: 'demo.farmer@example.com',
              created_at: new Date().toISOString()
            },
            {
              farmer_id: 'demo-farmer-2',
              type: 'advice',
              description: 'My wheat field has uneven growth patterns. Some areas are growing well while others are stunted. Could this be a nutrient deficiency or soil problem?',
              status: 'pending',
              target_id: user.id,
              contact_phone: '555-987-6543',
              contact_email: 'demo.farmer2@example.com',
              created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
            }
          ];

          for (const request of demoRequests) {
            const { error } = await supabase.from('requests').insert(request);
            if (error) {
              console.error('Error creating demo request:', error);
            }
          }

          toast({
            title: "Demo Requests Created",
            description: "Demo advice requests have been added for testing purposes."
          });
        }
      } catch (error) {
        console.error('Error setting up demo requests:', error);
      }
    };

    // Call the function to create demo requests
    createDemoRequests();
  }, [isAuthenticated, user]);

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Specialist Dashboard</h1>
        <RolePanels role="specialist" />
      </div>
    </Layout>
  );
};

export default Specialist;
