
import React from 'react';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <Layout>
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <div className="container mx-auto py-8 space-y-6 animate-fade-in">
          <h1 className="text-4xl font-bold text-center mb-8">Welcome to FarmLytic</h1>
          
          <div className="rounded-lg overflow-hidden mb-6">
            <img 
              src="/lovable-uploads/b17c3e60-1feb-4d93-97d6-9d82335b2af4.png" 
              alt="FarmLytic Platform" 
              className="w-full h-64 object-cover"
            />
          </div>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">The Complete Agricultural Management Platform</h2>
              <p className="text-lg mb-4">
                FarmLytic connects farmers, suppliers, and agricultural specialists in one integrated ecosystem.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950">
                  <h3 className="font-bold text-xl mb-2">For Farmers</h3>
                  <p>Manage crops, track field conditions, and get expert advice to optimize your farming operations.</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <h3 className="font-bold text-xl mb-2">For Suppliers</h3>
                  <p>Reach farmers directly, manage inventory efficiently, and grow your agricultural supply business.</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950">
                  <h3 className="font-bold text-xl mb-2">For Specialists</h3>
                  <p>Provide expert agricultural advice, connect with farmers, and contribute to sustainable farming practices.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default Index;
