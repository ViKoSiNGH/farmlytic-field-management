
import { Field } from '@/types/auth';

// Define the type that FieldCard expects
export interface FieldCardProps {
  id: string;
  name: string;
  size: number;
  unit: string;
  crop: string;
  plantDate: string;
  status: string;
  moistureLevel: number;
  temperature: number;
  image: string;
}

// Convert Field type to FieldCardProps type
export function adaptFieldToCardProps(field: Field): FieldCardProps {
  return {
    id: field.id,
    name: field.name,
    size: field.size,
    unit: field.unit,
    crop: field.crops[0] || 'No crop',
    plantDate: field.createdAt.toLocaleDateString(),
    status: 'growing', // Default status
    moistureLevel: Math.floor(Math.random() * 100), // Mock data
    temperature: Math.floor(15 + Math.random() * 15), // Mock data between 15-30°C
    image: field.image || 'https://source.unsplash.com/random/800x600/?farm,field'
  };
}
