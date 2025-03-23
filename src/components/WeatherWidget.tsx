
import React from 'react';
import { cn } from '@/lib/utils';
import { Cloud, CloudDrizzle, CloudLightning, CloudRain, CloudSnow, Sun, Wind } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

interface WeatherWidgetProps {
  data: WeatherData;
  className?: string;
}

export function WeatherWidget({ data, className }: WeatherWidgetProps) {
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'clouds':
        return <Cloud className="h-8 w-8 text-gray-500" />;
      case 'rain':
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      case 'drizzle':
        return <CloudDrizzle className="h-8 w-8 text-blue-400" />;
      case 'thunderstorm':
        return <CloudLightning className="h-8 w-8 text-purple-500" />;
      case 'snow':
        return <CloudSnow className="h-8 w-8 text-blue-200" />;
      default:
        return <Cloud className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <Card className={cn("glass-card hover-card-effect", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center justify-between">
          Weather Conditions
          {getWeatherIcon(data.main)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-3xl font-semibold">{data.temperature}°C</p>
              <p className="text-muted-foreground">{data.main}</p>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center justify-end gap-1">
                <span className="text-sm">Humidity:</span>
                <span className="font-medium">{data.humidity}%</span>
              </div>
              <div className="flex items-center justify-end gap-1">
                <span className="text-sm">Wind:</span>
                <span className="font-medium">{data.wind} km/h</span>
                <Wind className="h-3 w-3 ml-1" />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-3 mt-3">
            <p className="text-sm font-medium mb-2">5-Day Forecast</p>
            <div className="grid grid-cols-5 gap-2">
              {data.forecast.map((day) => (
                <div key={day.day} className="text-center">
                  <p className="text-xs font-medium">{day.day}</p>
                  <div className="my-1">{getWeatherIcon(day.main)}</div>
                  <p className="text-sm font-medium">{day.temperature}°</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
