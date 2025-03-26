
import React from 'react';
import { Layout } from '@/components/Layout';
import { RolePanels } from '@/components/RolePanels';

const Farmer = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Farmer Dashboard</h1>
        <RolePanels role="farmer" />
      </div>
    </Layout>
  );
};

export default Farmer;
