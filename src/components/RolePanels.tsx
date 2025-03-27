
import React from 'react';
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
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Check if the current user's role matches the expected role for this page
  const isCorrectRole = user?.role === role;
  
  // If user is not authenticated or has the wrong role, show appropriate message
  if (!isAuthenticated) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-3" />
          <h3 className="text-xl font-bold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground mb-4">
            Please log in to access this dashboard.
          </p>
          <Button onClick={() => navigate('/login')}>
            Log In
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!isCorrectRole) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-3" />
          <h3 className="text-xl font-bold mb-2">Incorrect Role</h3>
          <p className="text-muted-foreground mb-4">
            This dashboard is for {role}s. You're logged in as a {user?.role}.
          </p>
          <Button onClick={() => navigate(`/${user?.role}`)}>
            Go to Your Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="w-full">
      {role === 'farmer' && <FarmerPanel />}
      {role === 'supplier' && <SupplierPanel />}
      {role === 'specialist' && <SpecialistPanel />}
    </div>
  );
}
