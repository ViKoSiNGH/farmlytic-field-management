
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FarmerRequest } from '@/types/auth';
import { Lightbulb, MessageCircle, Phone, Mail, Calendar, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

export function SpecialistPanel() {
  const { toast } = useToast();
  const { user } = useAuth();
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
  
  useEffect(() => {
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
      
    return () => {
      supabase.removeChannel(requestsChannel);
    };
  }, [user?.id]);
  
  const fetchRequests = async () => {
    try {
      let query = supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (user?.id) {
        // For specialist, show requests that are either targeted at them or are advice requests
        query = query.or(`target_id.eq.${user.id},type.eq.advice`);
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
      
      addChatMessage(requestId, 'specialist', response);
      
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
  
  return (
    <div className="w-full space-y-6">
      <h3 className="text-lg font-medium">Advice Requests</h3>
      
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
                  
                  {req.status !== 'pending' && (
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
            No advice requests found. Check back later!
          </CardContent>
        </Card>
      )}
    </div>
  );
}
