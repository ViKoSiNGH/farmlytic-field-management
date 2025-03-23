
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, ThumbsUp, ThumbsDown, ShoppingCart, MessageSquare, Trash2, Plus } from 'lucide-react';
import { UserRole, FarmerRequest, InventoryItem } from '@/types/auth';
import { useAuth } from '@/hooks/use-auth';

interface RolePanelsProps {
  role: UserRole;
}

// Mock data
const mockRequests: FarmerRequest[] = [
  {
    id: 'req-1',
    farmerId: '1',
    farmerName: 'John Farmer',
    type: 'purchase',
    item: 'NPK Fertilizer',
    quantity: 5,
    description: 'Need NPK fertilizer for my corn field',
    status: 'pending',
    createdAt: new Date('2023-05-10')
  },
  {
    id: 'req-2',
    farmerId: '1',
    farmerName: 'John Farmer',
    type: 'advice',
    description: 'My tomato plants have yellow leaves. What could be the cause?',
    status: 'pending',
    createdAt: new Date('2023-05-15')
  }
];

const mockInventory: InventoryItem[] = [
  {
    id: 'item-1',
    type: 'fertilizer',
    name: 'NPK Fertilizer',
    quantity: 100,
    unit: 'kg',
    price: 25,
    sellerId: '2',
    available: true
  },
  {
    id: 'item-2',
    type: 'seed',
    name: 'Corn Seeds',
    quantity: 50,
    unit: 'kg',
    price: 15,
    sellerId: '2',
    available: true
  },
  {
    id: 'item-3',
    type: 'pesticide',
    name: 'Natural Pesticide',
    quantity: 30,
    unit: 'liter',
    price: 40,
    sellerId: '2',
    available: true
  }
];

export function RolePanels({ role }: RolePanelsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<FarmerRequest[]>(mockRequests);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [newRequest, setNewRequest] = useState({
    type: 'purchase',
    item: '',
    quantity: 1,
    description: ''
  });
  const [newItem, setNewItem] = useState({
    type: 'fertilizer',
    name: '',
    quantity: 1,
    unit: 'kg',
    price: 0
  });
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Farmer functions
  const handleCreateRequest = () => {
    if (!newRequest.description || (newRequest.type === 'purchase' && (!newRequest.item || newRequest.quantity < 1))) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newReq: FarmerRequest = {
        id: `req-${Date.now()}`,
        farmerId: user?.id || '1',
        farmerName: user?.name || 'Anonymous Farmer',
        type: newRequest.type as 'advice' | 'purchase',
        item: newRequest.type === 'purchase' ? newRequest.item : undefined,
        quantity: newRequest.type === 'purchase' ? newRequest.quantity : undefined,
        description: newRequest.description,
        status: 'pending',
        createdAt: new Date()
      };
      
      setRequests([...requests, newReq]);
      
      setNewRequest({
        type: 'purchase',
        item: '',
        quantity: 1,
        description: ''
      });
      
      toast({
        title: "Request Sent",
        description: "Your request has been sent successfully!"
      });
      
      setIsSubmitting(false);
    }, 1000);
  };

  const purchaseItem = (item: InventoryItem) => {
    toast({
      title: "Purchase Initiated",
      description: `You are purchasing ${item.name}. The supplier will contact you soon.`
    });
    
    // Create a purchase request
    const newReq: FarmerRequest = {
      id: `req-${Date.now()}`,
      farmerId: user?.id || '1',
      farmerName: user?.name || 'Anonymous Farmer',
      type: 'purchase',
      item: item.name,
      quantity: 1,
      description: `I want to purchase ${item.name}`,
      status: 'pending',
      createdAt: new Date(),
      targetId: item.sellerId
    };
    
    setRequests([...requests, newReq]);
  };

  // Supplier functions
  const handleAddItem = () => {
    if (!newItem.name || newItem.quantity < 1 || newItem.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid values",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newInventoryItem: InventoryItem = {
        id: `item-${Date.now()}`,
        type: newItem.type as 'seed' | 'fertilizer' | 'pesticide' | 'crop' | 'waste',
        name: newItem.name,
        quantity: newItem.quantity,
        unit: newItem.unit,
        price: newItem.price,
        sellerId: user?.id || '2',
        available: true
      };
      
      setInventory([...inventory, newInventoryItem]);
      
      setNewItem({
        type: 'fertilizer',
        name: '',
        quantity: 1,
        unit: 'kg',
        price: 0
      });
      
      toast({
        title: "Item Added",
        description: "Your item has been added to the inventory!"
      });
      
      setIsSubmitting(false);
    }, 1000);
  };

  const handleRequestResponse = (request: FarmerRequest, accepted: boolean) => {
    const updatedRequests = requests.map(req => 
      req.id === request.id 
        ? { ...req, status: accepted ? 'accepted' : 'rejected', response: responseText }
        : req
    );
    
    setRequests(updatedRequests);
    
    toast({
      title: accepted ? "Request Accepted" : "Request Rejected",
      description: `You have ${accepted ? 'accepted' : 'rejected'} the request from ${request.farmerName}.`
    });
    
    setResponseText('');
  };

  // Specialist functions
  const sendAdvice = (request: FarmerRequest) => {
    if (!responseText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter your advice before submitting",
        variant: "destructive"
      });
      return;
    }
    
    const updatedRequests = requests.map(req => 
      req.id === request.id 
        ? { ...req, status: 'accepted', response: responseText }
        : req
    );
    
    setRequests(updatedRequests);
    
    toast({
      title: "Advice Sent",
      description: `Your advice has been sent to ${request.farmerName}.`
    });
    
    setResponseText('');
  };

  // Render based on role
  if (role === 'farmer') {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Request</CardTitle>
            <CardDescription>Request supplies or specialist advice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Request Type</label>
                <Select
                  value={newRequest.type}
                  onValueChange={(value) => setNewRequest({...newRequest, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purchase">Purchase Supplies</SelectItem>
                    <SelectItem value="advice">Request Advice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newRequest.type === 'purchase' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Item</label>
                    <Input 
                      placeholder="What do you need?" 
                      value={newRequest.item}
                      onChange={(e) => setNewRequest({...newRequest, item: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <Input 
                      type="number" 
                      min={1}
                      value={newRequest.quantity}
                      onChange={(e) => setNewRequest({...newRequest, quantity: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea 
                placeholder={newRequest.type === 'purchase' 
                  ? "Provide details about what you need..." 
                  : "Describe your problem or question..."
                }
                rows={4}
                value={newRequest.description}
                onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={handleCreateRequest} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Request
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Available Supplies</CardTitle>
            <CardDescription>Browse and purchase supplies from suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventory.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.quantity} {item.unit} available
                    </div>
                    <Badge variant="outline" className="mt-1">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${item.price.toFixed(2)}/{item.unit}</div>
                    <Button size="sm" variant="outline" onClick={() => purchaseItem(item)}>
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Purchase
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
            <CardDescription>Track the status of your requests</CardDescription>
          </CardHeader>
          <CardContent>
            {requests
              .filter(req => req.farmerId === (user?.id || '1'))
              .map((request) => (
                <div key={request.id} className="mb-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className={
                        request.status === 'accepted' ? 'bg-green-500' : 
                        request.status === 'rejected' ? 'bg-red-500' : 
                        'bg-yellow-500'
                      }>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                      <h4 className="font-semibold text-lg mt-1">
                        {request.type === 'purchase' 
                          ? `Purchase: ${request.item} (${request.quantity})`
                          : 'Advice Request'
                        }
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => {
                      const updatedRequests = requests.filter(r => r.id !== request.id);
                      setRequests(updatedRequests);
                      toast({
                        title: "Request Removed",
                        description: "Your request has been removed."
                      });
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="my-2">{request.description}</p>
                  
                  {request.status !== 'pending' && request.response && (
                    <div className="mt-3 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Response:</p>
                      <p className="text-sm">{request.response}</p>
                    </div>
                  )}
                </div>
              ))}
            
            {requests.filter(req => req.farmerId === (user?.id || '1')).length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                You haven't made any requests yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (role === 'supplier') {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Add New Item</CardTitle>
            <CardDescription>Add new products to your inventory</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Item Type</label>
                <Select
                  value={newItem.type}
                  onValueChange={(value) => setNewItem({...newItem, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seed">Seeds</SelectItem>
                    <SelectItem value="fertilizer">Fertilizer</SelectItem>
                    <SelectItem value="pesticide">Pesticide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input 
                  placeholder="Product name" 
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <Input 
                  type="number" 
                  min={1}
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Unit</label>
                <Select
                  value={newItem.unit}
                  onValueChange={(value) => setNewItem({...newItem, unit: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="g">Grams (g)</SelectItem>
                    <SelectItem value="liter">Liters (L)</SelectItem>
                    <SelectItem value="packet">Packets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Price per unit ($)</label>
                <Input 
                  type="number" 
                  min={0}
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={handleAddItem} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>My Inventory</CardTitle>
            <CardDescription>Manage your available products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventory
                .filter(item => item.sellerId === (user?.id || '2'))
                .map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.quantity} {item.unit} available
                    </div>
                    <Badge variant="outline" className="mt-1">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${item.price.toFixed(2)}/{item.unit}</div>
                    <Button size="sm" variant="destructive" onClick={() => {
                      const updatedInventory = inventory.filter(i => i.id !== item.id);
                      setInventory(updatedInventory);
                      toast({
                        title: "Item Removed",
                        description: `${item.name} has been removed from your inventory.`
                      });
                    }}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              
              {inventory.filter(item => item.sellerId === (user?.id || '2')).length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  You haven't added any items yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Farmer Requests</CardTitle>
            <CardDescription>Respond to purchase requests from farmers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests
                .filter(req => req.type === 'purchase' && req.status === 'pending')
                .map((request) => (
                <div key={request.id} className="mb-4 p-4 border rounded-lg">
                  <h4 className="font-semibold text-lg">
                    Request from {request.farmerName}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                  
                  <div className="my-2">
                    <span className="font-medium">Item:</span> {request.item} ({request.quantity})
                  </div>
                  
                  <p className="my-2">{request.description}</p>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Response (optional)</label>
                    <Textarea 
                      placeholder="Add details about delivery, payment, etc..." 
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="mt-4 flex space-x-2 justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => handleRequestResponse(request, false)}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button 
                      onClick={() => handleRequestResponse(request, true)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
              
              {requests.filter(req => req.type === 'purchase' && req.status === 'pending').length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No pending purchase requests at the moment.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (role === 'specialist') {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Farmer Advice Requests</CardTitle>
            <CardDescription>Respond to farmers seeking agricultural advice</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests
                .filter(req => req.type === 'advice' && req.status === 'pending')
                .map((request) => (
                <div key={request.id} className="mb-4 p-4 border rounded-lg">
                  <h4 className="font-semibold text-lg">
                    Request from {request.farmerName}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                  
                  <p className="my-2">{request.description}</p>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Your Advice</label>
                    <Textarea 
                      placeholder="Provide your professional advice..." 
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      rows={4}
                    />
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button 
                      onClick={() => sendAdvice(request)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Advice
                    </Button>
                  </div>
                </div>
              ))}
              
              {requests.filter(req => req.type === 'advice' && req.status === 'pending').length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No pending advice requests at the moment.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Previous Consultations</CardTitle>
            <CardDescription>Review your previous advice to farmers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests
                .filter(req => req.type === 'advice' && req.status !== 'pending' && req.response)
                .map((request) => (
                <div key={request.id} className="mb-4 p-4 border rounded-lg">
                  <div className="flex justify-between">
                    <h4 className="font-semibold text-lg">
                      Consultation with {request.farmerName}
                    </h4>
                    <Badge className="bg-green-500">Completed</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                  
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">Farmer's Question:</p>
                    <p className="text-sm">{request.description}</p>
                  </div>
                  
                  <div className="mt-3 p-3 bg-primary/10 rounded-md">
                    <p className="text-sm font-medium">Your Advice:</p>
                    <p className="text-sm">{request.response}</p>
                  </div>
                </div>
              ))}
              
              {requests.filter(req => req.type === 'advice' && req.status !== 'pending' && req.response).length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  You haven't completed any consultations yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return null;
}
