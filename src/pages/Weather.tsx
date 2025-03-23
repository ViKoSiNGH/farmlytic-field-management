
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { WeatherWidget } from '@/components/WeatherWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';

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
  const [location, setLocation] = useState('Loading...');
  const [currentDate, setCurrentDate] = useState('');
  const [weatherData, setWeatherData] = useState(defaultWeatherData);
  const [isLoading, setIsLoading] = useState(true);

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
          setLocation('Location unavailable');
          setIsLoading(false);
        }
      );
    } else {
      setLocation('Geolocation not supported');
      setIsLoading(false);
    }
  }, []);

  const fetchLocationName = async (latitude, longitude) => {
    try {
      // This would typically use a geocoding API, but we'll use a mock for now
      setLocation(`${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`);
      
      // In a real app, you would use something like:
      // const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`);
      // const data = await response.json();
      // setLocation(data.results[0].formatted);
    } catch (error) {
      console.error('Error fetching location name:', error);
      setLocation(`${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`);
    }
  };

  const fetchWeatherData = async (latitude, longitude) => {
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
            <span>{location}</span>
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
