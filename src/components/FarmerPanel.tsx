import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FarmerRequest, InventoryItem } from '@/types/auth';
import { ShoppingBag, HelpCircle, DollarSign, Send, MessageCircle, Phone, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

export function FarmerPanel() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('buy');
  const [requests, setRequests] = useState<FarmerRequest[]>([]);
  const [newRequest, setNewRequest] = useState<{
    type: 'advice' | 'purchase' | 'custom';
    item?: string;
    customItem?: string;
    quantity?: number;
    description: string;
    targetId?: string;
    contactPhone?: string;
    contactEmail?: string;
  }>({
    type: 'purchase',
    item: '',
    customItem: '',
    quantity: 1,
    description: '',
    targetId: '',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || '',
  });
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [specialists, setSpecialists] = useState<{id: string, name: string}[]>([]);
  const [suppliers, setSuppliers] = useState<{id: string, name: string}[]>([]);
  const [sellerProducts, setSellerProducts] = useState<{
    id: string;
    sellerId?: string;
    sellerName?: string;
    name: string;
    quantity: number;
    price: number;
    description: string;
  }[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    quantity: 1,
    price: 0,
    description: '',
  });
  const [chatMessages, setChatMessages] = useState<{
    requestId: string;
    messages: {
      sender: string;
      text: string;
      timestamp: Date;
    }[];
  }[]>([]);
  
  const availableItems = [
    { name: "Organic Fertilizer", price: 850, unit: "kg" },
    { name: "Tomato Seeds", price: 450, unit: "packet" },
    { name: "Pesticide Spray", price: 1200, unit: "bottle" },
    { name: "Wheat Seeds", price: 650, unit: "kg" },
    { name: "Tractor Parts", price: 7500, unit: "set" },
    { name: "Irrigation Equipment", price: 5500, unit: "set" },
    { name: "Soil Enhancer", price: 1100, unit: "bag" },
    { name: "Rice Seeds", price: 750, unit: "kg" },
    { name: "Plant Protection Kit", price: 1800, unit: "kit" },
    { name: "Farming Tools", price: 3500, unit: "set" }
  ];
  
  useEffect(() => {
    fetchRequests();
    fetchInventory();
    fetchSpecialistsAndSuppliers();
    
    if (user) {
      setNewRequest(prev => ({
        ...prev,
        contactPhone: user.phone || prev.contactPhone,
        contactEmail: user.email || prev.contactEmail
      }));
    }
    
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
    
    const savedProducts = localStorage.getItem('farmlytic_seller_products');
    if (savedProducts) {
      try {
        setSellerProducts(JSON.parse(savedProducts));
      } catch (error) {
        console.error('Failed to parse seller products:', error);
        setSellerProducts([]);
      }
    }
    
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
      let { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('farmer_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching requests:', error);
        const savedRequests = localStorage.getItem('farmlytic_requests');
        if (savedRequests) {
          try {
            const parsedRequests: FarmerRequest[] = JSON.parse(savedRequests).map((req: any) => ({
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
        const formattedRequests: FarmerRequest[] = data.map(req => ({
          id: req.id,
          farmerId: req.farmer_id,
          farmerName: user?.name || 'Farmer',
          type: req.type as 'purchase' | 'advice',
          item: req.item,
          quantity: req.quantity,
          description: req.description,
          status: req.status as 'pending' | 'accepted' | 'rejected',
          createdAt: new Date(req.created_at),
          targetId: req.target_id,
          response: req.response,
          contactPhone: req.contact_phone,
          contactEmail: req.contact_email,
          isCustom: req.is_custom
        }));
        setRequests(formattedRequests);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };
  
  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('available', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching inventory:', error);
        setInventory(getSampleInventoryItems());
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
  
  const fetchSpecialistsAndSuppliers = async () => {
    try {
      const { data: specialistsData, error: specialistsError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('role', 'specialist');
      
      if (specialistsError) {
        console.error('Error fetching specialists:', specialistsError);
        setSpecialists([
          { id: 'spec1', name: 'Dr. Alex Johnson' },
          { id: 'spec2', name: 'Dr. Maria Garcia' },
          { id: 'spec3', name: 'Dr. Robert Chen' },
        ]);
      } else if (specialistsData) {
        setSpecialists(specialistsData);
      }
      
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('role', 'supplier');
      
      if (suppliersError) {
        console.error('Error fetching suppliers:', suppliersError);
        setSuppliers([
          { id: 'sup1', name: 'AgriSupply Co.' },
          { id: 'sup2', name: 'FarmWell Products' },
          { id: 'sup3', name: 'GreenGrow Supplies' },
        ]);
      } else if (suppliersData) {
        setSuppliers(suppliersData);
      }
    } catch (error) {
      console.error('Failed to fetch specialists and suppliers:', error);
    }
  };
  
  const getSampleRequests = (): FarmerRequest[] => {
    return [
      {
        id: 'req1',
        farmerId: user?.id || 'farmer1',
        farmerName: user?.name || 'John Farmer',
        type: 'purchase',
        item: 'Organic Fertilizer',
        quantity: 50,
        description: 'Need organic fertilizer for my North Field.',
        status: 'pending',
        createdAt: new Date('2023-06-10'),
        targetId: 'sup1',
        contactPhone: user?.phone || '555-123-4567',
        contactEmail: user?.email || 'john@example.com',
      },
      {
        id: 'req2',
        farmerId: user?.id || 'farmer1',
        farmerName: user?.name || 'John Farmer',
        type: 'advice',
        description: 'Having issues with pests in my corn field. What should I do?',
        status: 'accepted',
        createdAt: new Date('2023-06-05'),
        targetId: 'spec1',
        response: 'I recommend using organic pest control methods like neem oil spray. Happy to schedule a field visit next week.',
        contactPhone: user?.phone || '555-123-4567',
        contactEmail: user?.email || 'john@example.com',
      }
    ];
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
        sellerId: 'sup1',
        available: true
      },
      {
        id: 'item2',
        type: 'seed',
        name: 'Heirloom Tomato Seeds',
        quantity: 500,
        unit: 'g',
        price: 9.99,
        sellerId: 'sup2',
        available: true
      },
      {
        id: 'item3',
        type: 'pesticide',
        name: 'Neem Oil Spray',
        quantity: 20,
        unit: 'l',
        price: 25.50,
        sellerId: 'sup1',
        available: true
      }
    ];
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
  
  const handleSubmitRequest = async () => {
    if (!newRequest.description) {
      toast({
        title: "Missing Information",
        description: "Please provide a description for your request.",
        variant: "destructive"
      });
      return;
    }
    
    if (newRequest.type === 'purchase' && !newRequest.item && !newRequest.customItem) {
      toast({
        title: "Missing Information",
        description: "Please select an item or provide a custom item to purchase.",
        variant: "destructive"
      });
      return;
    }
    
    if (newRequest.type === 'custom' && !newRequest.customItem) {
      toast({
        title: "Missing Information",
        description: "Please provide the custom item details.",
        variant: "destructive"
      });
      return;
    }
    
    if (!newRequest.contactPhone || !newRequest.contactEmail) {
      toast({
        title: "Missing Contact Information",
        description: "Please provide your contact details for better communication.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      let targetId = newRequest.targetId;
      if (newRequest.type === 'advice') {
        targetId = null;
      }
      
      const { data, error } = await supabase
        .from('requests')
        .insert({
          farmer_id: user?.id,
          type: newRequest.type === 'custom' ? 'purchase' : newRequest.type,
          item: newRequest.type === 'custom' ? newRequest.customItem : newRequest.item,
          quantity: newRequest.quantity,
          description: newRequest.description,
          status: 'pending',
          target_id: targetId,
          contact_phone: newRequest.contactPhone,
          contact_email: newRequest.contactEmail,
          is_custom: newRequest.type === 'custom'
        })
        .select();
      
      if (error) {
        console.error('Error creating request:', error);
        const newReq: FarmerRequest = {
          id: `req-${Date.now()}`,
          farmerId: user?.id || 'farmer1',
          farmerName: user?.name || 'John Farmer',
          type: newRequest.type === 'custom' ? 'purchase' : newRequest.type,
          description: newRequest.description,
          status: 'pending',
          createdAt: new Date(),
          targetId: targetId,
          contactPhone: newRequest.contactPhone,
          contactEmail: newRequest.contactEmail,
          isCustom: newRequest.type === 'custom'
        };
        
        if (newRequest.type === 'purchase' || newRequest.type === 'custom') {
          newReq.item = newRequest.type === 'custom' ? newRequest.customItem : newRequest.item;
          newReq.quantity = newRequest.quantity;
        }
        
        const updatedRequests = [...requests, newReq];
        setRequests(updatedRequests);
        localStorage.setItem('farmlytic_requests', JSON.stringify(updatedRequests));
      } else {
        fetchRequests();
      }
      
      setNewRequest({
        type: 'purchase',
        item: '',
        customItem: '',
        quantity: 1,
        description: '',
        targetId: '',
        contactPhone: newRequest.contactPhone || '',
        contactEmail: newRequest.contactEmail || ''
      });
      
      toast({
        title: "Request Submitted",
        description: newRequest.type === 'purchase' || newRequest.type === 'custom' 
          ? "Your purchase request has been sent to the supplier." 
          : "Your advice request has been sent to a specialist."
      });
    } catch (error) {
      console.error('Failed to submit request:', error);
      toast({
        title: "Request Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleAddSellerProduct = async () => {
    if (!newProduct.name || newProduct.price <= 0) {
      toast({
        title: "Invalid Product Information",
        description: "Please provide a name and valid price for your product.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const product = {
        id: `prod-${Date.now()}`,
        sellerId: user?.id || 'farmer1',
        sellerName: user?.name || 'John Farmer',
        ...newProduct,
      };
      
      const updatedProducts = [...sellerProducts, product];
      setSellerProducts(updatedProducts);
      localStorage.setItem('farmlytic_seller_products', JSON.stringify(updatedProducts));
      
      setNewProduct({
        name: '',
        quantity: 1,
        price: 0,
        description: '',
      });
      
      toast({
        title: "Product Added",
        description: "Your product has been listed for sale."
      });
    } catch (error) {
      console.error('Failed to add product:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleSendChatMessage = (requestId: string, message: string) => {
    if (!message.trim()) return;
    
    addChatMessage(requestId, 'farmer', message);
    
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
    <Tabs defaultValue="buy" className="w-full" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="buy">
          <ShoppingBag className="h-4 w-4 mr-2" />
          Buy Supplies
        </TabsTrigger>
        <TabsTrigger value="advice">
          <HelpCircle className="h-4 w-4 mr-2" />
          Get Advice
        </TabsTrigger>
        <TabsTrigger value="sell">
          <DollarSign className="h-4 w-4 mr-2" />
          Sell Products
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="buy" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Request</CardTitle>
            <CardDescription>Request supplies from our trusted suppliers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Item Type</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={newRequest.type}
                onChange={(e) => setNewRequest({...newRequest, type: e.target.value as 'purchase' | 'custom'})}
              >
                <option value="purchase">Choose from Inventory</option>
                <option value="custom">Custom Item Request</option>
              </select>
            </div>
            
            {newRequest.type === 'purchase' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Item</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  value={newRequest.item}
                  onChange={(e) => setNewRequest({...newRequest, item: e.target.value})}
                >
                  <option value="">Select an item</option>
                  {availableItems.map((item, index) => (
                    <option key={index} value={item.name}>
                      {item.name} - ₹{item.price} per {item.unit}
                    </option>
                  ))}
                  {inventory.map(item => (
                    <option key={item.id} value={item.name}>
                      {item.name} - ₹{item.price} per {item.unit}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Item Name</label>
                <Input
                  placeholder="Enter item name you need"
                  value={newRequest.customItem}
                  onChange={(e) => setNewRequest({...newRequest, customItem: e.target.value})}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                min="1"
                value={newRequest.quantity}
                placeholder="Enter quantity needed"
                onChange={(e) => setNewRequest({...newRequest, quantity: parseInt(e.target.value) || 1})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Details</label>
              <Textarea
                placeholder="Describe your requirements, delivery preferences, etc."
                value={newRequest.description}
                onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Phone</label>
                <Input
                  placeholder="Your phone number"
                  value={newRequest.contactPhone}
                  onChange={(e) => setNewRequest({...newRequest, contactPhone: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Email</label>
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={newRequest.contactEmail}
                  onChange={(e) => setNewRequest({...newRequest, contactEmail: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmitRequest} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Submit Request
            </Button>
          </CardFooter>
        </Card>
        
        <h3 className="text-lg font-medium mt-6">Your Purchase Requests</h3>
        <div className="space-y-4">
          {requests
            .filter(req => req.type === 'purchase' && req.farmerId === (user?.id || 'farmer1'))
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
                    Requested: {req.createdAt.toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Quantity: {req.quantity}</p>
                  <p className="text-sm mt-2">{req.description}</p>
                  
                  {req.response && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Supplier Response:</p>
                      <p className="text-sm">{req.response}</p>
                    </div>
                  )}
                  
                  {req.status === 'accepted' && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                      <p className="text-sm font-semibold text-green-700 dark:text-green-300">Supplier Contact Information:</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <p className="text-sm">555-987-6543</p>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <p className="text-sm">supplier@example.com</p>
                        </div>
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
                                msg.sender === 'farmer' 
                                  ? 'ml-auto bg-primary/10 text-primary-foreground' 
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-xs font-medium">{msg.sender === 'farmer' ? 'You' : 'Supplier'}</p>
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
          
          {requests.filter(req => req.type === 'purchase' && req.farmerId === (user?.id || 'farmer1')).length === 0 && (
            <p className="text-center text-muted-foreground py-6">No purchase requests yet. Submit your first request above.</p>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="advice" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Request Advice</CardTitle>
            <CardDescription>Get expert advice from agricultural specialists</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Describe Your Issue</label>
              <Textarea
                placeholder="Explain the problem you're facing or the advice you need..."
                value={newRequest.description}
                onChange={(e) => setNewRequest({...newRequest, type: 'advice', description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Phone</label>
                <Input
                  placeholder="Your phone number"
                  value={newRequest.contactPhone}
                  onChange={(e) => setNewRequest({...newRequest, contactPhone: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Email</label>
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={newRequest.contactEmail}
                  onChange={(e) => setNewRequest({...newRequest, contactEmail: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmitRequest} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Request Advice
            </Button>
          </CardFooter>
        </Card>
        
        <h3 className="text-lg font-medium mt-6">Your Advice Requests</h3>
        <div className="space-y-4">
          {requests
            .filter(req => req.type === 'advice' && req.farmerId === (user?.id || 'farmer1'))
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .map(req => (
              <Card key={req.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Advice Request</CardTitle>
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
                    Requested: {req.createdAt.toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{req.description}</p>
                  
                  {req.response && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Specialist Response:</p>
                      <p className="text-sm">{req.response}</p>
                    </div>
                  )}
                  
                  {req.status === 'accepted' && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                      <p className="text-sm font-semibold text-green-700 dark:text-green-300">Specialist Contact Information:</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <p className="text-sm">555-789-0123</p>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <p className="text-sm">specialist@example.com</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {req.status !== 'pending' && (
                    <div className="mt-4 border rounded-md">
                      <div className="bg-muted p-2 rounded-t-md border-b">
                        <h4 className="text-sm font-medium flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Chat with Specialist
                        </h4>
                      </div>
                      
                      <div className="p-3 max-h-40 overflow-y-auto space-y-2">
                        {getChatForRequest(req.id).length > 0 ? (
                          getChatForRequest(req.id).map((msg, i) => (
                            <div 
                              key={i} 
                              className={`p-2 rounded-lg max-w-[85%] ${
                                msg.sender === 'farmer' 
                                  ? 'ml-auto bg-primary/10 text-primary-foreground' 
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-xs font-medium">{msg.sender === 'farmer' ? 'You' : 'Specialist'}</p>
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
          
          {requests.filter(req => req.type === 'advice' && req.farmerId === (user?.id || 'farmer1')).length === 0 && (
            <p className="text-center text-muted-foreground py-6">No advice requests yet. Submit your first request above.</p>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="sell" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Sell Your Products</CardTitle>
            <CardDescription>List your crops and agricultural products for sale</CardDescription>
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
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({...newProduct, quantity: parseInt(e.target.value) || 1})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (₹)</label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Enter price in INR"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe your product, quality, etc."
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              />
            </div>
            
            <Button onClick={handleAddSellerProduct} className="w-full mt-2">
              <ShoppingBag className="h-4 w-4 mr-2" />
              List Product
            </Button>
          </CardContent>
        </Card>
        
        <h3 className="text-lg font-medium mt-6">Your Listed Products</h3>
        <div className="space-y-4">
          {sellerProducts
            .filter(product => product.sellerId === (user?.id || 'farmer1'))
            .map(product => (
              <Card key={product.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <Badge variant="outline">
                      ₹{product.price.toFixed(2)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Quantity: {product.quantity}</p>
                  <p className="text-sm mt-2">{product.description}</p>
                </CardContent>
              </Card>
            ))}
          
          {sellerProducts.filter(product => product.sellerId === (user?.id || 'farmer1')).length === 0 && (
            <p className="text-center text-muted-foreground py-6">No products listed yet. Add your first product above.</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
