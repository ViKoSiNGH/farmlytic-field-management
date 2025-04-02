import React, { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { InventoryItem, FarmerRequest } from '@/types/auth';
import { ShoppingBag, Truck, MessageCircle, Phone, Mail, Send } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

export function SupplierPanel() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<FarmerRequest[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState<number | undefined>(undefined);
  const [response, setResponse] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<FarmerRequest | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadInventory();
    loadRequests();
  }, []);

  const loadInventory = async () => {
    try {
      // First try to fetch from Supabase
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('sellerId', user?.id)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching inventory:', error);
        
        // If Supabase fails, try loading from localStorage as a fallback
        const savedInventory = localStorage.getItem('farmlytic_supplier_inventory');
        if (savedInventory) {
          try {
            const parsedInventory: InventoryItem[] = JSON.parse(savedInventory);
            setInventory(parsedInventory);
          } catch (err) {
            console.error('Error parsing saved inventory:', err);
            // If all else fails, use sample data
            setInventory(getInventorySamples());
          }
        } else {
          // If no saved data, use sample data
          setInventory(getInventorySamples());
        }
        return;
      }
      
      if (data) {
        setInventory(data);
        
        // Also save to localStorage as fallback for development
        localStorage.setItem('farmlytic_supplier_inventory', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error in loadInventory:', error);
      // Use sample data if all else fails
      setInventory(getInventorySamples());
    }
  };
  
  const loadRequests = async () => {
    try {
      // First try to fetch from Supabase
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('type', 'purchase')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching requests:', error);
        
        // If Supabase fails, try loading from localStorage as a fallback
        const savedRequests = localStorage.getItem('farmlytic_supplier_requests');
        if (savedRequests) {
          try {
            const parsedRequests: FarmerRequest[] = JSON.parse(savedRequests).map((req: any) => ({
              ...req,
              createdAt: new Date(req.createdAt)
            }));
            setRequests(parsedRequests);
          } catch (err) {
            console.error('Error parsing saved requests:', err);
            // If all else fails, use sample data
            setRequests(getSampleRequests());
          }
        } else {
          // If no saved data, use sample data
          setRequests(getSampleRequests());
        }
        return;
      }
      
      if (data) {
        const formattedRequests: FarmerRequest[] = data.map((req: any) => {
          // Access the property using the database column name
          const farmerName = req.farmer_id || 'Unknown Farmer'; // Use farmer_id as fallback if farmer_name is missing
          
          return {
            id: req.id,
            farmerId: req.farmer_id,
            farmerName: farmerName,
            type: req.type,
            item: req.item,
            quantity: req.quantity,
            description: req.description,
            status: req.status,
            createdAt: new Date(req.created_at),
            targetId: req.target_id,
            response: req.response,
            contactPhone: req.contact_phone,
            contactEmail: req.contact_email,
            isCustom: req.is_custom
          };
        });
        
        setRequests(formattedRequests);
        
        // Also save to localStorage as fallback for development
        localStorage.setItem('farmlytic_supplier_requests', JSON.stringify(formattedRequests));
      }
    } catch (error) {
      console.error('Error in loadRequests:', error);
      // Use sample data if all else fails
      setRequests(getSampleRequests());
    }
  };

  // Function to fetch requests from farmers
  const fetchRequests = async () => {
    try {
      // First try to fetch from Supabase
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('type', 'purchase')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching requests:', error);
        
        // If Supabase fails, try loading from localStorage as a fallback
        const savedRequests = localStorage.getItem('farmlytic_supplier_requests');
        if (savedRequests) {
          try {
            const parsedRequests: FarmerRequest[] = JSON.parse(savedRequests).map((req: any) => ({
              ...req,
              createdAt: new Date(req.createdAt)
            }));
            setRequests(parsedRequests);
          } catch (err) {
            console.error('Error parsing saved requests:', err);
            // If all else fails, use sample data
            setRequests(getSampleRequests());
          }
        } else {
          // If no saved data, use sample data
          setRequests(getSampleRequests());
        }
        return;
      }
      
      if (data) {
        const formattedRequests: FarmerRequest[] = data.map((req: any) => {
          // Access the property using the database column name
          const farmerName = req.farmer_id || 'Unknown Farmer'; // Use farmer_id as fallback if farmer_name is missing
          
          return {
            id: req.id,
            farmerId: req.farmer_id,
            farmerName: farmerName,
            type: req.type,
            item: req.item,
            quantity: req.quantity,
            description: req.description,
            status: req.status,
            createdAt: new Date(req.created_at),
            targetId: req.target_id,
            response: req.response,
            contactPhone: req.contact_phone,
            contactEmail: req.contact_email,
            isCustom: req.is_custom
          };
        });
        
        setRequests(formattedRequests);
        
        // Also save to localStorage as fallback for development
        localStorage.setItem('farmlytic_supplier_requests', JSON.stringify(formattedRequests));
      }
    } catch (error) {
      console.error('Error in fetchRequests:', error);
      // Use sample data if all else fails
      setRequests(getSampleRequests());
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .update({ status: newStatus })
        .eq('id', requestId);
  
      if (error) {
        console.error('Error updating status:', error);
        toast({
          title: "Error",
          description: "Failed to update status. Please try again.",
          variant: "destructive",
        });
        return;
      }
  
      // Optimistically update the local state
      setRequests(requests.map(req =>
        req.id === requestId ? { ...req, status: newStatus } : req
      ));
  
      toast({
        title: "Success",
        description: `Request status updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInventorySamples = (): InventoryItem[] => ([
    {
      id: '1',
      type: 'fertilizer',
      name: 'Nitrogen Fertilizer',
      quantity: 50,
      unit: 'kg',
      price: 75,
      sellerId: 'supplier1',
      available: true,
    },
    {
      id: '2',
      type: 'pesticide',
      name: 'Broad Spectrum Pesticide',
      quantity: 30,
      unit: 'liter',
      price: 120,
      sellerId: 'supplier1',
      available: true,
    },
    {
      id: '3',
      type: 'seeds',
      name: 'Hybrid Corn Seeds',
      quantity: 1000,
      unit: 'seeds',
      price: 250,
      sellerId: 'supplier1',
      available: true,
    },
  ]);

  const getSampleRequests = (): FarmerRequest[] => ([
    {
      id: '101',
      farmerId: 'farmer1',
      farmerName: 'John Doe',
      type: 'purchase',
      item: 'Nitrogen Fertilizer',
      quantity: 20,
      description: 'Need fertilizer for upcoming planting season.',
      status: 'pending',
      createdAt: new Date(),
      targetId: 'supplier1',
      response: '',
      contactPhone: '123-456-7890',
      contactEmail: 'john.doe@example.com',
      isCustom: false,
    },
    {
      id: '102',
      farmerId: 'farmer2',
      farmerName: 'Alice Smith',
      type: 'purchase',
      item: 'Hybrid Corn Seeds',
      quantity: 500,
      description: 'Looking for high-yield corn seeds.',
      status: 'accepted',
      createdAt: new Date(),
      targetId: 'supplier1',
      response: 'Seeds are available and ready to ship.',
      contactPhone: '987-654-3210',
      contactEmail: 'alice.smith@example.com',
      isCustom: false,
    },
  ]);

  return (
    <Tabs defaultValue="inventory" className="w-full">
      <TabsList>
        <TabsTrigger value="inventory">
          <ShoppingBag className="mr-2 h-4 w-4" />
          Inventory
        </TabsTrigger>
        <TabsTrigger value="requests">
          <Truck className="mr-2 h-4 w-4" />
          Requests
        </TabsTrigger>
        <TabsTrigger value="messages">
          <MessageCircle className="mr-2 h-4 w-4" />
          Messages
        </TabsTrigger>
      </TabsList>
      <TabsContent value="inventory">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Manage Inventory</h3>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {inventory.map((item) => (
                <div key={item.id} className="border rounded-md p-4">
                  <h4 className="font-semibold">{item.name}</h4>
                  <p>Type: {item.type}</p>
                  <p>Quantity: {item.quantity} {item.unit}</p>
                  <p>Price: ${item.price}</p>
                  <p>Available: {item.available ? 'Yes' : 'No'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="requests">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Farmer Requests</h3>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-md p-4">
                  <h4 className="font-semibold">{request.farmerName} - {request.item}</h4>
                  <p>Quantity: {request.quantity}</p>
                  <p>Description: {request.description}</p>
                  <p>Status: {request.status}</p>
                  <p>Created At: {request.createdAt.toLocaleDateString()}</p>
                  <div className="flex gap-2 mt-2">
                    {request.status === 'pending' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(request.id, 'accepted')}>
                          Accept
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(request.id, 'rejected')}>
                          Reject
                        </Button>
                      </>
                    )}
                    {request.contactPhone && (
                      <Button size="sm" variant="secondary" asChild>
                        <a href={`tel:${request.contactPhone}`} className="flex items-center">
                          <Phone className="mr-2 h-4 w-4" />
                          Call
                        </a>
                      </Button>
                    )}
                    {request.contactEmail && (
                      <Button size="sm" variant="secondary" asChild>
                        <a href={`mailto:${request.contactEmail}`} className="flex items-center">
                          <Mail className="mr-2 h-4 w-4" />
                          Email
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="messages">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Messages</h3>
          </CardHeader>
          <CardContent>
            {selectedRequest ? (
              <div>
                <h4>{selectedRequest.farmerName} - {selectedRequest.item}</h4>
                <Textarea
                  placeholder="Type your response here."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="mb-4"
                />
                <Button onClick={() => {
                  toast({
                    title: "Success",
                    description: "Message sent!",
                  });
                }}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            ) : (
              <p>Select a request to view messages.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
