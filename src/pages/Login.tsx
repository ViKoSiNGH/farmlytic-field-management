
import React, { useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/use-auth';
import { Navigate, useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Login() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Handle redirection after authentication is confirmed
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      console.log("Login page: User is authenticated, redirecting to", `/${user.role}`);
      navigate(`/${user.role}`, { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate]);
  
  // Show loading state while authentication is being checked
  if (isLoading) {
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
