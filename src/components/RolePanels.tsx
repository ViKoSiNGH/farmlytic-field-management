import React, { useEffect, useState } from 'react';
import SupplierPanel from '@/components/SupplierPanel';
import { SpecialistPanel } from '@/components/SpecialistPanel';
import FarmerPanel from '@/components/FarmerPanel';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { supabase, setupRealtimeSubscriptions, refreshAuthSession } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RolePanelsProps {
  role: 'farmer' | 'supplier' | 'specialist';
}

export function RolePanels({ role }: RolePanelsProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [localLoading, setLocalLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    console.log("RolePanels - Auth state:", { isAuthenticated, user, isLoading, role });
    
    const checkSupabaseSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("RolePanels - Supabase session check:", data.session);
      
      if (!data.session && isAuthenticated) {
        console.warn("Auth mismatch - logged in through context but no active Supabase session");
        
        const refreshed = await refreshAuthSession();
        if (!refreshed) {
          toast({
            title: "Authentication Issue",
            description: "Your session couldn't be verified. Please log in again.",
            variant: "destructive"
          });
          navigate('/login', { replace: true });
        }
      }
    };
    
    checkSupabaseSession();
    
    if (isAuthenticated) {
      setupRealtimeSubscriptions();
    }
  }, [isAuthenticated, user, isLoading, role, navigate, toast]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalLoading(false);
      console.log("RolePanels - Local loading set to false");
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (!isLoading && !localLoading && !isAuthenticated) {
      console.log("RolePanels - User not authenticated, redirecting to login");
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, localLoading, navigate]);
  
  if (isLoading || localLoading) {
    return (
      <div className="w-full text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }
  
  const isCorrectRole = user?.role === role;
  
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
  
  return (
    <div className="w-full">
      {role === 'farmer' && <FarmerPanel />}
      {role === 'supplier' && <SupplierPanel />}
      {role === 'specialist' && <SpecialistPanel />}
    </div>
  );
}
