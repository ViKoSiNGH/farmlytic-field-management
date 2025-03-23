
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { FieldCard } from '@/components/FieldCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Locate, Plus, Search } from 'lucide-react';

// Sample data for demonstration
const initialFields = [
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

interface FieldFormValues {
  name: string;
  size: number;
  unit: string;
  crop: string;
  status: string;
  imageUrl: string;
}

export default function Fields() {
  const [fields, setFields] = useState(initialFields);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FieldFormValues>({
    defaultValues: {
      name: '',
      size: 0,
      unit: 'hectares',
      crop: '',
      status: 'Planting',
      imageUrl: ''
    },
  });

  const onSubmit = (data: FieldFormValues) => {
    const newField = {
      id: (fields.length + 1).toString(),
      name: data.name,
      size: data.size,
      unit: data.unit,
      crop: data.crop,
      plantDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: data.status,
      moistureLevel: Math.floor(Math.random() * 30) + 40, // Random value between 40-70
      temperature: Math.floor(Math.random() * 10) + 20, // Random value between 20-30
      image: data.imageUrl || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2232&auto=format&fit=crop'
    };
    
    setFields([...fields, newField]);
    setIsDialogOpen(false);
    form.reset();
    
    toast({
      title: "Field Created",
      description: `${data.name} has been added to your fields.`,
    });
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
    toast({
      title: "Field Removed",
      description: "The field has been removed from your dashboard.",
    });
  };

  const filteredFields = fields.filter(field => 
    field.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    field.crop.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fields</h1>
            <p className="text-muted-foreground">Manage your agricultural fields</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4 mr-1" />
                Add New Field
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Field</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field Name</FormLabel>
                        <FormControl>
                          <Input placeholder="North Field" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Size</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="10.5" 
                              {...field} 
                              onChange={e => field.onChange(parseFloat(e.target.value))} 
                              required 
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
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hectares">Hectares</SelectItem>
                              <SelectItem value="acres">Acres</SelectItem>
                              <SelectItem value="sqm">Square Meters</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="crop"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Crop Type</FormLabel>
                          <FormControl>
                            <Input placeholder="Wheat" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Planting">Planting</SelectItem>
                              <SelectItem value="Growing">Growing</SelectItem>
                              <SelectItem value="Harvesting">Harvesting</SelectItem>
                              <SelectItem value="Fallow">Fallow</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Locate className="h-4 w-4 mr-2" />
                      Create Field
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="relative max-w-md mx-auto md:mx-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search fields by name or crop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFields.length > 0 ? (
            filteredFields.map((field) => (
              <div key={field.id} className="relative">
                <FieldCard field={field} />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity z-10"
                  onClick={() => handleRemoveField(field.id)}
                >
                  Remove
                </Button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No fields match your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
