
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MapPin } from 'lucide-react';
import { Field } from '@/types/auth';

interface FieldFormProps {
  onFieldAdded: (field: Field) => void;
  onCancel: () => void;
}

export function FieldForm({ onFieldAdded, onCancel }: FieldFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: '',
      location: '',
      size: '',
      unit: 'acres',
      soilType: '',
      image: ''
    }
  });

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          const locationString = `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
          form.setValue('location', locationString);
          setCurrentLocation(locationString);
          toast({
            title: "Location Found",
            description: "Your current location has been added to the field."
          });
        },
        error => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Error",
            description: "Could not get your current location. Please enter manually.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Location Error",
        description: "Your browser does not support geolocation. Please enter manually.",
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userId = JSON.parse(localStorage.getItem('farmlytic_user') || '{}').id || '1';
      
      const newField: Field = {
        id: `field-${Date.now()}`,
        userId,
        name: data.name,
        location: data.location,
        size: parseFloat(data.size),
        unit: data.unit as 'acres' | 'hectares',
        crops: [],
        soilType: data.soilType,
        image: data.image || 'https://source.unsplash.com/random/800x600/?farm,field',
        createdAt: new Date()
      };
      
      onFieldAdded(newField);
      
      toast({
        title: "Field Added",
        description: `${data.name} has been added to your fields.`
      });
      
      form.reset();
    } catch (error) {
      console.error('Error adding field:', error);
      toast({
        title: "Error",
        description: "There was an error adding your field. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Add New Field</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter field name" 
                      required 
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-end gap-2">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter location or use current location" 
                        required 
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={getCurrentLocation}
                disabled={isSubmitting}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Use Current
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Field size" 
                        type="number" 
                        required 
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="acres">Acres</SelectItem>
                        <SelectItem value="hectares">Hectares</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="soilType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Soil Type</FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select soil type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="clay">Clay</SelectItem>
                      <SelectItem value="silt">Silt</SelectItem>
                      <SelectItem value="sand">Sandy</SelectItem>
                      <SelectItem value="loam">Loam</SelectItem>
                      <SelectItem value="chalk">Chalk</SelectItem>
                      <SelectItem value="peat">Peat</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter image URL" 
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Field'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
