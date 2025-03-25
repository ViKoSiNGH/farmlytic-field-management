import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FarmerRequest, InventoryItem } from '@/types/auth';
import { ShoppingBag, HelpCircle, DollarSign, Send, ArrowRight, Star, MessageCircle, Phone, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface RolePanelsProps {
  role: 'farmer' | 'supplier' | 'specialist';
}

export function RolePanels({ role }: RolePanelsProps) {
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
    contactPhone: '',
    contactEmail: '',
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
  
  useEffect(() => {
    const savedRequests = localStorage.getItem('farmlytic_requests');
    if (savedRequests) {
      try {
        const parsedRequests: FarmerRequest[] = JSON.parse(savedRequests).map((req: any) => ({
          ...req, 
          createdAt: new Date(req.createdAt)
        }));
        setRequests(parsedRequests);
      } catch (error) {
        console.error('Failed to parse requests:', error);
        setRequests(getSampleRequests());
      }
    } else {
      setRequests(getSampleRequests());
    }
    
    setInventory(getSampleInventoryItems());
    
    setSpecialists([
      { id: 'spec1', name: 'Dr. Alex Johnson' },
      { id: 'spec2', name: 'Dr. Maria Garcia' },
      { id: 'spec3', name: 'Dr. Robert Chen' },
    ]);
    
    setSuppliers([
      { id: 'sup1', name: 'AgriSupply Co.' },
      { id: 'sup2', name: 'FarmWell Products' },
      { id: 'sup3', name: 'GreenGrow Supplies' },
    ]);
    
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
  }, []);
  
  const getSampleRequests = (): FarmerRequest[] => {
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
        targetId: 'sup1',
        contactPhone: '555-123-4567',
        contactEmail: 'john@example.com',
      },
      {
        id: 'req2',
        farmerId: 'farmer1',
        farmerName: 'John Farmer',
        type: 'advice',
        description: 'Having issues with pests in my corn field. What should I do?',
        status: 'accepted',
        createdAt: new Date('2023-06-05'),
        targetId: 'spec1',
        response: 'I recommend using organic pest control methods like neem oil spray. Happy to schedule a field visit next week.',
        contactPhone: '555-123-4567',
        contactEmail: 'john@example.com',
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
  
  const handleSubmitRequest = () => {
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
    
    if (newRequest.type === 'advice' && !newRequest.targetId) {
      toast({
        title: "Missing Information",
        description: "Please select a specialist for advice.",
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
    
    const newReq: FarmerRequest = {
      id: `req-${Date.now()}`,
      farmerId: user?.id || 'farmer1',
      farmerName: user?.name || 'John Farmer',
      type: newRequest.type === 'custom' ? 'purchase' : newRequest.type,
      description: newRequest.description,
      status: 'pending',
      createdAt: new Date(),
      targetId: newRequest.targetId,
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
        : "Your advice request has been sent to the specialist."
    });
  };
  
  const handleRespondToRequest = (requestId: string, response: string, newStatus: 'accepted' | 'rejected') => {
    if (!response) {
      toast({
        title: "Missing Response",
        description: "Please provide a response message.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedRequests = requests.map(req => 
      req.id === requestId 
        ? { ...req, status: newStatus, response }
        : req
    ) as FarmerRequest[];
    
    setRequests(updatedRequests);
    localStorage.setItem('farmlytic_requests', JSON.stringify(updatedRequests));
    
    addChatMessage(requestId, role, response);
    
    toast({
      title: newStatus === 'accepted' ? "Request Accepted" : "Request Rejected",
      description: "Your response has been sent to the farmer."
    });
  };
  
  const handleAddSellerProduct = () => {
    if (!newProduct.name || newProduct.price <= 0) {
      toast({
        title: "Invalid Product Information",
        description: "Please provide a name and valid price for your product.",
        variant: "destructive"
      });
      return;
    }
    
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
  };
  
  const handleSendChatMessage = (requestId: string, message: string) => {
    if (!message.trim()) return;
    
    addChatMessage(requestId, role, message);
    
    const textareaElement = document.getElementById(`chat-${requestId}`) as HTMLTextAreaElement;
    if (textareaElement) {
      textareaElement.value = '';
    }
    
    toast({
      title: "Message Sent",
      description: "Your message has been sent successfully."
    });
  };
  
  const FarmerPanel = () => (
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
              <Select
                value={newRequest.type}
                onValueChange={(value: 'purchase' | 'custom') => 
                  setNewRequest({...newRequest, type: value})
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an item type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Choose from Inventory</SelectItem>
                  <SelectItem value="custom">Custom Item Request</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {newRequest.type === 'purchase' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Item</label>
                <Select
                  value={newRequest.item}
                  onValueChange={(value) => setNewRequest({...newRequest, item: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventory.map(item => (
                      <SelectItem key={item.id} value={item.name}>
                        {item.name} - ${item.price} per {item.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                        req.status === 'rejected' ? 'destructive' : 'outline'
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
                                msg.sender === role 
                                  ? 'ml-auto bg-primary/10 text-primary-foreground' 
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-xs font-medium">{msg.sender === role ? 'You' : 'Supplier'}</p>
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
              <label className="text-sm font-medium">Select Specialist</label>
              <Select
                value={newRequest.targetId}
                onValueChange={(value) => setNewRequest({...newRequest, type: 'advice', targetId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a specialist" />
                </SelectTrigger>
                <SelectContent>
                  {specialists.map(specialist => (
                    <SelectItem key={specialist.id} value={specialist.id}>
                      {specialist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Describe Your Issue</label>
              <Textarea
                placeholder="Explain the problem you're facing or the advice you need..."
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
                        req.status === 'rejected' ? 'destructive' : 'outline'
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
                                msg.sender === role 
                                  ? 'ml-auto bg-primary/10 text-primary-foreground' 
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-xs font-medium">{msg.sender === role ? 'You' : 'Specialist'}</p>
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
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({...newProduct, quantity: parseInt(e.target.value) || 1})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Price ($)</label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
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
                    <Badge>
                      ${product.price.toFixed(2)}
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
  
  const SupplierPanel = () => {
    const [responseText, setResponseText] = useState('');
    const [selectedRequestId, setSelectedRequestId] = useState('');
    
    return (
      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="requests">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Purchase Requests
          </TabsTrigger>
          <TabsTrigger value="products">
            <DollarSign className="h-4 w-4 mr-2" />
            My Products
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests" className="space-y-4">
          <h3 className="text-lg font-medium">Pending Purchase Requests</h3>
          <div className="space-y-4">
            {requests
              .filter(req => req.type === 'purchase' && req.status === 'pending')
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map(req => (
                <Card key={req.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        {req.item} {req.isCustom && <Badge variant="outline">Custom</Badge>}
                      </CardTitle>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                    <CardDescription>
                      From: {req.farmerName} | Requested: {req.createdAt.toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm">Quantity: {req.quantity}</p>
                      <p className="text-sm mt-2">{req.description}</p>
                    </div>
                    
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium mb-2">Farmer Contact:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <p className="text-sm">{req.contactPhone}</p>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <p className="text-sm">{req.contactEmail}</p>
                        </div>
                      </div>
                    </div>
                    
                    <Textarea
                      placeholder="Write your response here..."
                      value={selectedRequestId === req.id ? responseText : ''}
                      onChange={(e) => {
                        setSelectedRequestId(req.id);
                        setResponseText(e.target.value);
                      }}
                    />
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="default" 
                        className="flex-1"
                        onClick={() => {
                          handleRespondToRequest(req.id, responseText || 'I can provide this item. Please contact me for details.', 'accepted');
                          setResponseText('');
                          setSelectedRequestId('');
                        }}
                      >
                        Accept Request
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          handleRespondToRequest(req.id, responseText || 'Sorry, this item is currently unavailable.', 'rejected');
                          setResponseText('');
                          setSelectedRequestId('');
                        }}
                      >
                        Reject Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            
            {requests.filter(req => req.type === 'purchase' && req.status === 'pending').length === 0 && (
              <p className="text-center text-muted-foreground py-6">No pending purchase requests.</p>
            )}
          </div>
          
          <h3 className="text-lg font-medium mt-8">Responded Requests</h3>
          <div className="space-y-4">
            {requests
              .filter(req => req.type === 'purchase' && req.status !== 'pending')
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map(req => (
                <Card key={req.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        {req.item} {req.isCustom && <Badge variant="outline">Custom</Badge>}
                      </CardTitle>
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
                      From: {req.farmerName} | Requested: {req.createdAt.toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Quantity: {req.quantity}</p>
                    <p className="text-sm mt-2">{req.description}</p>
                    
                    {req.response && (
                      <div className="mt-4 p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">Your Response:</p>
                        <p className="text-sm">{req.response}</p>
                      </div>
                    )}
                    
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
                                msg.sender === role 
                                  ? 'ml-auto bg-primary/10 text-primary-foreground' 
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-xs font-medium">{msg.sender === role ? 'You' : 'Farmer'}</p>
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
                  </CardContent>
                </Card>
              ))}
            
            {requests.filter(req => req.type === 'purchase' && req.status !== 'pending').length === 0 && (
              <p className="text-center text-muted-foreground py-6">No responded requests yet.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
              <CardDescription>List your agricultural supplies for farmers to purchase</CardDescription>
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
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({...newProduct, quantity: parseInt(e.target.value) || 1})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price ($)</label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
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
                Add Product
              </Button>
            </CardContent>
          </Card>
          
          <h3 className="text-lg font-medium mt-6">Your Product Listings</h3>
          <div className="space-y-4">
            {sellerProducts
              .filter(product => product.sellerId === (user?.id || 'sup1'))
              .map(product => (
                <Card key={product.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <Badge>
                        ${product.price.toFixed(2)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Quantity: {product.quantity}</p>
                    <p className="text-sm mt-2">{product.description}</p>
                  </CardContent>
                </Card>
              ))}
            
            {sellerProducts.filter(product => product.sellerId === (user?.id || 'sup1')).length === 0 && (
              <p className="text-center text-muted-foreground py-6">No products listed yet. Add your first product above.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    );
  };
  
  const SpecialistPanel = () => {
    const [responseText, setResponseText] = useState('');
    const [selectedRequestId, setSelectedRequestId] = useState('');
    
    return (
      <div className="space-y-8">
        <h3 className="text-xl font-medium">Farmer Advice Requests</h3>
        
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Pending Requests</h4>
          {requests
            .filter(req => req.type === 'advice' && req.status === 'pending' && req.targetId === (user?.id || 'spec1'))
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .map(req => (
              <Card key={req.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Advice Request</CardTitle>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                  <CardDescription>
                    From: {req.farmerName} | Requested: {req.createdAt.toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{req.description}</p>
                  
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm font-medium mb-2">Farmer Contact:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <p className="text-sm">{req.contactPhone}</p>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <p className="text-sm">{req.contactEmail}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Textarea
                    placeholder="Write your advice here..."
                    value={selectedRequestId === req.id ? responseText : ''}
                    onChange={(e) => {
                      setSelectedRequestId(req.id);
                      setResponseText(e.target.value);
                    }}
                  />
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="default" 
                      className="flex-1"
                      onClick={() => {
                        handleRespondToRequest(req.id, responseText || 'I can provide advice on this issue. Please feel free to ask any follow-up questions.', 'accepted');
                        setResponseText('');
                        setSelectedRequestId('');
                      }}
                    >
                      Submit Advice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          
          {requests.filter(req => req.type === 'advice' && req.status === 'pending' && req.targetId === (user?.id || 'spec1')).length === 0 && (
            <p className="text-center text-muted-foreground py-6">No pending advice requests.</p>
          )}
        </div>
        
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Responded Requests</h4>
          {requests
            .filter(req => req.type === 'advice' && req.status !== 'pending' && req.targetId === (user?.id || 'spec1'))
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .map(req => (
              <Card key={req.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Advice Request</CardTitle>
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
                    From: {req.farmerName} | Requested: {req.createdAt.toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{req.description}</p>
                  
                  {req.response && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Your Advice:</p>
                      <p className="text-sm">{req.response}</p>
                    </div>
                  )}
                  
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
                              msg.sender === role 
                                ? 'ml-auto bg-primary/10 text-primary-foreground' 
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-xs font-medium">{msg.sender === role ? 'You' : 'Farmer'}</p>
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
                  </CardContent>
                </CardContent>
              </Card>
            ))}
          
          {requests.filter(req => req.type === 'advice' && req.status !== 'pending' && req.targetId === (user?.id || 'spec1')).length === 0 && (
            <p className="text-center text-muted-foreground py-6">No responded advice requests yet.</p>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6">
      {role === 'farmer' && <FarmerPanel />}
      {role === 'supplier' && <SupplierPanel />}
      {role === 'specialist' && <SpecialistPanel />}
    </div>
  );
}
