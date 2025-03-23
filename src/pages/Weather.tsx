
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { WeatherWidget } from '@/components/WeatherWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, MapPin, Calendar, Search, Plus, Loader } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Type for weather data
interface WeatherData {
  main: string;
  temperature: number;
  humidity: number;
  wind: number;
  forecast: Array<{
    day: string;
    main: string;
    temperature: number;
  }>;
}

// Default sample data
const defaultWeatherData = {
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

export default function Weather() {
  const [currentLocation, setCurrentLocation] = useState('Loading...');
  const [currentDate, setCurrentDate] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData>(defaultWeatherData);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedLocations, setSavedLocations] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Set current date
    setCurrentDate(format(new Date(), 'EEEE, MMMM do, yyyy'));
    
    // Get user's location and fetch weather data
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          fetchLocationName(latitude, longitude);
          fetchWeatherData(latitude, longitude);
        },
        error => {
          console.error('Error getting location:', error);
          setCurrentLocation('Location unavailable');
          setIsLoading(false);
          toast({
            title: "Location Error",
            description: "Could not get your current location. Please search manually.",
            variant: "destructive"
          });
        }
      );
    } else {
      setCurrentLocation('Geolocation not supported');
      setIsLoading(false);
      toast({
        title: "Location Error",
        description: "Your browser does not support geolocation. Please search manually.",
        variant: "destructive"
      });
    }

    // Load saved locations from localStorage
    const savedLocs = localStorage.getItem('savedWeatherLocations');
    if (savedLocs) {
      setSavedLocations(JSON.parse(savedLocs));
    }
  }, []);

  const fetchLocationName = async (latitude: number, longitude: number) => {
    try {
      // This would typically use a geocoding API, but we'll use a mock for now
      setCurrentLocation(`${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`);
      
      // In a real app, you would use something like:
      // const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`);
      // const data = await response.json();
      // setCurrentLocation(data.results[0].formatted);
    } catch (error) {
      console.error('Error fetching location name:', error);
      setCurrentLocation(`${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`);
    }
  };

  const fetchWeatherData = async (latitude: number, longitude: number) => {
    try {
      // This would typically use a weather API, but we'll use mock data for now
      // In a real app, you would use something like:
      // const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly&units=metric&appid=YOUR_API_KEY`);
      // const data = await response.json();
      
      // For demo purposes, we'll just modify the default data slightly based on coordinates
      const mockTemp = Math.round(20 + (latitude % 10));
      const modifiedData = {
        ...defaultWeatherData,
        temperature: mockTemp,
        forecast: defaultWeatherData.forecast.map((day, index) => ({
          ...day,
          temperature: mockTemp + (index - 2)
        }))
      };
      
      setWeatherData(modifiedData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a location to search",
      });
      return;
    }

    setIsLoading(true);
    
    // In a real app, you would search for the location's coordinates
    // For this demo, we'll simulate it with random values
    const mockLatitude = 35 + (Math.random() * 10);
    const mockLongitude = -95 + (Math.random() * 10);
    
    setCurrentLocation(searchQuery);
    fetchWeatherData(mockLatitude, mockLongitude);
    
    toast({
      title: "Location Found",
      description: `Showing weather for ${searchQuery}`,
    });
  };

  const saveLocation = () => {
    if (!currentLocation || currentLocation === 'Loading...' || 
        currentLocation === 'Location unavailable' || 
        currentLocation === 'Geolocation not supported') {
      toast({
        title: "Save Error",
        description: "Cannot save current location.",
        variant: "destructive"
      });
      return;
    }

    if (savedLocations.includes(currentLocation)) {
      toast({
        title: "Already Saved",
        description: `${currentLocation} is already in your saved locations.`,
      });
      return;
    }

    const newSavedLocations = [...savedLocations, currentLocation];
    setSavedLocations(newSavedLocations);
    localStorage.setItem('savedWeatherLocations', JSON.stringify(newSavedLocations));
    
    toast({
      title: "Location Saved",
      description: `${currentLocation} has been added to your saved locations.`,
    });
  };

  const loadSavedLocation = (location: string) => {
    setSearchQuery(location);
    setCurrentLocation(location);
    setIsLoading(true);
    
    // Similar to search, simulate with random values
    const mockLatitude = 35 + (Math.random() * 10);
    const mockLongitude = -95 + (Math.random() * 10);
    
    fetchWeatherData(mockLatitude, mockLongitude);
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Weather Forecast</h1>
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{currentDate}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{currentLocation}</span>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex gap-2 mb-4">
              <Input 
                placeholder="Search location..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" onClick={saveLocation}>
                <Plus className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
            
            {savedLocations.length > 0 && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Saved Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {savedLocations.map((location, index) => (
                      <Button 
                        key={index} 
                        variant="outline" 
                        size="sm"
                        onClick={() => loadSavedLocation(location)}
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        {location}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cloud className="h-5 w-5 mr-2 text-primary" />
              Current Weather
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : (
              <WeatherWidget data={weatherData} />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
