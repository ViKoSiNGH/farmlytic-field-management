
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, CalendarRange, Tractor, Wheat, Droplets, LineChart, TrendingUp, Users, ShoppingBag, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    crops: 0,
    fields: 0,
    requests: 0,
    inventory: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      // Fetch crop count
      const { data: crops, error: cropError } = await supabase
        .from('crops')
        .select('id')
        .eq('user_id', user.id);

      // Fetch field count
      const { data: fields, error: fieldError } = await supabase
        .from('fields')
        .select('id')
        .eq('user_id', user.id);

      // Fetch request count
      const { data: requests, error: requestError } = await supabase
        .from('requests')
        .select('id')
        .eq(user.role === 'farmer' ? 'farmer_id' : 'target_id', user.id);

      // Fetch inventory count for suppliers
      const { data: inventory, error: inventoryError } = user.role === 'supplier' 
        ? await supabase.from('inventory').select('id').eq('user_id', user.id)
        : { data: [], error: null };

      setStats({
        crops: crops?.length || 0,
        fields: fields?.length || 0,
        requests: requests?.length || 0,
        inventory: inventory?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set fallback statistics
      setStats({
        crops: 2,
        fields: 3,
        requests: user.role === 'farmer' ? 2 : 5,
        inventory: user.role === 'supplier' ? 8 : 0,
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome {user?.name || 'to FarmLytic'}
        </h1>
        <p className="text-muted-foreground">
          Your agricultural management dashboard for {user?.role || 'farming'} operations
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="role">
            {user?.role === 'farmer' ? 'Farm Management' : 
             user?.role === 'supplier' ? 'Supply Management' : 
             'Advisory Services'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Crops</CardTitle>
                <Wheat className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.crops}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.crops > 0 ? 'Actively monitoring crops' : 'Add crops to start monitoring'}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Fields</CardTitle>
                <Tractor className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.fields}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.fields > 0 ? 'Registered fields' : 'Register fields to manage crops'}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {user?.role === 'farmer' ? 'Active Requests' : 'Pending Responses'}
                </CardTitle>
                <CalendarRange className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.requests}</div>
                <p className="text-xs text-muted-foreground">
                  {user?.role === 'farmer' 
                    ? 'Purchase and advice requests' 
                    : 'Awaiting your attention'}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {user?.role === 'supplier' 
                    ? 'Inventory Items' 
                    : user?.role === 'specialist' 
                      ? 'Completed Advice' 
                      : 'Weather Updates'}
                </CardTitle>
                {user?.role === 'supplier' 
                  ? <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  : user?.role === 'specialist'
                    ? <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    : <Droplets className="h-4 w-4 text-muted-foreground" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {user?.role === 'supplier' 
                    ? stats.inventory 
                    : user?.role === 'specialist' 
                      ? stats.requests > 0 ? Math.floor(stats.requests / 2) : 0
                      : '28°C'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {user?.role === 'supplier' 
                    ? 'Products available for sale' 
                    : user?.role === 'specialist' 
                      ? 'Successfully resolved cases' 
                      : 'Current temperature (Partly Cloudy)'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1 hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle>About FarmLytic</CardTitle>
                <CardDescription>
                  Your comprehensive agricultural management solution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md overflow-hidden">
                  <img 
                    src="/placeholder.svg" 
                    alt="Agricultural management" 
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=800&h=400";
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">FarmLytic helps you:</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                    <li>Track and manage crops throughout their lifecycle</li>
                    <li>Monitor field conditions and plan agricultural activities</li>
                    <li>Connect with suppliers for agricultural inputs</li>
                    <li>Get expert advice from agricultural specialists</li>
                    <li>Sell your agricultural products to a wider market</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => user?.role === 'farmer' ? navigate('/crops') : navigate('/supplier')} className="w-full">
                  {user?.role === 'farmer' ? 'Manage Your Crops' : 
                   user?.role === 'supplier' ? 'Manage Inventory' : 
                   'View Advice Requests'}
                </Button>
              </CardFooter>
            </Card>

            <Card className="col-span-1 hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle>Crop Monitoring</CardTitle>
                <CardDescription>
                  Latest status of your fields and crops
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=800&h=400" 
                    alt="Crop monitoring" 
                    className="w-full h-48 object-cover" 
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Current Status:</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Field Health Index</span>
                      <span className="font-medium text-green-600">85%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span>Average Crop Growth</span>
                      <span className="font-medium text-amber-600">62%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-amber-600 h-2.5 rounded-full" style={{ width: '62%' }}></div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span>Expected Yield</span>
                      <span className="font-medium text-blue-600">78%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => navigate('/fields')} className="w-full">
                  View All Fields
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-md transition-all col-span-1">
              <CardHeader>
                <CardTitle>Growth Analytics</CardTitle>
                <CardDescription>
                  Crop performance over the growing season
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <LineChart className="h-16 w-16 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {user?.role === 'farmer'
                      ? "Track crop performance metrics as they grow"
                      : "Monitor market trends and demand patterns"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all col-span-1">
              <CardHeader>
                <CardTitle>Yield Forecast</CardTitle>
                <CardDescription>
                  Predicted harvest yields based on current data
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Predictive analytics help optimize harvest planning
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="role" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {user?.role === 'farmer' && (
              <>
                <Card className="hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle>Crop Management</CardTitle>
                    <CardDescription>Track and monitor your crops</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Maintain detailed records of all your crops, from planting to harvest.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => navigate('/crops')} className="w-full">Go to Crops</Button>
                  </CardFooter>
                </Card>

                <Card className="hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle>Buy Supplies</CardTitle>
                    <CardDescription>Purchase agricultural inputs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Order seeds, fertilizers, and other farming supplies from trusted suppliers.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => navigate('/farmer')} className="w-full">Request Supplies</Button>
                  </CardFooter>
                </Card>

                <Card className="hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle>Expert Advice</CardTitle>
                    <CardDescription>Get specialist consultation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Connect with agricultural experts to solve your farming challenges.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => navigate('/farmer')} className="w-full">Request Advice</Button>
                  </CardFooter>
                </Card>
              </>
            )}

            {user?.role === 'supplier' && (
              <>
                <Card className="hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle>Inventory Management</CardTitle>
                    <CardDescription>Manage your product inventory</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Add, update, and track all your agricultural supply products.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => navigate('/supplier')} className="w-full">Manage Inventory</Button>
                  </CardFooter>
                </Card>

                <Card className="hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle>Purchase Requests</CardTitle>
                    <CardDescription>Handle farmer orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      View and respond to purchase requests from farmers.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => navigate('/supplier')} className="w-full">View Requests</Button>
                  </CardFooter>
                </Card>

                <Card className="hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle>Market Analysis</CardTitle>
                    <CardDescription>Track agricultural market trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Get insights on demand patterns and optimize your inventory.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Coming Soon</Button>
                  </CardFooter>
                </Card>
              </>
            )}

            {user?.role === 'specialist' && (
              <>
                <Card className="hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle>Advice Requests</CardTitle>
                    <CardDescription>Respond to farmer queries</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      View and respond to farmers seeking agricultural advice.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => navigate('/specialist')} className="w-full">View Requests</Button>
                  </CardFooter>
                </Card>

                <Card className="hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle>Knowledge Base</CardTitle>
                    <CardDescription>Agricultural resources and references</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Access research papers, best practices, and farming guides.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Coming Soon</Button>
                  </CardFooter>
                </Card>

                <Card className="hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle>Field Visits</CardTitle>
                    <CardDescription>Schedule on-site consultations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Manage appointments for in-person farm inspections and consultations.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Coming Soon</Button>
                  </CardFooter>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
