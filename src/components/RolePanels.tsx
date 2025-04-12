
import React, { useEffect, useState } from 'react';
import { SupplierPanel } from '@/components/SupplierPanel';
import { SpecialistPanel } from '@/components/SpecialistPanel';
import { FarmerPanel } from '@/components/FarmerPanel';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface RolePanelsProps {
  role: 'farmer' | 'supplier' | 'specialist';
}

export function RolePanels({ role }: RolePanelsProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [localLoading, setLocalLoading] = useState(true);
  
  // Debug logging
  useEffect(() => {
    console.log("RolePanels - Auth state:", { isAuthenticated, user, isLoading, role });
  }, [isAuthenticated, user, isLoading, role]);
  
  // Add a small delay to ensure auth state is properly synchronized
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalLoading(false);
      console.log("RolePanels - Local loading set to false");
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // If not authenticated after loading, redirect to login
  useEffect(() => {
    if (!isLoading && !localLoading && !isAuthenticated) {
      console.log("RolePanels - User not authenticated, redirecting to login");
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, localLoading, navigate]);
  
  // Combined loading state (auth loading or local loading)
  if (isLoading || localLoading) {
    return (
      <div className="w-full text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }
  
  // Check if the current user's role matches the expected role for this page
  const isCorrectRole = user?.role === role;
  
  // If user is not authenticated, show appropriate message
  if (!isAuthenticated) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-3" />
          <h3 className="text-xl font-bold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground mb-4">
            Please log in to access this dashboard.
          </p>
          <Button onClick={() => navigate('/login', { replace: true })}>
            Log In
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // If user has wrong role, show redirect message
  if (!isCorrectRole) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-3" />
          <h3 className="text-xl font-bold mb-2">Incorrect Role</h3>
          <p className="text-muted-foreground mb-4">
            This dashboard is for {role}s. You're logged in as a {user?.role}.
          </p>
          <Button onClick={() => navigate(`/${user?.role}`, { replace: true })}>
            Go to Your Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // If authentication and role checks pass, render the appropriate panel
  return (
    <div className="w-full">
      {role === 'farmer' && <FarmerPanel />}
      {role === 'supplier' && <SupplierPanel />}
      {role === 'specialist' && <SpecialistPanel />}
    </div>
  );
}
