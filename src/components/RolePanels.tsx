
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
import { ShoppingBag, HelpCircle, DollarSign, Send, ArrowRight, Star } from 'lucide-react';

interface RolePanelsProps {
  role: 'farmer' | 'supplier' | 'specialist';
}

export function RolePanels({ role }: RolePanelsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('buy');
  const [requests, setRequests] = useState<FarmerRequest[]>([]);
  const [newRequest, setNewRequest] = useState<{
    type: 'advice' | 'purchase';
    item?: string;
    quantity?: number;
    description: string;
    targetId?: string;
  }>({
    type: 'purchase',
    item: '',
    quantity: 1,
    description: '',
    targetId: '',
  });
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [specialists, setSpecialists] = useState<{id: string, name: string}[]>([]);
  const [suppliers, setSuppliers] = useState<{id: string, name: string}[]>([]);
  
  useEffect(() => {
    // Load data from localStorage or use sample data
    const savedRequests = localStorage.getItem('farmlytic_requests');
    if (savedRequests) {
      try {
        // Parse and ensure dates are proper Date objects
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
    
    // Load inventory items
    setInventory(getSampleInventoryItems());
    
    // Load specialists and suppliers
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
  }, []);
  
  // Sample data functions
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
        response: 'I recommend using organic pest control methods like neem oil spray. Happy to schedule a field visit next week.'
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
  
  // Handle submitting a new request
  const handleSubmitRequest = () => {
    if (!newRequest.description) {
      toast({
        title: "Missing Information",
        description: "Please provide a description for your request.",
        variant: "destructive"
      });
      return;
    }
    
    if (newRequest.type === 'purchase' && !newRequest.item) {
      toast({
        title: "Missing Information",
        description: "Please select an item to purchase.",
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
    
    const newReq: FarmerRequest = {
      id: `req-${Date.now()}`,
      farmerId: 'farmer1', // In a real app, this would be the current user's ID
      farmerName: 'John Farmer', // In a real app, this would be the current user's name
      type: newRequest.type,
      description: newRequest.description,
      status: 'pending',
      createdAt: new Date(),
      targetId: newRequest.targetId,
    };
    
    if (newRequest.type === 'purchase') {
      newReq.item = newRequest.item;
      newReq.quantity = newRequest.quantity;
    }
    
    const updatedRequests = [...requests, newReq];
    setRequests(updatedRequests);
    localStorage.setItem('farmlytic_requests', JSON.stringify(updatedRequests));
    
    // Reset form
    setNewRequest({
      type: 'purchase',
      item: '',
      quantity: 1,
      description: '',
      targetId: '',
    });
    
    toast({
      title: "Request Submitted",
      description: newRequest.type === 'purchase' 
        ? "Your purchase request has been sent to the supplier." 
        : "Your advice request has been sent to the specialist."
    });
  };
  
  // Handle response to a request (for suppliers and specialists)
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
    
    toast({
      title: newStatus === 'accepted' ? "Request Accepted" : "Request Rejected",
      description: "Your response has been sent to the farmer."
    });
  };
  
  // Content for Farmer Role
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
              <label className="text-sm font-medium">Select Item</label>
              <Select
                value={newRequest.item}
                onValueChange={(value) => setNewRequest({...newRequest, type: 'purchase', item: value})}
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
            .filter(req => req.type === 'purchase' && req.farmerId === 'farmer1')
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .map(req => (
              <Card key={req.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{req.item}</CardTitle>
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
                </CardContent>
              </Card>
            ))}
          
          {requests.filter(req => req.type === 'purchase' && req.farmerId === 'farmer1').length === 0 && (
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
            .filter(req => req.type === 'advice' && req.farmerId === 'farmer1')
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
                </CardContent>
              </Card>
            ))}
          
          {requests.filter(req => req.type === 'advice' && req.farmerId === 'farmer1').length === 0 && (
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
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground py-6">
              Selling functionality coming soon! Check back later.
            </p>
            <Button variant="outline" className="w-full" disabled>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Create Listing
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
  
  // Content for Supplier Role
  const SupplierPanel = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Farmer Requests</CardTitle>
        <CardDescription>Manage purchase requests from farmers</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="space-y-4">
            {requests
              .filter(req => req.type === 'purchase' && req.status === 'pending')
              .map(req => (
                <Card key={req.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{req.item}</CardTitle>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                    <CardDescription>
                      From: {req.farmerName} · Requested: {req.createdAt.toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">Quantity: {req.quantity}</p>
                    <p className="text-sm">{req.description}</p>
                    
                    <div className="space-y-2 pt-4">
                      <label className="text-sm font-medium">Your Response</label>
                      <Textarea
                        placeholder="Enter your response..."
                        id={`response-${req.id}`}
                      />
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant="default"
                        className="flex-1"
                        onClick={() => {
                          const responseEl = document.getElementById(`response-${req.id}`) as HTMLTextAreaElement;
                          handleRespondToRequest(req.id, responseEl.value, 'accepted');
                        }}
                      >
                        Accept Request
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          const responseEl = document.getElementById(`response-${req.id}`) as HTMLTextAreaElement;
                          handleRespondToRequest(req.id, responseEl.value, 'rejected');
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            
            {requests.filter(req => req.type === 'purchase' && req.status === 'pending').length === 0 && (
              <p className="text-center text-muted-foreground py-6">No pending requests at the moment.</p>
            )}
          </TabsContent>
          
          <TabsContent value="accepted" className="space-y-4">
            {requests
              .filter(req => req.type === 'purchase' && req.status === 'accepted')
              .map(req => (
                <Card key={req.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{req.item}</CardTitle>
                      <Badge>Accepted</Badge>
                    </div>
                    <CardDescription>
                      From: {req.farmerName} · Requested: {req.createdAt.toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Quantity: {req.quantity}</p>
                    <p className="text-sm">{req.description}</p>
                    
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Your Response:</p>
                      <p className="text-sm">{req.response}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            
            {requests.filter(req => req.type === 'purchase' && req.status === 'accepted').length === 0 && (
              <p className="text-center text-muted-foreground py-6">No accepted requests yet.</p>
            )}
          </TabsContent>
          
          <TabsContent value="rejected" className="space-y-4">
            {requests
              .filter(req => req.type === 'purchase' && req.status === 'rejected')
              .map(req => (
                <Card key={req.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{req.item}</CardTitle>
                      <Badge variant="destructive">Rejected</Badge>
                    </div>
                    <CardDescription>
                      From: {req.farmerName} · Requested: {req.createdAt.toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Quantity: {req.quantity}</p>
                    <p className="text-sm">{req.description}</p>
                    
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Your Response:</p>
                      <p className="text-sm">{req.response}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            
            {requests.filter(req => req.type === 'purchase' && req.status === 'rejected').length === 0 && (
              <p className="text-center text-muted-foreground py-6">No rejected requests.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
  
  // Content for Specialist Role
  const SpecialistPanel = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Farmer Advice Requests</CardTitle>
        <CardDescription>Provide agricultural expertise to farmers</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="answered">Answered</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="space-y-4">
            {requests
              .filter(req => req.type === 'advice' && req.status === 'pending')
              .map(req => (
                <Card key={req.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Advice Request</CardTitle>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                    <CardDescription>
                      From: {req.farmerName} · Requested: {req.createdAt.toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{req.description}</p>
                    
                    <div className="space-y-2 pt-4">
                      <label className="text-sm font-medium">Your Advice</label>
                      <Textarea
                        placeholder="Provide your professional advice..."
                        id={`response-${req.id}`}
                      />
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant="default"
                        className="flex-1"
                        onClick={() => {
                          const responseEl = document.getElementById(`response-${req.id}`) as HTMLTextAreaElement;
                          handleRespondToRequest(req.id, responseEl.value, 'accepted');
                        }}
                      >
                        Send Advice
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          const responseEl = document.getElementById(`response-${req.id}`) as HTMLTextAreaElement;
                          handleRespondToRequest(req.id, responseEl.value, 'rejected');
                        }}
                      >
                        Decline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            
            {requests.filter(req => req.type === 'advice' && req.status === 'pending').length === 0 && (
              <p className="text-center text-muted-foreground py-6">No pending advice requests at the moment.</p>
            )}
          </TabsContent>
          
          <TabsContent value="answered" className="space-y-4">
            {requests
              .filter(req => req.type === 'advice' && req.status === 'accepted')
              .map(req => (
                <Card key={req.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Advice Request</CardTitle>
                      <Badge>Answered</Badge>
                    </div>
                    <CardDescription>
                      From: {req.farmerName} · Requested: {req.createdAt.toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{req.description}</p>
                    
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Your Advice:</p>
                      <p className="text-sm">{req.response}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            
            {requests.filter(req => req.type === 'advice' && req.status === 'accepted').length === 0 && (
              <p className="text-center text-muted-foreground py-6">No answered requests yet.</p>
            )}
          </TabsContent>
          
          <TabsContent value="rejected" className="space-y-4">
            {requests
              .filter(req => req.type === 'advice' && req.status === 'rejected')
              .map(req => (
                <Card key={req.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Advice Request</CardTitle>
                      <Badge variant="destructive">Declined</Badge>
                    </div>
                    <CardDescription>
                      From: {req.farmerName} · Requested: {req.createdAt.toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{req.description}</p>
                    
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Your Response:</p>
                      <p className="text-sm">{req.response}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            
            {requests.filter(req => req.type === 'advice' && req.status === 'rejected').length === 0 && (
              <p className="text-center text-muted-foreground py-6">No declined requests.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
  
  // Render the appropriate panel based on role
  return (
    <>
      {role === 'farmer' && <FarmerPanel />}
      {role === 'supplier' && <SupplierPanel />}
      {role === 'specialist' && <SpecialistPanel />}
    </>
  );
}
