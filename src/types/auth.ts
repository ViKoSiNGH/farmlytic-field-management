
export type UserRole = 'farmer' | 'supplier' | 'specialist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface FarmerRequest {
  id: string;
  farmerId: string;
  farmerName: string;
  type: 'advice' | 'purchase';
  item?: string;
  quantity?: number;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  targetId?: string; // ID of the specialist or supplier
  response?: string;
}

export interface Field {
  id: string;
  userId: string;
  name: string;
  location: string;
  size: number;
  unit: 'acres' | 'hectares';
  crops: string[];
  createdAt: Date;
  soilType?: string;
  image?: string;
}

export interface Crop {
  id: string;
  userId: string;
  name: string;
  plantedDate: Date;
  expectedHarvestDate: Date;
  field: string;
  status: 'growing' | 'harvested' | 'failed';
  notes?: string;
}

export interface InventoryItem {
  id: string;
  type: 'seed' | 'fertilizer' | 'pesticide' | 'crop' | 'waste';
  name: string;
  quantity: number;
  unit: string;
  price: number;
  sellerId?: string;
  available: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  linkTo?: string;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  fieldId?: string;
  cropId?: string;
}
