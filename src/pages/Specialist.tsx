
import React, { useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { RolePanels } from '@/components/RolePanels';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

const Specialist = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Create demo advice requests for testing if user is authenticated and a specialist
    const createDemoRequests = async () => {
      if (!isAuthenticated || !user || user?.role !== 'specialist') {
        console.log('Not creating demo requests: user not authenticated or not a specialist');
        return;
      }

      try {
        console.log('Checking for existing requests for specialist:', user.id);
        
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
          console.log('No existing requests found, creating demo requests');
          
          // Use proper UUID format for demo farmers
          const demoRequests = [
            {
              farmer_id: uuidv4(), // Generate real UUID for farmer_id
              type: 'advice',
              description: 'I have some tomato plants showing yellow leaves and spots. Could this be a fungal infection? What treatment would you recommend?',
              status: 'pending',
              target_id: user.id,
              contact_phone: '555-123-4567',
              contact_email: 'demo.farmer@example.com',
              created_at: new Date().toISOString()
            },
            {
              farmer_id: uuidv4(), // Generate real UUID for farmer_id
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
            const { error, data } = await supabase.from('requests').insert(request);
            if (error) {
              console.error('Error creating demo request:', error);
            } else {
              console.log('Demo request created successfully:', data);
            }
          }
          
          toast({
            title: "Demo Content Created",
            description: "Sample advice requests have been created for your specialist account.",
          });
        } else {
          console.log('Demo requests already exist:', existingRequests.length);
        }
      } catch (error) {
        console.error('Error setting up demo requests:', error);
      }
    };

    // Call the function to create demo requests
    if (isAuthenticated && user) {
      setTimeout(() => {
        createDemoRequests();
      }, 1000); // Slight delay to ensure auth is fully loaded
    }
  }, [isAuthenticated, user, toast]);

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
