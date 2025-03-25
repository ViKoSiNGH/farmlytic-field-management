import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WeatherWidget } from '@/components/WeatherWidget';
import { Button } from '@/components/ui/button';
import { FieldCard } from '@/components/FieldCard';
import { MapPin, ArrowUpRight, Droplets, Sun, Wind, Plus } from 'lucide-react';
import { Field } from '@/types/auth';
import { FieldForm } from '@/components/FieldForm';
import { RolePanels } from '@/components/RolePanels';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { adaptFieldToCardProps } from '@/utils/fieldAdapter';

// Sample data for the weather widget
const sampleWeatherData = {
  main: 'Clear',
  temperature: 24,
  humidity: 65,
  wind: 8,
  forecast: [
    { day: 'Mon', main: 'Clear', temperature: 24 },
    { day: 'Tue', main: 'Clear', temperature: 26 },
    { day: 'Wed', main: 'Clouds', temperature: 25 },
    { day: 'Thu', main: 'Rain', temperature: 22 },
    { day: 'Fri', main: 'Clear', temperature: 23 }
  ]
};

export function Dashboard() {
  const { isAuthenticated, user, getRole } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState<Field[]>([]);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [weatherData, setWeatherData] = useState(sampleWeatherData);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [location, setLocation] = useState('');
  
  useEffect(() => {
    const savedFields = localStorage.getItem('farmlytic_fields');
    if (savedFields) {
      try {
        setFields(JSON.parse(savedFields));
      } catch (error) {
        console.error('Failed to parse saved fields', error);
      }
    }
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`);
          
          setTimeout(() => {
            const mockTemp = Math.round(20 + (latitude % 10));
            setWeatherData({
              ...sampleWeatherData,
              temperature: mockTemp,
              forecast: sampleWeatherData.forecast.map((day, index) => ({
                ...day,
                temperature: mockTemp + (index - 2)
              }))
            });
            setWeatherLoading(false);
          }, 1000);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocation('Location unavailable');
          setWeatherLoading(false);
        }
      );
    } else {
      setLocation('Geolocation not supported');
      setWeatherLoading(false);
    }
  }, []);
  
  const handleAddField = (newField: Field) => {
    const updatedFields = [...fields, newField];
    setFields(updatedFields);
    localStorage.setItem('farmlytic_fields', JSON.stringify(updatedFields));
    setShowFieldForm(false);
  };
  
  const userRole = getRole() || 'farmer';
  
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-2 glass-card">
            <CardHeader className="pb-2">
              <CardTitle>Current Weather</CardTitle>
              <CardDescription>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{location || 'Unknown location'}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WeatherWidget data={weatherData} />
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={() => navigate('/weather')}>
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  View Detailed Forecast
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-1 glass-card hover-card-effect">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Water Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Droplets className="h-12 w-12 mx-auto text-blue-500 mb-2" />
                <div className="text-3xl font-bold">75%</div>
                <p className="text-muted-foreground">Soil Moisture</p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Last Rainfall</span>
                  <span className="font-medium">2 days ago</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Water Needs</span>
                  <span className="font-medium text-amber-500">Moderate</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-1 glass-card hover-card-effect">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Daily Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <Sun className="h-8 w-8 mx-auto text-yellow-500 mb-1" />
                  <div className="text-lg font-bold">6:15 AM</div>
                  <p className="text-xs text-muted-foreground">Sunrise</p>
                </div>
                <div>
                  <Sun className="h-8 w-8 mx-auto text-orange-500 mb-1" />
                  <div className="text-lg font-bold">8:45 PM</div>
                  <p className="text-xs text-muted-foreground">Sunset</p>
                </div>
                <div>
                  <Wind className="h-8 w-8 mx-auto text-blue-400 mb-1" />
                  <div className="text-lg font-bold">8 km/h</div>
                  <p className="text-xs text-muted-foreground">Wind Speed</p>
                </div>
                <div>
                  <Droplets className="h-8 w-8 mx-auto text-blue-300 mb-1" />
                  <div className="text-lg font-bold">65%</div>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {!showFieldForm && fields.length > 0 && (
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
