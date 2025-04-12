
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { InventoryItem, FarmerRequest } from '@/types/auth';
import { ShoppingBag, Truck, MessageCircle, Phone, Mail, Send, Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from 'react-hook-form';

export function SupplierPanel() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<FarmerRequest[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState<number | undefined>(undefined);
  const [response, setResponse] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<FarmerRequest | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const initialInventoryFormValues = {
    type: '',
    name: '',
    quantity: undefined as number | undefined,
    unit: '',
    price: undefined as number | undefined,
    available: true
  };
  
  const [newItem, setNewItem] = useState(initialInventoryFormValues);

  useEffect(() => {
    loadInventory();
    loadRequests();
  }, [user?.id]);

  const loadInventory = async () => {
    try {
      if (!user?.id) {
        console.error('User not authenticated or missing ID');
        setInventory(getInventorySamples());
        return;
      }
      
      console.log('Fetching inventory for user:', user.id);
      
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching inventory:', error);
        
        const savedInventory = localStorage.getItem('farmlytic_supplier_inventory');
        if (savedInventory) {
          try {
            const parsedInventory: InventoryItem[] = JSON.parse(savedInventory);
            setInventory(parsedInventory);
          } catch (err) {
            console.error('Error parsing saved inventory:', err);
            setInventory(getInventorySamples());
          }
        } else {
          setInventory(getInventorySamples());
        }
        return;
      }
      
      const mappedInventory: InventoryItem[] = data.map(item => ({
        id: item.id,
        type: item.type,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price || 0,
        sellerId: item.user_id,
        available: item.available
      }));
      
      setInventory(mappedInventory);
      localStorage.setItem('farmlytic_supplier_inventory', JSON.stringify(mappedInventory));
    } catch (error) {
      console.error('Error in loadInventory:', error);
      setInventory(getInventorySamples());
    }
  };
  
  const loadRequests = async () => {
    try {
      if (!user?.id) {
        console.error('User not authenticated or missing ID');
        setRequests(getSampleRequests());
        return;
      }
      
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          profiles:farmer_id(name, email, phone)
        `)
        .eq('type', 'purchase')
        .or(`target_id.eq.${user.id},target_id.is.null`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching requests:', error);
        
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
            setRequests(getSampleRequests());
          }
        } else {
          setRequests(getSampleRequests());
        }
        return;
      }
      
      if (data) {
        console.log('Fetched requests:', data.length);
        
        const formattedRequests: FarmerRequest[] = data.map((req: any) => {
          const farmerProfile = req.profiles || {};
          const farmerName = farmerProfile.name || req.farmer_id || 'Unknown Farmer';
          const status = validateStatus(req.status);
          return {
            id: req.id,
            farmerId: req.farmer_id,
            farmerName: farmerName,
            type: req.type as 'purchase' | 'advice',
            item: req.item,
            quantity: req.quantity,
            description: req.description,
            status: status,
            createdAt: new Date(req.created_at),
            targetId: req.target_id,
            response: req.response,
            contactPhone: req.contact_phone || farmerProfile.phone,
            contactEmail: req.contact_email || farmerProfile.email,
            isCustom: req.is_custom
          };
        });
        
        setRequests(formattedRequests);
        localStorage.setItem('farmlytic_supplier_requests', JSON.stringify(formattedRequests));
      }
    } catch (error) {
      console.error('Error in loadRequests:', error);
      setRequests(getSampleRequests());
    }
  };

  const validateStatus = (status: string): 'pending' | 'accepted' | 'rejected' | 'completed' => {
    const validStatuses: ('pending' | 'accepted' | 'rejected' | 'completed')[] = ['pending', 'accepted', 'rejected', 'completed'];
    return validStatuses.includes(status as any) 
      ? (status as 'pending' | 'accepted' | 'rejected' | 'completed') 
      : 'pending';
  };

  const fetchRequests = async () => {
    await loadRequests();
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      const request = requests.find(req => req.id === requestId);
      
      let responseMessage = '';
      if (newStatus === 'accepted' && user) {
        responseMessage = `Your request has been accepted. Please contact us at ${user.phone || 'N/A'} or ${user.email || 'N/A'} for further details.`;
      } else if (newStatus === 'rejected') {
        responseMessage = 'Unfortunately, we cannot fulfill this request at this time.';
      }
      
      const { data, error } = await supabase
        .from('requests')
        .update({ 
          status: newStatus,
          response: responseMessage
        })
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
  
      setRequests(requests.map(req =>
        req.id === requestId ? { 
          ...req, 
          status: validateStatus(newStatus),
          response: responseMessage
        } : req
      ));
  
      toast({
        title: "Success",
        description: `Request status updated to ${newStatus}.`,
      });
      
      loadRequests();
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

  const handleAddInventory = async () => {
    if (!newItem.name || !newItem.type || !newItem.unit) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user || !user.id) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to add inventory items.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession();
      if (authError || !authData.session) {
        console.error('Authentication error:', authError || 'No active session');
        toast({
          title: "Authentication Error",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        return;
      }
      
      const itemToAdd = {
        type: newItem.type,
        name: newItem.name,
        quantity: newItem.quantity || 0,
        unit: newItem.unit,
        price: newItem.price || 0,
        available: newItem.available,
        user_id: user.id
      };
      
      console.log("Adding inventory item with user_id:", user.id);
      
      const { data, error } = await supabase
        .from('inventory')
        .insert(itemToAdd)
        .select();
        
      if (error) {
        console.error('Error adding inventory item:', error);
        
        if (error.code === '42501') {
          toast({
            title: "Permission Denied",
            description: "You don't have permission to add items. Please check your account permissions.",
            variant: "destructive",
          });
        } else if (error.code === '23505') {
          toast({
            title: "Duplicate Item",
            description: "An item with this name already exists.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to add inventory item. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }
      
      toast({
        title: "Success",
        description: "Inventory item added successfully!",
      });
      
      setNewItem(initialInventoryFormValues);
      setIsAddingItem(false);
      loadInventory();
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to add inventory item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateInventory = async (itemId: string) => {
    try {
      const itemToUpdate = inventory.find(item => item.id === itemId);
      if (!itemToUpdate) return;
      
      if (!user || !user.id) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to update inventory items.",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('inventory')
        .update({
          type: itemToUpdate.type,
          name: itemToUpdate.name,
          quantity: itemToUpdate.quantity,
          unit: itemToUpdate.unit,
          price: itemToUpdate.price,
          available: itemToUpdate.available,
          user_id: user.id
        })
        .eq('id', itemId);
        
      if (error) {
        console.error('Error details:', error);
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Inventory item updated successfully!",
      });
      
      setEditingItemId(null);
      loadInventory();
    } catch (error) {
      console.error('Error updating inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInventory = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', itemId);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Inventory item deleted successfully!",
      });
      
      setInventory(inventory.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to delete inventory item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startEditItem = (item: InventoryItem) => {
    setEditingItemId(item.id);
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    loadInventory();
  };

  const updateItemField = (itemId: string, field: string, value: any) => {
    setInventory(inventory.map(item => 
      item.id === itemId 
        ? { ...item, [field]: value } 
        : item
    ));
  };

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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Manage Inventory</CardTitle>
              <CardDescription>Add, edit and manage your agricultural products</CardDescription>
            </div>
            {!isAddingItem && (
              <Button onClick={() => setIsAddingItem(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isAddingItem && (
              <Card className="mb-6 border-dashed">
                <CardHeader>
                  <CardTitle className="text-lg">Add New Item</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Type</label>
                      <Select 
                        value={newItem.type} 
                        onValueChange={(value) => setNewItem({...newItem, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fertilizer">Fertilizer</SelectItem>
                          <SelectItem value="seeds">Seeds</SelectItem>
                          <SelectItem value="pesticide">Pesticide</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input 
                        placeholder="Product name" 
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quantity</label>
                      <Input 
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Quantity" 
                        value={newItem.quantity === undefined ? '' : newItem.quantity}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numericValue = value ? parseInt(value) : undefined;
                          setNewItem({...newItem, quantity: numericValue});
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Unit</label>
                      <Select 
                        value={newItem.unit} 
                        onValueChange={(value) => setNewItem({...newItem, unit: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Kilogram</SelectItem>
                          <SelectItem value="g">Gram</SelectItem>
                          <SelectItem value="liter">Liter</SelectItem>
                          <SelectItem value="ml">Milliliter</SelectItem>
                          <SelectItem value="unit">Unit</SelectItem>
                          <SelectItem value="packet">Packet</SelectItem>
                          <SelectItem value="box">Box</SelectItem>
                          <SelectItem value="piece">Piece</SelectItem>
                          <SelectItem value="set">Set</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price (₹)</label>
                      <Input 
                        type="number"
                        inputMode="decimal"
                        pattern="[0-9]*\.?[0-9]*"
                        placeholder="Price" 
                        value={newItem.price === undefined ? '' : newItem.price}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numericValue = value ? parseFloat(value) : undefined;
                          setNewItem({...newItem, price: numericValue});
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2 flex items-center">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                          checked={newItem.available}
                          onChange={(e) => setNewItem({...newItem, available: e.target.checked})}
                        />
                        <span className="text-sm font-medium">Available for purchase</span>
                      </label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => {
                    setIsAddingItem(false);
                    setNewItem(initialInventoryFormValues);
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddInventory}>
                    Add to Inventory
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        No inventory items yet. Add your first item to get started.
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {inventory.map((item) => (
                    <TableRow key={item.id}>
                      {editingItemId === item.id ? (
                        <>
                          <TableCell>
                            <Input 
                              value={item.name}
                              onChange={(e) => updateItemField(item.id, 'name', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={item.type} 
                              onValueChange={(value) => updateItemField(item.id, 'type', value)}
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fertilizer">Fertilizer</SelectItem>
                                <SelectItem value="seeds">Seeds</SelectItem>
                                <SelectItem value="pesticide">Pesticide</SelectItem>
                                <SelectItem value="equipment">Equipment</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Input 
                                type="number"
                                className="w-20"
                                value={item.quantity}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  updateItemField(item.id, 'quantity', value ? parseInt(value) : 0);
                                }}
                              />
                              <Select 
                                value={item.unit} 
                                onValueChange={(value) => updateItemField(item.id, 'unit', value)}
                              >
                                <SelectTrigger className="w-[80px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="kg">kg</SelectItem>
                                  <SelectItem value="g">g</SelectItem>
                                  <SelectItem value="liter">L</SelectItem>
                                  <SelectItem value="ml">ml</SelectItem>
                                  <SelectItem value="unit">unit</SelectItem>
                                  <SelectItem value="packet">pkt</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="mr-1">₹</span>
                              <Input 
                                type="number"
                                className="w-20"
                                value={item.price}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  updateItemField(item.id, 'price', value ? parseFloat(value) : 0);
                                }}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={item.available ? "available" : "unavailable"} 
                              onValueChange={(value) => updateItemField(item.id, 'available', value === "available")}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="unavailable">Unavailable</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button variant="ghost" size="icon" onClick={() => handleUpdateInventory(item.id)}>
                                <Save size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={cancelEdit}>
                                <X size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="capitalize">{item.type}</TableCell>
                          <TableCell>{item.quantity} {item.unit}</TableCell>
                          <TableCell>₹{item.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.available 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }`}>
                              {item.available ? 'Available' : 'Unavailable'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button variant="ghost" size="icon" onClick={() => startEditItem(item)}>
                                <Edit size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteInventory(item.id)}>
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="requests">
        <Card>
          <CardHeader>
            <CardTitle>Farmer Requests</CardTitle>
            <CardDescription>View and respond to purchase requests from farmers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No purchase requests available. Requests will appear here when farmers submit them.
                </p>
              )}
              
              {requests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader className="bg-muted pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {request.item || 'Custom Request'}
                          {request.isCustom && <Badge variant="outline">Custom</Badge>}
                        </CardTitle>
                        <CardDescription>
                          From: {request.farmerName} • Requested: {request.createdAt.toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          request.status === 'accepted' ? 'default' :
                          request.status === 'rejected' ? 'destructive' : 
                          request.status === 'completed' ? 'secondary' : 'outline'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium">Request Details:</h4>
                        <p className="text-sm">{request.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <h4 className="text-sm font-medium">Quantity:</h4>
                          <p className="text-sm">{request.quantity}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium">Status:</h4>
                          <p className="text-sm capitalize">{request.status}</p>
                        </div>
                      </div>
                      
                      <div className="border-t pt-3">
                        <h4 className="text-sm font-medium mb-2">Farmer Contact Details:</h4>
                        <div className="flex space-x-4">
                          {request.contactPhone && (
                            <Button size="sm" variant="secondary" asChild>
                              <a href={`tel:${request.contactPhone}`} className="flex items-center">
                                <Phone className="mr-2 h-4 w-4" />
                                {request.contactPhone}
                              </a>
                            </Button>
                          )}
                          {request.contactEmail && (
                            <Button size="sm" variant="secondary" asChild>
                              <a href={`mailto:${request.contactEmail}`} className="flex items-center">
                                <Mail className="mr-2 h-4 w-4" />
                                {request.contactEmail}
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {request.status === 'pending' && (
                        <div className="flex gap-2 mt-2 border-t pt-3">
                          <Button onClick={() => handleUpdateStatus(request.id, 'accepted')}>
                            Accept Request
                          </Button>
                          <Button variant="destructive" onClick={() => handleUpdateStatus(request.id, 'rejected')}>
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
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
