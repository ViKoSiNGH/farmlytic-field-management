
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FieldCard } from '@/components/FieldCard';
import { MapPin, ArrowUpRight, Droplets, Sun, Wind, Plus, Lightbulb, ShoppingBag, Seeds } from 'lucide-react';
import { Field } from '@/types/auth';
import { FieldForm } from '@/components/FieldForm';
import { RolePanels } from '@/components/RolePanels';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { adaptFieldToCardProps } from '@/utils/fieldAdapter';
import { supabase } from '@/integrations/supabase/client';

export function Dashboard() {
  const { isAuthenticated, user, getRole } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState<Field[]>([]);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [location, setLocation] = useState('');
  const [requests, setRequests] = useState({
    pending: 0,
    accepted: 0,
    total: 0
  });
  const [crops, setCrops] = useState(0);
  const [products, setProducts] = useState(0);
  
  useEffect(() => {
    if (user?.role === 'farmer') {
      const savedFields = localStorage.getItem('farmlytic_fields');
      if (savedFields) {
        try {
          setFields(JSON.parse(savedFields));
        } catch (error) {
          console.error('Failed to parse saved fields', error);
        }
      }
      
      fetchCrops();
    }
    
    if (user?.role === 'supplier') {
      fetchProducts();
    }
    
    if (user?.role === 'specialist' || user?.role === 'supplier') {
      fetchRequests();
    }
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocation('Location unavailable');
        }
      );
    } else {
      setLocation('Geolocation not supported');
    }
  }, [user?.id, user?.role]);
  
  const fetchRequests = async () => {
    if (!user?.id) return;
    
    try {
      let query = supabase
        .from('requests')
        .select('*', { count: 'exact' });
      
      if (user.role === 'specialist') {
        query = query.eq('type', 'advice');
      } else if (user.role === 'supplier') {
        query = query.eq('type', 'purchase');
      }
      
      const { data, count, error } = await query;
      
      if (error) {
        console.error('Error fetching requests:', error);
        return;
      }
      
      if (data) {
        const pending = data.filter(req => req.status === 'pending').length;
        const accepted = data.filter(req => req.status === 'accepted').length;
        
        setRequests({
          pending,
          accepted,
          total: count || data.length
        });
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };
  
  const fetchCrops = async () => {
    if (!user?.id) return;
    
    try {
      const { data, count, error } = await supabase
        .from('crops')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching crops:', error);
        return;
      }
      
      setCrops(count || 0);
    } catch (error) {
      console.error('Failed to fetch crops:', error);
    }
  };
  
  const fetchProducts = async () => {
    if (!user?.id) return;
    
    try {
      const { data, count, error } = await supabase
        .from('inventory')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching products:', error);
        return;
      }
      
      setProducts(count || 0);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };
  
  const handleAddField = (newField: Field) => {
    const updatedFields = [...fields, newField];
    setFields(updatedFields);
    localStorage.setItem('farmlytic_fields', JSON.stringify(updatedFields));
    setShowFieldForm(false);
  };
  
  const userRole = getRole() || 'farmer';
  
  // Role-specific dashboard summary cards
  const renderRoleSummary = () => {
    if (userRole === 'farmer') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="hover-card-effect">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <Seeds className="h-5 w-5 mr-2 text-green-500" />
                Crops Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-3">
                <p className="text-3xl font-bold">{crops}</p>
                <p className="text-sm text-muted-foreground">Active Crops</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => navigate('/crops')}
              >
                Manage Crops
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover-card-effect">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                Fields Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-3">
                <p className="text-3xl font-bold">{fields.length}</p>
                <p className="text-sm text-muted-foreground">Registered Fields</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => navigate('/fields')}
              >
                Manage Fields
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover-card-effect">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <Droplets className="h-5 w-5 mr-2 text-blue-400" />
                Current Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-3">
                <p className="text-sm text-muted-foreground mb-1">Your Location</p>
                <p className="font-medium">{location || 'Unknown'}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => navigate('/weather')}
              >
                View Weather
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    } else if (userRole === 'supplier') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="hover-card-effect">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2 text-indigo-500" />
                Inventory Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-3">
                <p className="text-3xl font-bold">{products}</p>
                <p className="text-sm text-muted-foreground">Products Listed</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => navigate('/supplier')}
              >
                Manage Inventory
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover-card-effect">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2 text-orange-500" />
                Purchase Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-3">
                <p className="text-3xl font-bold">{requests.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => navigate('/supplier')}
              >
                View Requests
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover-card-effect">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <ArrowUpRight className="h-5 w-5 mr-2 text-green-500" />
                Sales Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-3">
                <p className="text-3xl font-bold">{requests.accepted}</p>
                <p className="text-sm text-muted-foreground">Completed Sales</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => navigate('/analytics')}
              >
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    } else if (userRole === 'specialist') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="hover-card-effect">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                Advice Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-3">
                <p className="text-3xl font-bold">{requests.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => navigate('/specialist')}
              >
                View Requests
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover-card-effect">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <ArrowUpRight className="h-5 w-5 mr-2 text-green-500" />
                Advice Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-3">
                <p className="text-3xl font-bold">{requests.accepted}</p>
                <p className="text-sm text-muted-foreground">Questions Answered</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => navigate('/analytics')}
              >
                View Analytics
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover-card-effect">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                Your Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-3">
                <p className="font-medium">{location || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground mt-1">Current Position</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => navigate('/specialist')}
              >
                Specialist Tools
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{user ? `, ${user.name}` : ''}
          </p>
        </div>
        {isAuthenticated && userRole === 'farmer' && (
          <Button onClick={() => setShowFieldForm(true)} disabled={showFieldForm}>
            <Plus className="h-4 w-4 mr-2" />
            New Field
          </Button>
        )}
      </div>
      
      {showFieldForm ? (
        <FieldForm 
          onFieldAdded={handleAddField} 
          onCancel={() => setShowFieldForm(false)} 
        />
      ) : (
        <>
          {/* Role-specific summary cards */}
          {isAuthenticated && renderRoleSummary()}
          
          {/* Fields section for farmers */}
          {!showFieldForm && fields.length > 0 && userRole === 'farmer' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Recent Fields</h2>
                <Button variant="outline" size="sm" onClick={() => navigate('/fields')}>
                  View All Fields
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {fields.slice(0, 3).map((field) => (
                  <FieldCard key={field.id} field={adaptFieldToCardProps(field)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
      
      {isAuthenticated && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">
            {userRole === 'farmer' ? 'Farmer Dashboard' : 
             userRole === 'supplier' ? 'Supplier Dashboard' : 
             'Specialist Dashboard'}
          </h2>
          <RolePanels role={userRole} />
        </div>
      )}
    </div>
  );
}
