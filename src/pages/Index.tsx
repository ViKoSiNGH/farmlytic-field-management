
import React from 'react';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  return (
    <Layout>
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <div className="container mx-auto py-8 space-y-6 animate-fade-in">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to FarmLytic</h1>
            <p className="text-xl text-muted-foreground mb-8">The Complete Agricultural Management Platform</p>
          </div>
          
          <div className="rounded-lg overflow-hidden mb-6 relative">
            <div className="bg-gradient-to-r from-green-800 to-green-600 h-[300px] w-full flex items-center justify-center">
              <div className="text-center text-white p-8">
                <h2 className="text-3xl font-bold mb-4">Agriculture & Eco Farming</h2>
                <p className="text-lg mb-6">Sustainable solutions for modern agriculture</p>
                <Button 
                  onClick={() => navigate('/register')} 
                  className="w-fit bg-amber-500 hover:bg-amber-600 text-white"
                  size="lg"
                >
                  Discover More
                </Button>
              </div>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Complete Agricultural Management Platform</h2>
              <p className="text-lg mb-8 text-center">
                FarmLytic connects farmers, suppliers, and agricultural specialists in one integrated ecosystem.
              </p>
              <div className="grid md:grid-cols-3 gap-8 mt-8">
                <div className="text-center p-6 rounded-lg bg-green-50 dark:bg-green-950 shadow-sm hover:shadow-md transition-all">
                  <h3 className="font-bold text-xl mb-4">For Farmers</h3>
                  <p className="mb-6">Manage crops, track field conditions, and get expert advice to optimize your farming operations.</p>
                  <Button onClick={() => navigate('/register?role=farmer')} variant="outline" className="w-full">Get Started</Button>
                </div>
                <div className="text-center p-6 rounded-lg bg-blue-50 dark:bg-blue-950 shadow-sm hover:shadow-md transition-all">
                  <h3 className="font-bold text-xl mb-4">For Suppliers</h3>
                  <p className="mb-6">Reach farmers directly, manage inventory efficiently, and grow your agricultural supply business.</p>
                  <Button onClick={() => navigate('/register?role=supplier')} variant="outline" className="w-full">Get Started</Button>
                </div>
                <div className="text-center p-6 rounded-lg bg-purple-50 dark:bg-purple-950 shadow-sm hover:shadow-md transition-all">
                  <h3 className="font-bold text-xl mb-4">For Specialists</h3>
                  <p className="mb-6">Provide expert agricultural advice, connect with farmers, and contribute to sustainable farming practices.</p>
                  <Button onClick={() => navigate('/register?role=specialist')} variant="outline" className="w-full">Get Started</Button>
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
