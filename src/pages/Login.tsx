
import React from 'react';
import { Layout } from '@/components/Layout';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/use-auth';
import { Navigate } from 'react-router-dom';

export default function Login() {
  const { isAuthenticated, user } = useAuth();
  
  // If already authenticated, redirect to the appropriate role page
  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  
  return (
    <Layout className="flex items-center justify-center min-h-screen">
      <LoginForm />
    </Layout>
  );
}
