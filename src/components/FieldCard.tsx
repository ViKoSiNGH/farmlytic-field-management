
import React from 'react';
import { cn } from '@/lib/utils';
import { CalendarIcon, Droplets, Thermometer, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface FieldCardProps {
  field: {
    id: string;
    name: string;
    size: number;
    unit: string;
    crop: string;
    plantDate: string;
    status: string;
    moistureLevel: number;
    temperature: number;
    image: string;
  };
  className?: string;
  onDelete?: (id: string) => void;
}

export function FieldCard({ field, className, onDelete }: FieldCardProps) {
  // Ensure field has all required properties with default values
  const safeField = {
    id: field?.id || '',
    name: field?.name || 'Unnamed Field',
    size: field?.size || 0,
    unit: field?.unit || 'acres',
    crop: field?.crop || 'Unknown',
    plantDate: field?.plantDate || 'Not set',
    status: field?.status || 'fallow',
    moistureLevel: typeof field?.moistureLevel === 'number' ? field.moistureLevel : 50,
    temperature: typeof field?.temperature === 'number' ? field.temperature : 25,
    image: field?.image || 'https://source.unsplash.com/random/800x600/?farm,field'
  };

  const getStatusColor = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'growing':
        return 'bg-farm-green-light text-farm-green-dark';
      case 'harvesting':
        return 'bg-farm-soil-light text-farm-soil-dark';
      case 'planting':
        return 'bg-blue-100 text-blue-800';
      case 'fallow':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMoistureColor = (level: number) => {
    if (level < 30) return 'text-red-500';
    if (level < 60) return 'text-yellow-500';
    return 'text-farm-sky-dark';
  };

  return (
    <div 
      className={cn(
        "glass-card rounded-2xl overflow-hidden hover-card-effect",
        className
      )}
    >
      <div className="relative h-40 overflow-hidden">
        <img 
          src={safeField.image} 
          alt={safeField.name}
          className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <Badge className={cn("mb-2", getStatusColor(safeField.status))}>
            {safeField.status}
          </Badge>
          <h3 className="text-xl font-semibold text-white">{safeField.name}</h3>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Crop</p>
            <p className="font-medium">{safeField.crop}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Size</p>
            <p className="font-medium">{safeField.size} {safeField.unit}</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center text-sm">
            <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>Planted: {safeField.plantDate}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center text-sm">
              <Droplets className={cn("h-4 w-4 mr-1", getMoistureColor(safeField.moistureLevel))} />
              <span>{safeField.moistureLevel}%</span>
            </div>
            
            <div className="flex items-center text-sm">
              <Thermometer className="h-4 w-4 mr-1 text-red-500" />
              <span>{safeField.temperature}°C</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button variant="ghost" size="sm" className="justify-between group flex-1">
            View Details
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          
          {onDelete && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(safeField.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
