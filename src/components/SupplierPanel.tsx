import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { InventoryItem, SupplierRequest } from '@/types/auth';
import { ShoppingBag, Truck, MessageCircle, Phone, Mail, Send } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

export function SupplierPanel() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<SupplierRequest[]>([]);
  const [newItem, setNewItem] = useState({
    name: '',
    type: 'fertilizer',
    quantity: 1,
    unit: 'kg',
    price: null as number | null
  });
  const [chatMessages, setChatMessages] = useState<{
    requestId: string;
    messages: {
      sender: string;
      text: string;
      timestamp: Date;
    }[];
  }[]>([]);
  
  useEffect(() => {
    fetchInventory();
    fetchRequests();
    
    const savedMessages = localStorage.getItem('farmlytic_supplier_chat_messages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map((chat: any) => ({
          ...chat,
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChatMessages(parsedMessages);
      } catch (error) {
        console.error('Failed to parse chat messages:', error);
        setChatMessages([]);
      }
    }
    
    const inventoryChannel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory'
        },
        () => {
          fetchInventory();
        }
      )
      .subscribe();
      
    const requestsChannel = supabase
      .channel('requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests'
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(inventoryChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, [user?.id]);
  
  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching inventory:', error);
        const savedInventory = localStorage.getItem('farmlytic_inventory');
        if (savedInventory) {
          try {
            setInventory(JSON.parse(savedInventory));
          } catch (e) {
            console.error('Failed to parse inventory:', e);
            setInventory(getSampleInventoryItems());
          }
        } else {
          setInventory(getSampleInventoryItems());
        }
        return;
      }
      
      if (data) {
        const formattedItems: InventoryItem[] = data.map(item => ({
          id: item.id,
          type: item.type,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price || 0,
          sellerId: item.user_id,
          available: item.available
        }));
        setInventory(formattedItems);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      setInventory(getSampleInventoryItems());
    }
  };
  
  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('target_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching requests:', error);
        const savedRequests = localStorage.getItem('farmlytic_supplier_requests');
        if (savedRequests) {
          try {
            const parsedRequests: SupplierRequest[] = JSON.parse(savedRequests).map((req: any) => ({
              ...req,
              createdAt: new Date(req.createdAt)
            }));
            setRequests(parsedRequests);
          } catch (e) {
            console.error('Failed to parse requests:', e);
            setRequests(getSampleRequests());
          }
        } else {
          setRequests(getSampleRequests());
        }
        return;
      }
      
      if (data) {
        const formattedRequests: SupplierRequest[] = data.map(req => {
          const farmerName = req.farmer_name || 'Unknown Farmer';
          
          return {
            id: req.id,
            farmerId: req.farmer_id,
            farmerName: farmerName,
            type: req.type as 'purchase' | 'advice',
            item: req.item,
            quantity: req.quantity,
            description: req.description,
            status: req.status as 'pending' | 'accepted' | 'rejected' | 'completed',
            createdAt: new Date(req.created_at),
            targetId: req.target_id,
            response: req.response,
            contactPhone: req.contact_phone,
            contactEmail: req.contact_email,
            isCustom: req.is_custom
          };
        });
        setRequests(formattedRequests);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };
  
  const getSampleInventoryItems = (): InventoryItem[] => {
    return [
      {
        id: 'item1',
        type: 'fertilizer',
        name: 'Organic Compost',
        quantity: 100,
        unit: 'kg',
        price: 15,
        sellerId: user?.id || 'supplier1',
        available: true
      },
      {
        id: 'item2',
        type: 'seed',
        name: 'Heirloom Tomato Seeds',
        quantity: 500,
        unit: 'g',
        price: 9.99,
        sellerId: user?.id || 'supplier1',
        available: true
      },
      {
        id: 'item3',
        type: 'pesticide',
        name: 'Neem Oil Spray',
        quantity: 20,
        unit: 'l',
        price: 25.50,
        sellerId: user?.id || 'supplier1',
        available: true
      }
    ];
  };
  
  const getSampleRequests = (): SupplierRequest[] => {
    return [
      {
        id: 'req1',
        farmerId: 'farmer1',
        farmerName: 'John Farmer',
        type: 'purchase',
        item: 'Organic Fertilizer',
        quantity: 50,
        description: 'Need organic fertilizer for my North Field.',
        status: 'pending',
        createdAt: new Date('2023-06-10'),
        targetId: user?.id || 'supplier1',
        contactPhone: '555-123-4567',
        contactEmail: 'john@example.com',
      },
      {
        id: 'req2',
        farmerId: 'farmer2',
        farmerName: 'Alice Green',
        type: 'advice',
        description: 'Having issues with pests in my corn field. What should I do?',
        status: 'accepted',
        createdAt: new Date('2023-06-05'),
        targetId: user?.id || 'supplier1',
        response: 'I recommend using organic pest control methods like neem oil spray.',
        contactPhone: '555-987-6543',
        contactEmail: 'alice@example.com',
      }
    ];
  };
  
  const handleAddToInventory = async () => {
    if (!newItem.name || !newItem.type || !newItem.quantity || !newItem.unit) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields for the inventory item.",
        variant: "destructive"
      });
      return;
    }
    
    if (newItem.quantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Quantity must be greater than zero.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      toast({
        title: "Processing",
        description: "Adding item to inventory...",
      });
      
      const { data, error } = await supabase
        .from('inventory')
        .insert({
          user_id: user?.id,
          name: newItem.name,
          type: newItem.type,
          quantity: newItem.quantity,
          unit: newItem.unit,
          price: newItem.price || 0,
          available: true
        })
        .select();
      
      if (error) {
        console.error('Error adding inventory item:', error);
        toast({
          title: "Error",
          description: `Failed to add inventory item: ${error.message}`,
          variant: "destructive"
        });
        
        const itemId = `item-${Date.now()}`;
        const newInventoryItem: InventoryItem = {
          id: itemId,
          type: newItem.type,
          name: newItem.name,
          quantity: newItem.quantity,
          unit: newItem.unit,
          price: newItem.price || 0,
          sellerId: user?.id,
          available: true
        };
        
        const updatedInventory = [...inventory, newInventoryItem];
        setInventory(updatedInventory);
        
        localStorage.setItem('farmlytic_inventory', JSON.stringify(updatedInventory));
        
        toast({
          title: "Added Locally",
          description: "Item added to local inventory. Will sync when connection is restored.",
        });
      } else {
        console.log('Inventory item added:', data);
        fetchInventory();
        toast({
          title: "Success",
          description: "Inventory item added successfully.",
        });
      }
      
      setNewItem({
        name: '',
        type: 'fertilizer',
        quantity: 1,
        unit: 'kg',
        price: null
      });
    } catch (error) {
      console.error('Failed to add inventory item:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);
      
      if (error) {
        console.error('Error accepting request:', error);
        toast({
          title: "Error",
          description: "Failed to accept the request. Please try again.",
          variant: "destructive"
        });
      } else {
        fetchRequests();
        toast({
          title: "Request Accepted",
          description: "You have accepted the request.",
        });
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
      
      if (error) {
        console.error('Error rejecting request:', error);
        toast({
          title: "Error",
          description: "Failed to reject the request. Please try again.",
          variant: "destructive"
        });
      } else {
        fetchRequests();
        toast({
          title: "Request Rejected",
          description: "You have rejected the request.",
        });
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleCompleteRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ status: 'completed' })
        .eq('id', requestId);
      
      if (error) {
        console.error('Error completing request:', error);
        toast({
          title: "Error",
          description: "Failed to complete the request. Please try again.",
          variant: "destructive"
        });
      } else {
        fetchRequests();
        toast({
          title: "Request Completed",
          description: "You have marked the request as completed.",
        });
      }
    } catch (error) {
      console.error('Failed to complete request:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const addChatMessage = (requestId: string, sender: string, text: string) => {
    const updatedChats = [...chatMessages];
    const existingChatIndex = updatedChats.findIndex(chat => chat.requestId === requestId);
    
    if (existingChatIndex >= 0) {
      updatedChats[existingChatIndex].messages.push({
        sender,
        text,
        timestamp: new Date()
      });
    } else {
      updatedChats.push({
        requestId,
        messages: [{
          sender,
          text,
          timestamp: new Date()
        }]
      });
    }
    
    setChatMessages(updatedChats);
    localStorage.setItem('farmlytic_supplier_chat_messages', JSON.stringify(updatedChats));
  };
  
  const getChatForRequest = (requestId: string) => {
    return chatMessages.find(chat => chat.requestId === requestId)?.messages || [];
  };
  
  const handleSendChatMessage = (requestId: string, message: string) => {
    if (!message.trim()) return;
    
    addChatMessage(requestId, 'supplier', message);
    
    const textareaElement = document.getElementById(`chat-${requestId}`) as HTMLTextAreaElement;
    if (textareaElement) {
      textareaElement.value = '';
    }
    
    toast({
      title: "Message Sent",
      description: "Your message has been sent successfully."
    });
  };
  
  return (
    <Tabs defaultValue="inventory" className="w-full" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="inventory">
          <ShoppingBag className="h-4 w-4 mr-2" />
          Manage Inventory
        </TabsTrigger>
        <TabsTrigger value="requests">
          <Truck className="h-4 w-4 mr-2" />
          View Requests
        </TabsTrigger>
        {/* <TabsTrigger value="analytics">
          <BarChart className="h-4 w-4 mr-2" />
          Analytics
        </TabsTrigger> */}
      </TabsList>
      
      <TabsContent value="inventory" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Add to Inventory</CardTitle>
            <CardDescription>Add new items to your inventory</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Item Name *</label>
                <Input
                  placeholder="Enter item name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Item Type *</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  value={newItem.type}
                  onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                  required
                >
                  <option value="fertilizer">Fertilizer</option>
                  <option value="seed">Seeds</option>
                  <option value="pesticide">Pesticide</option>
                  <option value="equipment">Equipment</option>
                  <option value="tool">Tools</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity *</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter quantity"
                  value={newItem.quantity}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setNewItem({...newItem, quantity: value ? parseInt(value) : 1});
                  }}
                  style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit *</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                  required
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="l">Liter (l)</option>
                  <option value="ml">Milliliter (ml)</option>
                  <option value="unit">Unit</option>
                  <option value="packet">Packet</option>
                  <option value="bag">Bag</option>
                  <option value="box">Box</option>
                  <option value="bottle">Bottle</option>
                  <option value="piece">Piece</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Price (INR)</label>
              <Input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                placeholder="Enter price in INR (optional)"
                value={newItem.price === null ? '' : newItem.price}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  setNewItem({...newItem, price: value ? parseFloat(value) : null});
                }}
                style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
              />
            </div>
            
            <Button 
              onClick={handleAddToInventory} 
              className="w-full"
              disabled={!newItem.name || !newItem.type || !newItem.quantity || !newItem.unit}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Add to Inventory
            </Button>
          </CardContent>
        </Card>
        
        <h3 className="text-lg font-medium mt-6">Current Inventory</h3>
        <div className="space-y-4">
          {inventory.map(item => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <Badge variant="outline">
                    {item.quantity} {item.unit}
                  </Badge>
                </div>
                <CardDescription>
                  Type: {item.type}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Price: ₹{item.price?.toFixed(2) || 'N/A'}</p>
              </CardContent>
            </Card>
          ))}
          
          {inventory.length === 0 && (
            <p className="text-center text-muted-foreground py-6">No inventory items yet. Add your first item above.</p>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="requests" className="space-y-4">
        <h3 className="text-lg font-medium">Incoming Requests</h3>
        <div className="space-y-4">
          {requests
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .map(req => (
              <Card key={req.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{req.item} {req.isCustom && <Badge variant="outline">Custom</Badge>}</CardTitle>
                    <Badge
                      variant={
                        req.status === 'accepted' ? 'default' :
                        req.status === 'rejected' ? 'destructive' : 
                        req.status === 'completed' ? 'secondary' : 'outline'
                      }
                    >
                      {req.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    From: {req.farmerName} - {req.createdAt.toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Quantity: {req.quantity}</p>
                  <p className="text-sm mt-2">{req.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm font-medium">Contact Phone</p>
                      <p className="text-sm">{req.contactPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Contact Email</p>
                      <p className="text-sm">{req.contactEmail}</p>
                    </div>
                  </div>
                  
                  {req.status === 'pending' && (
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => handleRejectRequest(req.id)}>
                        Reject
                      </Button>
                      <Button onClick={() => handleAcceptRequest(req.id)}>
                        Accept
                      </Button>
                    </div>
                  )}
                  
                  {req.status === 'accepted' && (
                    <div className="flex justify-end gap-2 mt-4">
                      <Button onClick={() => handleCompleteRequest(req.id)}>
                        Mark as Completed
                      </Button>
                    </div>
                  )}
                  
                  {req.status !== 'pending' && (
                    <div className="mt-4 border rounded-md">
                      <div className="bg-muted p-2 rounded-t-md border-b">
                        <h4 className="text-sm font-medium flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Chat with Farmer
                        </h4>
                      </div>
                      
                      <div className="p-3 max-h-40 overflow-y-auto space-y-2">
                        {getChatForRequest(req.id).length > 0 ? (
                          getChatForRequest(req.id).map((msg, i) => (
                            <div 
                              key={i} 
                              className={`p-2 rounded-lg max-w-[85%] ${
                                msg.sender === 'supplier' 
                                  ? 'ml-auto bg-primary/10 text-primary-foreground' 
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-xs font-medium">{msg.sender === 'supplier' ? 'You' : 'Farmer'}</p>
                              <p className="text-sm">{msg.text}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-center text-muted-foreground py-2">No messages yet</p>
                        )}
                      </div>
                      
                      <div className="p-2 border-t flex gap-2">
                        <Textarea 
                          id={`chat-${req.id}`}
                          placeholder="Type a message..."
                          className="min-h-[60px] text-sm"
                        />
                        <Button 
                          size="sm" 
                          className="self-end"
                          onClick={() => {
                            const textarea = document.getElementById(`chat-${req.id}`) as HTMLTextAreaElement;
                            handleSendChatMessage(req.id, textarea.value);
                          }}
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          
          {requests.length === 0 && (
            <p className="text-center text-muted-foreground py-6">No incoming requests at the moment.</p>
          )}
        </div>
      </TabsContent>
      
      {/* <TabsContent value="analytics">
        <div>
          Analytics content will go here.
        </div>
      </TabsContent> */}
    </Tabs>
  );
}
