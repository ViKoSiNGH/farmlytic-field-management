
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Droplets, Thermometer, Wind, ArrowUp, ArrowDown } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  Legend
} from 'recharts';

interface FieldMetricsProps {
  metrics: {
    soilMoisture: Array<{ name: string; value: number }>;
    temperature: Array<{ name: string; value: number }>;
    productivity: Array<{ name: string; value: number }>;
  };
  className?: string;
}

export function FieldMetrics({ metrics, className }: FieldMetricsProps) {
  return (
    <Card className={cn("glass-card hover-card-effect", className)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart className="h-5 w-5 mr-2 text-primary" />
          Field Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-muted-foreground">Avg. Soil Moisture</h4>
              <div className="bg-farm-sky-light p-2 rounded-full">
                <Droplets className="h-4 w-4 text-farm-sky-dark" />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-semibold">68%</span>
              <span className="ml-2 text-xs flex items-center text-green-600">
                <ArrowUp className="h-3 w-3 mr-1" />
                4.3%
              </span>
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-muted-foreground">Avg. Temperature</h4>
              <div className="bg-red-100 p-2 rounded-full">
                <Thermometer className="h-4 w-4 text-red-500" />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-semibold">24°C</span>
              <span className="ml-2 text-xs flex items-center text-red-600">
                <ArrowUp className="h-3 w-3 mr-1" />
                1.2°
              </span>
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-muted-foreground">Wind Speed</h4>
              <div className="bg-blue-100 p-2 rounded-full">
                <Wind className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-semibold">12 km/h</span>
              <span className="ml-2 text-xs flex items-center text-red-600">
                <ArrowDown className="h-3 w-3 mr-1" />
                2.1
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-3">Soil Moisture Trends</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.soilMoisture}>
                  <defs>
                    <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7DD3FC" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#7DD3FC" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                      backdropFilter: 'blur(4px)',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#0369A1" 
                    fillOpacity={1}
                    fill="url(#moistureGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-3">Field Productivity Analysis</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={metrics.productivity}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                      backdropFilter: 'blur(4px)',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#4E9F3D" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
