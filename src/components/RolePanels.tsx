
import React from 'react';
import { SupplierPanel } from '@/components/SupplierPanel';
import { SpecialistPanel } from '@/components/SpecialistPanel';
import { FarmerPanel } from '@/components/FarmerPanel';

interface RolePanelsProps {
  role: 'farmer' | 'supplier' | 'specialist';
}

export function RolePanels({ role }: RolePanelsProps) {
  return (
    <div className="w-full">
      {role === 'farmer' && <FarmerPanel />}
      {role === 'supplier' && <SupplierPanel />}
      {role === 'specialist' && <SpecialistPanel />}
    </div>
  );
}
