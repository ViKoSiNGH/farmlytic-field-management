
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
            <img 
              src="/lovable-uploads/541c9c97-d08b-4a94-9405-16d7ecfd437a.png" 
              alt="Agriculture Farm" 
              className="w-full h-[400px] object-cover"
              onError={(e) => {
                // Fallback image if the uploaded one fails
                e.currentTarget.src = "/lovable-uploads/b17c3e60-1feb-4d93-97d6-9d82335b2af4.png";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 text-white">
              <h2 className="text-3xl font-bold mb-2">Agriculture & Eco Farming</h2>
              <p className="text-lg mb-4">Sustainable solutions for modern agriculture</p>
              <Button 
                onClick={() => navigate('/register')} 
                className="w-fit bg-amber-500 hover:bg-amber-600 text-white"
                size="lg"
              >
                Discover More
              </Button>
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
