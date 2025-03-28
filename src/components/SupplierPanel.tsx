
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FarmerRequest, InventoryItem, SellerProduct } from '@/types/auth';
import { Package, ShoppingBag, Check, X, MessageCircle, Plus, ShoppingCart, Trash2, Mail, Phone, Indian } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function SupplierPanel() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<FarmerRequest[]>([]);
  const [responseText, setResponseText] = useState<{[key: string]: string}>({});
  const [chatMessages, setChatMessages] = useState<{
    requestId: string;
    messages: {
      sender: string;
      text: string;
      timestamp: Date;
    }[];
  }[]>([]);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    type: 'Fertilizer',
    quantity: '',
    unit: 'kg',
    price: '',
  });
  
  // Analytics data for the supplier
  const [analyticsData, setAnalyticsData] = useState([
    { name: 'Jan', sales: 45000, expenses: 32000, profit: 13000 },
    { name: 'Feb', sales: 52000, expenses: 36000, profit: 16000 },
    { name: 'Mar', sales: 61000, expenses: 42000, profit: 19000 },
    { name: 'Apr', sales: 58000, expenses: 40000, profit: 18000 },
    { name: 'May', sales: 63000, expenses: 45000, profit: 18000 },
    { name: 'Jun', sales: 72000, expenses: 48000, profit: 24000 }
  ]);
  
  const [farmerProducts, setFarmerProducts] = useState<any[]>([]);
  
  useEffect(() => {
    fetchInventory();
    fetchRequests();
    fetchFarmerProducts();
    
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
    
    const requestsChannel = supabase
      .channel('supplier-changes')
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
      supabase.removeChannel(requestsChannel);
    };
  }, [user?.id]);
  
  const fetchInventory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error fetching inventory:', error);
        setInventory(getSampleInventory());
        return;
      }
      
      if (data && data.length > 0) {
        const items: InventoryItem[] = data.map(item => ({
          id: item.id.toString(),
          type: item.type,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price || 0,
          sellerId: item.user_id.toString(),
          available: item.available === null ? true : item.available
        }));
        setInventory(items);
      } else {
        setInventory(getSampleInventory());
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      setInventory(getSampleInventory());
    }
  };
  
  const fetchFarmerProducts = async () => {
    try {
      // Fetch products listed by farmers that suppliers can add to their inventory
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('type', 'sell')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching farmer products:', error);
        return;
      }
      
      if (data) {
        const formattedProducts = await Promise.all(
          data.map(async (prod) => {
            let farmerName = "Unknown Farmer";
            
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', prod.farmer_id)
                .single();
                
              if (!profileError && profileData) {
                farmerName = profileData.name;
              }
            } catch (e) {
              console.error('Error fetching farmer name:', e);
            }
            
            return {
              id: prod.id,
              farmerId: prod.farmer_id,
              farmerName: farmerName,
              item: prod.item,
              quantity: prod.quantity,
              description: prod.description,
              status: prod.status,
              createdAt: new Date(prod.created_at),
              contactPhone: prod.contact_phone,
              contactEmail: prod.contact_email
            };
          })
        );
        
        setFarmerProducts(formattedProducts);
      }
    } catch (error) {
      console.error('Failed to fetch farmer products:', error);
    }
  };
  
  const fetchRequests = async () => {
    if (!user) return;
    
    try {
      // Fetch all purchase requests, not just those targeting this supplier
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('type', 'purchase')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching requests:', error);
        return;
      }
      
      if (data) {
        const formattedRequests: FarmerRequest[] = await Promise.all(
          data.map(async (req) => {
            let farmerName = "Unknown Farmer";
            
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('name, phone, email')
                .eq('id', req.farmer_id)
                .single();
                
              if (!profileError && profileData) {
                farmerName = profileData.name;
                // If no contact info in request, use profile info
                if (!req.contact_phone && profileData.phone) {
                  req.contact_phone = profileData.phone;
                }
                if (!req.contact_email && profileData.email) {
                  req.contact_email = profileData.email;
                }
              }
            } catch (e) {
              console.error('Error fetching farmer details:', e);
            }
            
            return {
              id: req.id,
              farmerId: req.farmer_id,
              farmerName: farmerName,
              type: req.type as 'purchase' | 'advice',
              item: req.item || undefined,
              quantity: req.quantity || undefined,
              description: req.description,
              status: req.status as 'pending' | 'accepted' | 'rejected',
              createdAt: new Date(req.created_at),
              targetId: req.target_id || undefined,
              response: req.response || undefined,
              contactPhone: req.contact_phone || undefined,
              contactEmail: req.contact_email || undefined,
              isCustom: req.is_custom || false
            };
          })
        );
        
        setRequests(formattedRequests);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };
  
  const getSampleInventory = (): InventoryItem[] => {
    return [
      { id: "1", type: 'Fertilizer', name: 'DAP', quantity: 100, unit: 'kg', price: 1200, sellerId: "1", available: true },
      { id: "2", type: 'Seeds', name: 'Wheat', quantity: 50, unit: 'kg', price: 60, sellerId: "1", available: true }
    ];
  };
  
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.unit || !newProduct.price) {
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
          name: newProduct.name,
          type: newProduct.type,
          quantity: parseInt(newProduct.quantity) || 0,
          unit: newProduct.unit,
          price: parseFloat(newProduct.price) || 0,
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
      
      setNewProduct({
        name: '',
        type: 'Fertilizer',
        quantity: '',
        unit: 'kg',
        price: ''
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
  
  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', productId);
        
      if (error) {
        console.error('Error deleting inventory item:', error);
        toast({
          title: "Error",
          description: "Failed to delete inventory item. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Inventory item deleted successfully."
      });
      
      await fetchInventory();
    } catch (error) {
      console.error('Failed to delete inventory item:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', requestId);
        
      if (error) {
        console.error('Error deleting request:', error);
        toast({
          title: "Error",
          description: "Failed to delete request. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Request deleted successfully."
      });
      
      await fetchRequests();
    } catch (error) {
      console.error('Failed to delete request:', error);
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
          response: response,
          target_id: user?.id
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
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="inventory">
          <Package className="h-4 w-4 mr-2" />
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
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Type</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  value={newProduct.type}
                  onChange={(e) => setNewProduct({...newProduct, type: e.target.value})}
                >
                  <option value="Fertilizer">Fertilizer</option>
                  <option value="Seeds">Seeds</option>
                  <option value="Pesticide">Pesticide</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
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
                  type="text" 
                  placeholder="Enter quantity"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (₹ per {newProduct.unit})</label>
                <Input 
                  type="text"
                  placeholder="Enter price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleAddProduct} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add to Inventory
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Products Listed by Farmers</h3>
          {farmerProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {farmerProducts.map(product => (
                <Card key={product.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{product.item}</CardTitle>
                    <CardDescription>Listed by: {product.farmerName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">Quantity: {product.quantity}</p>
                      <p className="text-sm">{product.description}</p>
                      
                      {(product.contactPhone || product.contactEmail) && (
                        <div className="flex flex-col space-y-1 mt-2 p-2 bg-muted rounded-md">
                          {product.contactPhone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                              <p className="text-sm">{product.contactPhone}</p>
                            </div>
                          )}
                          {product.contactEmail && (
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                              <p className="text-sm">{product.contactEmail}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setNewProduct({
                          name: product.item || '',
                          type: 'Other',
                          quantity: product.quantity?.toString() || '',
                          unit: 'kg',
                          price: ''
                        });
                        setActiveTab('inventory');
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to My Inventory
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground">
                No products listed by farmers yet.
              </CardContent>
            </Card>
          )}
        </div>
        
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
                      Price: <span className="font-medium">₹{item.price.toFixed(2)}/{item.unit}</span>
                    </p>
                    <Badge variant={item.available ? "default" : "outline"}>
                      {item.available ? 'Available' : 'Out of Stock'}
                    </Badge>
                  </div>
                  <p className="text-sm">Quantity: {item.quantity} {item.unit}</p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleDeleteProduct(item.id)} className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </CardFooter>
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
                    
                    <div className="flex flex-col space-y-1 mt-4 mb-4 p-3 bg-muted rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium">Farmer Contact Details</h4>
                      </div>
                      {req.contactPhone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <p className="text-sm">{req.contactPhone}</p>
                        </div>
                      )}
                      {req.contactEmail && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <p className="text-sm">{req.contactEmail}</p>
                        </div>
                      )}
                    </div>
                    
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
                    
                    <div className="mt-4 flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteRequest(req.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Request
                      </Button>
                    </div>
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
