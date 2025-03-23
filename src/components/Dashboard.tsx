import React from 'react';
import { FieldCard } from './FieldCard';
import { WeatherWidget } from './WeatherWidget';
import { CropManagement } from './CropManagement';
import { FieldMetrics } from './FieldMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ChevronsRight, Cloud, Locate, ThermometerSun } from 'lucide-react';
import { GardenIcon, SeedlingIcon } from '@/components/GardenIcon';
import { Button } from '@/components/ui/button';

// Sample data
const fields = [
  {
    id: '1',
    name: 'North Field',
    size: 12.5,
    unit: 'hectares',
    crop: 'Wheat',
    plantDate: 'Mar 15, 2023',
    status: 'Growing',
    moistureLevel: 68,
    temperature: 24,
    image: 'https://images.unsplash.com/photo-1595228704738-5c5a1dae1d7b?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '2',
    name: 'South Field',
    size: 8.2,
    unit: 'hectares',
    crop: 'Corn',
    plantDate: 'Apr 5, 2023',
    status: 'Growing',
    moistureLevel: 72,
    temperature: 26,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2232&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'East Field',
    size: 5.7,
    unit: 'hectares',
    crop: 'Soybeans',
    plantDate: 'Apr 20, 2023',
    status: 'Planting',
    moistureLevel: 45,
    temperature: 22,
    image: 'https://images.unsplash.com/photo-1462782972-a5dd868b5610?q=80&w=2071&auto=format&fit=crop'
  },
  {
    id: '4',
    name: 'West Field',
    size: 7.8,
    unit: 'hectares',
    crop: 'Barley',
    plantDate: 'Mar 25, 2023',
    status: 'Harvesting',
    moistureLevel: 30,
    temperature: 28,
    image: 'https://images.unsplash.com/photo-1625246333195-78d73c0b7024?q=80&w=1770&auto=format&fit=crop'
  }
];

const weatherData = {
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

const crops = [
  {
    name: 'Wheat',
    activeFields: 2,
    totalHectares: 18.3,
    growthProgress: 65,
    plantingDate: 'Mar 15, 2023',
    estimatedHarvest: 'Jul 20, 2023',
    tasks: [
      { name: 'Apply fertilizer', dueDate: 'May 15', completed: true },
      { name: 'Irrigation check', dueDate: 'May 25', completed: false },
      { name: 'Pest control', dueDate: 'Jun 05', completed: false }
    ]
  },
  {
    name: 'Corn',
    activeFields: 1,
    totalHectares: 8.2,
    growthProgress: 45,
    plantingDate: 'Apr 05, 2023',
    estimatedHarvest: 'Aug 10, 2023',
    tasks: [
      { name: 'Weed control', dueDate: 'May 10', completed: true },
      { name: 'Irrigation check', dueDate: 'May 20', completed: true },
      { name: 'Fertilization', dueDate: 'May 30', completed: false }
    ]
  }
];

const metrics = {
  soilMoisture: [
    { name: 'Jan', value: 40 },
    { name: 'Feb', value: 45 },
    { name: 'Mar', value: 55 },
    { name: 'Apr', value: 60 },
    { name: 'May', value: 68 },
    { name: 'Jun', value: 62 },
    { name: 'Jul', value: 58 }
  ],
  temperature: [
    { name: 'Jan', value: 5 },
    { name: 'Feb', value: 7 },
    { name: 'Mar', value: 12 },
    { name: 'Apr', value: 18 },
    { name: 'May', value: 24 },
    { name: 'Jun', value: 28 },
    { name: 'Jul', value: 30 }
  ],
  productivity: [
    { name: 'Field 1', value: 85 },
    { name: 'Field 2', value: 78 },
    { name: 'Field 3', value: 62 },
    { name: 'Field 4', value: 73 }
  ]
};

export function Dashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Your farm at a glance</p>
        </div>
        <Button className="flex items-center gap-1">
          <Locate className="h-4 w-4 mr-1" />
          Create New Field
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card hover-card-effect">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-muted-foreground">Total Fields</p>
              <div className="flex items-baseline space-x-2">
                <h2 className="text-3xl font-bold">4</h2>
                <span className="text-xs text-green-600 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  12%
                </span>
              </div>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <GardenIcon className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card hover-card-effect">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-muted-foreground">Active Crops</p>
              <div className="flex items-baseline space-x-2">
                <h2 className="text-3xl font-bold">3</h2>
                <span className="text-xs text-green-600 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  8%
                </span>
              </div>
            </div>
            <div className="bg-farm-green-light p-3 rounded-full">
              <SeedlingIcon className="h-6 w-6 text-farm-green-dark" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card hover-card-effect">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-muted-foreground">Weather Status</p>
              <div className="flex items-baseline space-x-2">
                <h2 className="text-3xl font-bold">24°C</h2>
                <span className="text-xs text-blue-600">Clear</span>
              </div>
            </div>
            <div className="bg-farm-sky-light p-3 rounded-full">
              <ThermometerSun className="h-6 w-6 text-farm-sky-dark" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">Field Overview</CardTitle>
              <Button variant="ghost" size="sm" className="flex items-center text-sm">
                View All
                <ChevronsRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.slice(0, 4).map((field) => (
                  <FieldCard key={field.id} field={field} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <WeatherWidget data={weatherData} />
          <CropManagement crops={crops} />
        </div>
      </div>
      
      <FieldMetrics metrics={metrics} />
    </div>
  );
}
