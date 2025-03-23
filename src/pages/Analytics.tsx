
import React from 'react';
import { Layout } from '@/components/Layout';
import { FieldMetrics } from '@/components/FieldMetrics';

// Sample data for demonstration
const sampleMetrics = {
  soilMoisture: [
    { name: 'Jan', value: 40 },
    { name: 'Feb', value: 45 },
    { name: 'Mar', value: 55 },
    { name: 'Apr', value: 60 },
    { name: 'May', value: 68 },
    { name: 'Jun', value: 62 },
    { name: 'Jul', value: 58 }
  ],
  temperature: [
    { name: 'Jan', value: 5 },
    { name: 'Feb', value: 7 },
    { name: 'Mar', value: 12 },
    { name: 'Apr', value: 18 },
    { name: 'May', value: 24 },
    { name: 'Jun', value: 28 },
    { name: 'Jul', value: 30 }
  ],
  productivity: [
    { name: 'Field 1', value: 85 },
    { name: 'Field 2', value: 78 },
    { name: 'Field 3', value: 62 },
    { name: 'Field 4', value: 73 }
  ]
};

export default function Analytics() {
  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Track and analyze your farm performance</p>
        </div>
        
        <FieldMetrics metrics={sampleMetrics} />
      </div>
    </Layout>
  );
}
