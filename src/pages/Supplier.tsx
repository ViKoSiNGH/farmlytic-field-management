
import React from 'react';
import { Layout } from '@/components/Layout';
import { RolePanels } from '@/components/RolePanels';

const Supplier = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Supplier Dashboard</h1>
        <RolePanels role="supplier" />
      </div>
    </Layout>
  );
};

export default Supplier;
