
import React from 'react';
import { Layout } from '@/components/Layout';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/hooks/use-auth';
import { Navigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Register() {
  const { isAuthenticated, user } = useAuth();
  
  // If already authenticated, redirect to the appropriate role page
  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  
  return (
    <Layout className="flex items-center justify-center min-h-screen py-6 px-4">
      <div className="w-full max-w-md">
        <ScrollArea className="h-[calc(100vh-120px)] w-full pr-4">
          <div className="py-4">
            <RegisterForm />
          </div>
        </ScrollArea>
      </div>
    </Layout>
  );
}
