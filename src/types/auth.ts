
export type UserRole = 'farmer' | 'supplier' | 'specialist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export interface FarmerRequest {
  id: string;
  farmerId: string;
  farmerName: string;
  type: 'purchase' | 'advice';
  item?: string;
  quantity?: number;
  description: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: Date;
  targetId?: string;
  response?: string;
  contactPhone?: string;
  contactEmail?: string;
  isCustom?: boolean;
}

export interface SupplierRequest {
  id: string;
  farmerId: string;
  farmerName: string;
  type: 'purchase' | 'advice';
  item?: string;
  quantity?: number;
  description: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: Date;
  targetId?: string;
  response?: string;
  contactPhone?: string;
  contactEmail?: string;
  isCustom?: boolean;
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
  type: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  sellerId: string;
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

export interface ChatMessage {
  requestId: string;
  messages: {
    sender: string;
    text: string;
    timestamp: Date;
  }[];
}

export interface SellerProduct {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  quantity: number;
  price: number;
  description: string;
}
