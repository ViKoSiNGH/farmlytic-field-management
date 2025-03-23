
import React from 'react';
import { Layout } from '@/components/Layout';
import { LoginForm } from '@/components/auth/LoginForm';

export default function Login() {
  return (
    <Layout className="flex items-center justify-center min-h-screen">
      <LoginForm />
    </Layout>
  );
}
