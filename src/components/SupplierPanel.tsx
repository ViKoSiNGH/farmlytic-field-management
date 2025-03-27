
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FarmerRequest, InventoryItem } from '@/types/auth';
import { ShoppingBag, MessageCircle, Phone, Mail, PackageCheck, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

export function SupplierPanel() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');
  const [requests, setRequests] = useState<FarmerRequest[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [newItem, setNewItem] = useState<{
    name: string;
    type: string;
    quantity: number;
    unit: string;
    price: number;
  }>({
    name: '',
    type: 'fertilizer',
    quantity: 1,
    unit: 'kg',
    price: 0
  });
  const [responseText, setResponseText] = useState<{[key: string]: string}>({});
  const [chatMessages, setChatMessages] = useState<{
    requestId: string;
    messages: {
      sender: string;
      text: string;
      timestamp: Date;
    }[];
  }[]>([]);
  
  useEffect(() => {
    fetchRequests();
    fetchInventory();
    
    const savedMessages = localStorage.getItem('farmlytic_chat_messages');
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
    
    // Set up subscription for real-time updates on requests
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
      
    return () => {
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(inventoryChannel);
    };
  }, [user?.id]);
  
  const fetchRequests = async () => {
    try {
      let query = supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (user?.id) {
        // For supplier, show requests that are either targeted at them or are purchase requests
        query = query.or(`target_id.eq.${user.id},type.eq.purchase`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching requests:', error);
        return;
      }
      
      if (data) {
        const formattedRequests: FarmerRequest[] = data.map(req => ({
          ...req,
          createdAt: new Date(req.created_at)
        }));
        setRequests(formattedRequests);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };
  
  const fetchInventory = async () => {
    try {
      let query = supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (user?.id) {
        // For supplier, show their inventory items
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching inventory:', error);
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
    }
  };
  
  const addInventoryItem = async () => {
    if (!newItem.name || !newItem.unit || newItem.price <= 0) {
      toast({
        title: "Missing Information",
        description: "Please provide a name, unit, and valid price for your item.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('inventory')
        .insert({
          user_id: user?.id,
          name: newItem.name,
          type: newItem.type,
          quantity: newItem.quantity,
          unit: newItem.unit,
          price: newItem.price,
          available: true
        });
        
      if (error) {
        console.error('Error adding inventory item:', error);
        toast({
          title: "Error",
          description: "Failed to add inventory item. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Inventory item added successfully."
      });
      
      setNewItem({
        name: '',
        type: 'fertilizer',
        quantity: 1,
        unit: 'kg',
        price: 0
      });
      
      await fetchInventory();
    } catch (error) {
      console.error('Failed to add inventory item:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleRespondToRequest = async (requestId: string, newStatus: 'accepted' | 'rejected') => {
    const response = responseText[requestId];
    
    if (!response) {
      toast({
        title: "Missing Response",
        description: "Please provide a response message.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('requests')
        .update({
          status: newStatus,
          response: response
        })
        .eq('id', requestId);
        
      if (error) {
        console.error('Error updating request:', error);
        toast({
          title: "Error",
          description: "Failed to update request. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      addChatMessage(requestId, 'supplier', response);
      
      toast({
        title: newStatus === 'accepted' ? "Request Accepted" : "Request Rejected",
        description: "Your response has been sent to the farmer."
      });
      
      // Clear response text
      setResponseText(prev => ({
        ...prev,
        [requestId]: ''
      }));
      
      await fetchRequests();
    } catch (error) {
      console.error('Failed to update request:', error);
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
    localStorage.setItem('farmlytic_chat_messages', JSON.stringify(updatedChats));
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
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="inventory">
          <PackageCheck className="h-4 w-4 mr-2" />
          Manage Inventory
        </TabsTrigger>
        <TabsTrigger value="orders">
          <ShoppingBag className="h-4 w-4 mr-2" />
          Purchase Requests
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="inventory" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Add New Inventory Item</CardTitle>
            <CardDescription>List new products for farmers to purchase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Name</label>
              <Input 
                placeholder="Enter product name" 
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Type</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  value={newItem.type}
                  onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                >
                  <option value="fertilizer">Fertilizer</option>
                  <option value="seed">Seeds</option>
                  <option value="pesticide">Pesticide</option>
                  <option value="equipment">Equipment</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="l">Liter (l)</option>
                  <option value="ml">Milliliter (ml)</option>
                  <option value="unit">Unit/Piece</option>
                  <option value="ton">Ton</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input 
                  type="number" 
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Price ($ per {newItem.unit})</label>
                <Input 
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={addInventoryItem} className="w-full">
              <PackageCheck className="h-4 w-4 mr-2" />
              Add to Inventory
            </Button>
          </CardFooter>
        </Card>
        
        <h3 className="text-lg font-medium mt-6">Your Inventory Items</h3>
        {inventory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inventory.map(item => (
              <Card key={item.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription>{item.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm">
                      Price: <span className="font-medium">${item.price.toFixed(2)}/{item.unit}</span>
                    </p>
                    <Badge variant={item.available ? "default" : "outline"}>
                      {item.available ? 'Available' : 'Out of Stock'}
                    </Badge>
                  </div>
                  <p className="text-sm">Quantity: {item.quantity} {item.unit}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground">
              No inventory items found. Add your first product above.
            </CardContent>
          </Card>
        )}
      </TabsContent>
      
      <TabsContent value="orders" className="space-y-4">
        <h3 className="text-lg font-medium">Purchase Requests</h3>
        
        {requests.filter(req => req.type === 'purchase').length > 0 ? (
          <div className="space-y-4">
            {requests
              .filter(req => req.type === 'purchase')
              .map(req => (
                <Card key={req.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{req.item} {req.isCustom && <Badge variant="outline">Custom</Badge>}</CardTitle>
                      <Badge
                        variant={
                          req.status === 'accepted' ? 'default' :
                          req.status === 'rejected' ? 'destructive' : 'outline'
                        }
                      >
                        {req.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      From: {req.farmerName} • Requested: {req.createdAt.toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">Quantity: {req.quantity}</p>
                    <p className="text-sm mb-4">{req.description}</p>
                    
                    {req.contactPhone && req.contactEmail && (
                      <div className="flex flex-col space-y-1 mt-4 mb-4 p-3 bg-muted rounded-md">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <p className="text-sm">{req.contactPhone}</p>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <p className="text-sm">{req.contactEmail}</p>
                        </div>
                      </div>
                    )}
                    
                    {req.status === 'pending' && (
                      <div className="mt-4 p-3 bg-muted rounded-md space-y-3">
                        <h4 className="text-sm font-medium">Your Response</h4>
                        <Textarea 
                          placeholder="Enter your response to this request..."
                          value={responseText[req.id] || ''}
                          onChange={(e) => setResponseText({...responseText, [req.id]: e.target.value})}
                        />
                        <div className="flex space-x-2">
                          <Button 
                            variant="default" 
                            className="flex-1"
                            onClick={() => handleRespondToRequest(req.id, 'accepted')}
                          >
                            Accept
                          </Button>
                          <Button 
                            variant="destructive" 
                            className="flex-1"
                            onClick={() => handleRespondToRequest(req.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {req.status !== 'pending' && (
                      <div className="mt-4 border rounded-md">
                        <div className="bg-muted p-2 rounded-t-md border-b">
                          <h4 className="text-sm font-medium flex items-center">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Messages
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
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground">
              No purchase requests found. Check back later!
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
