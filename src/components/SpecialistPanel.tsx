import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FarmerRequest } from '@/types/auth';
import { Lightbulb, MessageCircle, Phone, Mail, Calendar, FileText, BarChart, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button as ShadcnButton } from '@/components/ui/button';

export function SpecialistPanel() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('advice');
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [analyticsData, setAnalyticsData] = useState([
    { category: 'Crops', answered: 12 },
    { category: 'Pests', answered: 8 },
    { category: 'Diseases', answered: 5 },
    { category: 'Soil', answered: 7 },
    { category: 'Irrigation', answered: 9 },
    { category: 'Fertilizers', answered: 11 }
  ]);
  
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      setError('You must be logged in to access this panel');
      return;
    }
    
    fetchRequests();
    
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
      supabase.removeChannel(requestsChannel);
    };
  }, [user?.id, isAuthenticated]);
  
  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        setError('Authentication required');
        setIsLoading(false);
        return;
      }
      
      console.log('Fetching advice requests for specialist:', user.id);
      
      let query = supabase
        .from('requests')
        .select('*')
        .eq('type', 'advice')
        .order('created_at', { ascending: false });
      
      if (user.id) {
        query = query.eq('target_id', user.id);
      }
        
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching requests:', error);
        setError('Failed to load requests: ' + error.message);
        return;
      }
      
      if (data) {
        console.log('Found', data.length, 'advice requests');
        
        const formattedRequests: FarmerRequest[] = await Promise.all(
          data.map(async (req) => {
            let farmerName = "Unknown Farmer";
            
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', req.farmer_id)
                .single();
                
              if (!profileError && profileData) {
                farmerName = profileData.name;
              }
            } catch (e) {
              console.error('Error fetching farmer name:', e);
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
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRespondToRequest = async (requestId: string, newStatus: 'accepted' | 'rejected') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to respond to requests.",
        variant: "destructive"
      });
      return;
    }
    
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
          target_id: user.id
        })
        .eq('id', requestId);
        
      if (error) {
        console.error('Error updating request:', error);
        toast({
          title: "Error",
          description: "Failed to update request: " + error.message,
          variant: "destructive"
        });
        return;
      }
      
      addChatMessage(requestId, 'specialist', response);
      
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
  
  const handleMarkAsCompleted = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('requests')
        .update({
          status: 'completed'
        })
        .eq('id', requestId);
        
      if (error) {
        console.error('Error marking request as completed:', error);
        toast({
          title: "Error",
          description: "Failed to mark request as completed. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Request marked as completed successfully."
      });
      
      await fetchRequests();
    } catch (error) {
      console.error('Failed to mark request as completed:', error);
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
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to send messages.",
        variant: "destructive"
      });
      return;
    }
    
    addChatMessage(requestId, 'specialist', message);
    
    const textareaElement = document.getElementById(`chat-${requestId}`) as HTMLTextAreaElement;
    if (textareaElement) {
      textareaElement.value = '';
    }
    
    toast({
      title: "Message Sent",
      description: "Your message has been sent successfully."
    });
  };
  
  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };
  
  if (!isAuthenticated) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <div className="text-amber-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground mb-4">
            You need to be logged in as a specialist to access this panel.
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading advice requests...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Error Loading Data</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchRequests}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue="advice" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-1 mb-4">
          <TabsTrigger value="advice">
            <Lightbulb className="h-4 w-4 mr-2" />
            Advice Requests
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="advice">
          {requests.filter(req => req.type === 'advice').length > 0 ? (
            <div className="space-y-4">
              {requests
                .filter(req => req.type === 'advice')
                .map(req => (
                  <Card key={req.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center">
                          <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                          Advice Request
                        </CardTitle>
                        <Badge
                          variant={getStatusBadgeVariant(req.status)}
                        >
                          {req.status === 'completed' ? 'Completed' : req.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        From: {req.farmerName} • Requested: {req.createdAt.toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-3 rounded-md mb-4">
                        <p className="text-sm font-medium mb-1">Farmer's Question:</p>
                        <p className="text-sm">{req.description}</p>
                      </div>
                      
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
                            placeholder="Enter your expert advice for this farmer..."
                            className="min-h-[120px]"
                            value={responseText[req.id] || ''}
                            onChange={(e) => setResponseText({...responseText, [req.id]: e.target.value})}
                          />
                          <div className="flex space-x-2">
                            <Button 
                              variant="default" 
                              className="flex-1"
                              onClick={() => handleRespondToRequest(req.id, 'accepted')}
                            >
                              Accept & Send Advice
                            </Button>
                            <Button 
                              variant="destructive" 
                              className="flex-1"
                              onClick={() => handleRespondToRequest(req.id, 'rejected')}
                            >
                              Decline Request
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {req.status !== 'pending' && req.response && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                          <p className="text-sm font-medium mb-1">Your Response:</p>
                          <p className="text-sm">{req.response}</p>
                        </div>
                      )}
                      
                      {req.status === 'accepted' && (
                        <div className="mt-4 border rounded-md">
                          <div className="bg-muted p-2 rounded-t-md border-b">
                            <h4 className="text-sm font-medium flex items-center">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Conversation with Farmer
                            </h4>
                          </div>
                          
                          <div className="p-3 max-h-60 overflow-y-auto space-y-2">
                            {getChatForRequest(req.id).length > 0 ? (
                              getChatForRequest(req.id).map((msg, i) => (
                                <div 
                                  key={i} 
                                  className={`p-2 rounded-lg max-w-[85%] ${
                                    msg.sender === 'specialist' 
                                      ? 'ml-auto bg-primary/10 text-primary-foreground' 
                                      : 'bg-muted'
                                  }`}
                                >
                                  <p className="text-xs font-medium">{msg.sender === 'specialist' ? 'You' : 'Farmer'}</p>
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
                            <div className="flex flex-col gap-2">
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
                              
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="self-end"
                                onClick={() => handleMarkAsCompleted(req.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark Complete
                              </Button>
                            </div>
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
                No advice requests found. Check back later!
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
