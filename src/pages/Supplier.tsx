
import React from 'react';
import { Layout } from '@/components/Layout';
import { RolePanels } from '@/components/RolePanels';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Supplier = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
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
