
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/use-auth';
import { Navigate, useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Login() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [localLoading, setLocalLoading] = useState(true);
  
  // Console log to debug authentication state
  useEffect(() => {
    console.log("Login page - Auth state:", { isAuthenticated, user, isLoading });
  }, [isAuthenticated, user, isLoading]);
  
  useEffect(() => {
    // Add a small delay to ensure auth state is properly loaded
    const timer = setTimeout(() => {
      setLocalLoading(false);
      console.log("Local loading set to false");
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle redirection after authentication is confirmed
  useEffect(() => {
    if (!isLoading && !localLoading && isAuthenticated && user) {
      console.log("Login page: User is authenticated, redirecting to", `/${user.role}`);
      // Force navigation to ensure redirection happens
      window.location.href = `/${user.role}`;
    }
  }, [isAuthenticated, user, isLoading, localLoading, navigate]);
  
  // Combined loading state
  if (isLoading || localLoading) {
    return (
      <Layout className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Checking authentication status...</p>
        </div>
      </Layout>
    );
  }
  
  // If already authenticated, redirect to the appropriate role page
  if (isAuthenticated && user) {
    console.log("User authenticated, redirecting to role page:", user.role);
    return <Navigate to={`/${user.role}`} replace />;
  }
  
  return (
    <Layout className="flex items-center justify-center min-h-screen">
      <ScrollArea className="max-h-screen w-full max-w-md">
        <LoginForm />
      </ScrollArea>
    </Layout>
  );
}
