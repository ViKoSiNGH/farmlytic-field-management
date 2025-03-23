
import React from 'react';
import { Layout } from '@/components/Layout';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function Register() {
  return (
    <Layout className="flex items-center justify-center min-h-screen">
      <RegisterForm />
    </Layout>
  );
}
