
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, Clock, SeedlingIcon, Sprout } from 'lucide-react';

interface CropData {
  name: string;
  activeFields: number;
  totalHectares: number;
  growthProgress: number;
  plantingDate: string;
  estimatedHarvest: string;
  tasks: Array<{
    name: string;
    dueDate: string;
    completed: boolean;
  }>;
}

interface CropManagementProps {
  crops: CropData[];
  className?: string;
}

export function CropManagement({ crops, className }: CropManagementProps) {
  return (
    <Card className={cn("glass-card hover-card-effect", className)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <SeedlingIcon className="h-5 w-5 mr-2 text-primary" />
          Crop Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="current" className="flex-1">Current Crops</TabsTrigger>
            <TabsTrigger value="upcoming" className="flex-1">Upcoming</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="space-y-4">
            {crops.map((crop, index) => (
              <div key={index} className="border border-border rounded-lg p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium flex items-center">
                    <Sprout className="h-4 w-4 mr-2 text-farm-green" />
                    {crop.name}
                  </h3>
                  <Badge variant="outline" className="bg-farm-green-light text-farm-green-dark">
                    {crop.activeFields} fields
                  </Badge>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Growth Progress</span>
                    <span className="font-medium">{crop.growthProgress}%</span>
                  </div>
                  <Progress value={crop.growthProgress} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span className="text-muted-foreground">Planted:</span>
                    <span className="font-medium ml-1">{crop.plantingDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span className="text-muted-foreground">Harvest:</span>
                    <span className="font-medium ml-1">{crop.estimatedHarvest}</span>
                  </div>
                </div>
                
                <div className="text-sm">
                  <p className="font-medium mb-2">Upcoming Tasks</p>
                  <ul className="space-y-1">
                    {crop.tasks.map((task, taskIndex) => (
                      <li key={taskIndex} className="flex items-center">
                        <CheckCircle className={cn(
                          "h-3 w-3 mr-2",
                          task.completed ? "text-farm-green" : "text-muted-foreground"
                        )} />
                        <span className={task.completed ? "line-through opacity-70" : ""}>
                          {task.name} - {task.dueDate}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="upcoming">
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No upcoming crops scheduled.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="completed">
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No completed crop cycles to display.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
