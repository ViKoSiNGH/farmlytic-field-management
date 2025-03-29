
import React from 'react';
import { Layout } from '@/components/Layout';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/hooks/use-auth';
import { Navigate } from 'react-router-dom';

export default function Register() {
  const { isAuthenticated, user } = useAuth();
  
  // If already authenticated, redirect to the appropriate role page
  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  
  return (
    <Layout className="flex items-center justify-center min-h-screen">
      <RegisterForm />
    </Layout>
  );
}
