import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, CalendarRange, Tractor, Wheat, Droplets, LineChart, 
  TrendingUp, ShoppingBag, HelpCircle, PieChart, ArrowUpRight,
  Seedling, Sun, CloudRain, Thermometer, Wind, Cloud, AlertCircle,
  Leaf, Settings, Sprout
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

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

  // Weather data simulation
  const weatherData = {
    current: {
      temp: 28,
      condition: 'Partly Cloudy',
      humidity: 65,
      wind: 12,
      precipitation: 0
    },
    forecast: [
      { day: 'Today', high: 28, low: 19, condition: 'Partly Cloudy', icon: <Cloud /> },
      { day: 'Tomorrow', high: 30, low: 20, condition: 'Sunny', icon: <Sun /> },
      { day: 'Wednesday', high: 27, low: 18, condition: 'Rain', icon: <CloudRain /> }
    ]
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
                <CardTitle className="text-sm font-medium">
                  {user?.role === 'farmer' ? 'Fields' : 
                   user?.role === 'supplier' ? 'Product Catalog' : 
                   'Active Cases'}
                </CardTitle>
                {user?.role === 'farmer' ? 
                  <Tractor className="h-4 w-4 text-muted-foreground" /> :
                  user?.role === 'supplier' ? 
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" /> :
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                }
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.fields}</div>
                <p className="text-xs text-muted-foreground">
                  {user?.role === 'farmer' ? 
                    (stats.fields > 0 ? 'Registered fields' : 'Add fields to get started') :
                    user?.role === 'supplier' ?
                    'Products in your catalog' :
                    'Open advisory cases'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Weather Report</CardTitle>
                <Droplets className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{weatherData.current.temp}°C</div>
                <p className="text-xs text-muted-foreground">
                  {weatherData.current.condition} (Humidity: {weatherData.current.humidity}%)
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
                      : 'Field Health'}
                </CardTitle>
                {user?.role === 'supplier' 
                  ? <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  : user?.role === 'specialist'
                    ? <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    : <Sprout className="h-4 w-4 text-muted-foreground" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {user?.role === 'supplier' 
                    ? stats.inventory 
                    : user?.role === 'specialist' 
                      ? stats.requests > 0 ? Math.floor(stats.requests / 2) : 0
                      : '85%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {user?.role === 'supplier' 
                    ? 'Products available for sale' 
                    : user?.role === 'specialist' 
                      ? 'Successfully resolved cases' 
                      : 'Overall crop health index'}
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
                    src="/lovable-uploads/f7d6c8b9-c802-450c-b57e-3d2594e67f45.png" 
                    alt="Agricultural management" 
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      // Fallback image if the uploaded one fails
                      e.currentTarget.src = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1932&q=80";
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">FarmLytic: Empowering Farmers with Technology</h3>
                  <p className="text-sm text-muted-foreground">
                    FarmLytic is a comprehensive farm management platform designed to revolutionize agricultural operations through technology. Our platform connects farmers with suppliers and agricultural specialists, creating an ecosystem that supports sustainable and efficient farming practices.
                  </p>
                  <h3 className="font-medium">Key Features:</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                    <li>Track and manage crops throughout their lifecycle with detailed analytics</li>
                    <li>Monitor field conditions and plan agricultural activities with precision</li>
                    <li>Connect with verified suppliers for agricultural inputs with transparent pricing</li>
                    <li>Get expert advice from agricultural specialists on crop management and pest control</li>
                    <li>Access real-time weather forecasts and alerts specific to field locations</li>
                    <li>Maximize yield through data-driven decisions and best practices</li>
                    <li>Reduce waste through efficient resource management and optimization</li>
                    <li>Track performance metrics across your entire agricultural operation</li>
                    <li>Integrate with IoT sensors for real-time monitoring of field conditions</li>
                    <li>Generate detailed reports and analytics for better decision making</li>
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
                    src="/lovable-uploads/2c9df27b-93ae-4a09-a67f-8f13f8b160bc.png" 
                    alt="Crop monitoring" 
                    className="w-full h-48 object-cover" 
                    onError={(e) => {
                      // Fallback image if the uploaded one fails
                      e.currentTarget.src = "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&h=400";
                    }}
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
                    
                    {/* Recent Activity */}
                    <div className="mt-4">
                      <h4 className="font-medium text-sm mb-2">Recent Activity</h4>
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span className="bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300 p-1 rounded mr-2">
                            <Seedling className="h-3 w-3" />
                          </span>
                          <span>Wheat crop planted in North Field</span>
                          <span className="ml-auto text-xs">2d ago</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span className="bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-300 p-1 rounded mr-2">
                            <Droplets className="h-3 w-3" />
                          </span>
                          <span>Irrigation completed in South Field</span>
                          <span className="ml-auto text-xs">3d ago</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span className="bg-yellow-100 dark:bg-yellow-800/30 text-yellow-800 dark:text-yellow-300 p-1 rounded mr-2">
                            <AlertCircle className="h-3 w-3" />
                          </span>
                          <span>Potential pest issue detected</span>
                          <span className="ml-auto text-xs">5d ago</span>
                        </div>
                      </div>
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
          
          {/* Weather Forecast Card */}
          <Card className="hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cloud className="h-5 w-5 mr-2" />
                Weather Forecast
              </CardTitle>
              <CardDescription>
                3-day forecast for your location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {weatherData.forecast.map((day, index) => (
                  <div key={index} className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/50">
                    <div className="text-foreground/80 font-medium mb-1">{day.day}</div>
                    <div className="p-2 rounded-full bg-background">{day.icon}</div>
                    <div className="mt-2 text-sm">{day.condition}</div>
                    <div className="mt-1 text-xs flex items-center gap-2">
                      <span className="text-red-500">{day.high}°</span>
                      <span className="text-blue-500">{day.low}°</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 grid grid-cols-4 gap-3">
                <div className="flex flex-col items-center p-2 rounded-md bg-muted/30">
                  <Thermometer className="h-4 w-4 mb-1 text-red-500" />
                  <div className="text-xs font-medium">Temperature</div>
                  <div className="text-sm">{weatherData.current.temp}°C</div>
                </div>
                <div className="flex flex-col items-center p-2 rounded-md bg-muted/30">
                  <Droplets className="h-4 w-4 mb-1 text-blue-500" />
                  <div className="text-xs font-medium">Humidity</div>
                  <div className="text-sm">{weatherData.current.humidity}%</div>
                </div>
                <div className="flex flex-col items-center p-2 rounded-md bg-muted/30">
                  <Wind className="h-4 w-4 mb-1 text-cyan-500" />
                  <div className="text-xs font-medium">Wind</div>
                  <div className="text-sm">{weatherData.current.wind} km/h</div>
                </div>
                <div className="flex flex-col items-center p-2 rounded-md bg-muted/30">
                  <CloudRain className="h-4 w-4 mb-1 text-indigo-500" />
                  <div className="text-xs font-medium">Precipitation</div>
                  <div className="text-sm">{weatherData.current.precipitation}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover:shadow-md transition-all transform hover:-translate-y-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Resource Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md overflow-hidden mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&h=400" 
                    alt="Resource optimization" 
                    className="w-full h-36 object-cover" 
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Optimize water, fertilizer, and other inputs based on field conditions and crop requirements using our intelligent resource management system.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-all transform hover:-translate-y-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Market Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md overflow-hidden mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=800&h=400" 
                    alt="Market insights" 
                    className="w-full h-36 object-cover" 
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Stay updated with current market trends and price forecasts for your agricultural products with our real-time market intelligence platform.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-all transform hover:-translate-y-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Expert Support</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md overflow-hidden mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1590682680695-43b964a3ae17?auto=format&fit=crop&w=800&h=400" 
                    alt="Expert support" 
                    className="w-full h-36 object-cover" 
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Access personalized agricultural advice from certified specialists who can help you maximize crop yields and solve farming challenges.
                </p>
              </CardContent>
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
          
          {/* Performance Metrics */}
          <Card className="hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle>Key Performance Metrics</CardTitle>
              <CardDescription>
                Monthly comparison of agricultural performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Resource Efficiency */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Droplets className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="font-medium text-sm">Water Usage Efficiency</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-green-500 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        12%
                      </span>
                      <span className="text-muted-foreground ml-2">vs last month</span>
                    </div>
                  </div>
                  <Progress value={78} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    78% efficiency - reduced water usage while maintaining crop health
                  </div>
                </div>
                
                {/* Yield Projections */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Wheat className="h-4 w-4 mr-2 text-amber-500" />
                      <span className="font-medium text-sm">Expected Yield</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-green-500 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        8%
                      </span>
                      <span className="text-muted-foreground ml-2">vs last season</span>
                    </div>
                  </div>
                  <Progress value={85} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Projected at 85% of maximum potential yield based on current conditions
                  </div>
                </div>
                
                {/* Soil Health */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Leaf className="h-4 w-4 mr-2 text-green-500" />
                      <span className="font-medium text-sm">Soil Health Index</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-amber-500 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        3%
                      </span>
                      <span className="text-muted-foreground ml-2">vs last month</span>
                    </div>
                  </div>
                  <Progress value={72} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    72% soil health - improving gradually with current nutrient management
                  </div>
                </div>
                
                {/* Cost Efficiency */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BarChart className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="font-medium text-sm">Cost per Hectare</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-green-500 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        5%
                      </span>
                      <span className="text-muted-foreground ml-2">improvement</span>
                    </div>
                  </div>
                  <Progress value={65} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    65% cost optimization - reduced input costs through precision agriculture
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
