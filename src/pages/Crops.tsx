import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SeedlingIcon } from '@/components/GardenIcon';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Crop {
  id: string;
  name: string;
  activeFields: number;
  totalHectares: number;
  growthProgress: number;
  plantingDate: string;
  estimatedHarvest: string;
  tasks: {
    name: string;
    dueDate: string;
    completed: boolean;
  }[];
}

interface CropFormValues {
  name: string;
  activeFields: number;
  totalHectares: number;
  growthProgress: number;
  plantingDate: string;
  estimatedHarvest: string;
  task1: string;
  task1DueDate: string;
  task2: string;
  task2DueDate: string;
}

interface TaskFormValues {
  cropIndex: number;
  task: string;
  dueDate: string;
}

export default function Crops() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedCropIndex, setSelectedCropIndex] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<CropFormValues>({
    defaultValues: {
      name: '',
      activeFields: 1,
      totalHectares: 0,
      growthProgress: 0,
      plantingDate: '',
      estimatedHarvest: '',
      task1: '',
      task1DueDate: '',
      task2: '',
      task2DueDate: '',
    },
  });

  const taskForm = useForm<TaskFormValues>({
    defaultValues: {
      cropIndex: 0,
      task: '',
      dueDate: '',
    },
  });

  useEffect(() => {
    fetchCrops();
  }, [user]);

  const fetchCrops = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching crops from Supabase:', error);
        const savedCrops = localStorage.getItem('farmlytic_crops');
        if (savedCrops) {
          try {
            setCrops(JSON.parse(savedCrops));
          } catch (e) {
            console.error('Failed to parse saved crops:', e);
            setCrops(getSampleCrops());
          }
        } else {
          setCrops(getSampleCrops());
        }
      } else if (data && data.length > 0) {
        const fetchedCrops: Crop[] = data.map(cropData => ({
          id: cropData.id,
          name: cropData.name,
          activeFields: 1,
          totalHectares: 10,
          growthProgress: 0,
          plantingDate: cropData.planted_date || new Date().toISOString().split('T')[0],
          estimatedHarvest: cropData.expected_harvest_date || new Date().toISOString().split('T')[0],
          tasks: []
        }));
        setCrops(fetchedCrops);
      } else {
        setCrops(getSampleCrops());
      }
    } catch (error) {
      console.error('Failed to fetch crops:', error);
      setCrops(getSampleCrops());
    }
  };

  const getSampleCrops = (): Crop[] => {
    return [
      {
        id: 'crop1',
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
        id: 'crop2',
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
  };

  const onSubmit = async (data: CropFormValues) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add crops.",
        variant: "destructive"
      });
      return;
    }

    const tasks = [
      { 
        name: data.task1, 
        dueDate: data.task1DueDate, 
        completed: false 
      }
    ];
    
    if (data.task2 && data.task2DueDate) {
      tasks.push({ 
        name: data.task2, 
        dueDate: data.task2DueDate, 
        completed: false 
      });
    }
    
    const newCrop = {
      id: `crop-${Date.now()}`,
      name: data.name,
      activeFields: data.activeFields,
      totalHectares: data.totalHectares,
      growthProgress: data.growthProgress,
      plantingDate: data.plantingDate,
      estimatedHarvest: data.estimatedHarvest,
      tasks: tasks
    };

    try {
      const { data: supabaseData, error } = await supabase
        .from('crops')
        .insert([{
          user_id: user.id,
          name: newCrop.name,
          planted_date: newCrop.plantingDate,
          expected_harvest_date: newCrop.estimatedHarvest,
          status: 'growing',
          notes: `Fields: ${newCrop.activeFields}, Hectares: ${newCrop.totalHectares}, Progress: ${newCrop.growthProgress}%`
        }])
        .select();

      if (error) {
        console.error('Error saving crop to Supabase:', error);
      } else if (supabaseData && supabaseData.length > 0) {
        newCrop.id = supabaseData[0].id;
      }
    } catch (error) {
      console.error('Failed to save crop to Supabase:', error);
    }
    
    const updatedCrops = [...crops, newCrop];
    setCrops(updatedCrops);
    localStorage.setItem('farmlytic_crops', JSON.stringify(updatedCrops));
    
    setIsDialogOpen(false);
    form.reset();
    
    toast({
      title: "Crop Added",
      description: `${data.name} has been added to your crops.`,
    });
  };

  const onTaskSubmit = (data: TaskFormValues) => {
    const updatedCrops = [...crops];
    updatedCrops[data.cropIndex].tasks.push({
      name: data.task,
      dueDate: data.dueDate,
      completed: false
    });
    
    setCrops(updatedCrops);
    localStorage.setItem('farmlytic_crops', JSON.stringify(updatedCrops));
    setIsTaskDialogOpen(false);
    taskForm.reset();
    
    toast({
      title: "Task Added",
      description: `New task added to ${crops[data.cropIndex].name}.`,
    });
  };

  const handleRemoveCrop = async (index: number) => {
    const cropToRemove = crops[index];
    const updatedCrops = [...crops];
    updatedCrops.splice(index, 1);
    
    if (user) {
      try {
        const { error } = await supabase
          .from('crops')
          .delete()
          .eq('id', cropToRemove.id);
          
        if (error) {
          console.error('Error removing crop from Supabase:', error);
        }
      } catch (error) {
        console.error('Failed to remove crop from Supabase:', error);
      }
    }
    
    setCrops(updatedCrops);
    localStorage.setItem('farmlytic_crops', JSON.stringify(updatedCrops));
    
    toast({
      title: "Crop Removed",
      description: "The crop has been removed from your dashboard.",
    });
  };

  const toggleTaskCompletion = (cropIndex: number, taskIndex: number) => {
    const updatedCrops = [...crops];
    updatedCrops[cropIndex].tasks[taskIndex].completed = !updatedCrops[cropIndex].tasks[taskIndex].completed;
    setCrops(updatedCrops);
    localStorage.setItem('farmlytic_crops', JSON.stringify(updatedCrops));
  };

  const removeTask = (cropIndex: number, taskIndex: number) => {
    const updatedCrops = [...crops];
    updatedCrops[cropIndex].tasks.splice(taskIndex, 1);
    setCrops(updatedCrops);
    localStorage.setItem('farmlytic_crops', JSON.stringify(updatedCrops));
    
    toast({
      title: "Task Removed",
      description: "The task has been removed.",
    });
  };

  const filteredCrops = crops.filter(crop => 
    crop.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crops</h1>
            <p className="text-muted-foreground">Manage your crops and related tasks</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4 mr-1" />
                Add New Crop
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Add New Crop</DialogTitle>
              </DialogHeader>
              
              <ScrollArea className="max-h-[70vh] overflow-y-auto pr-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Crop Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Wheat" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="activeFields"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Active Fields</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="1" 
                                {...field} 
                                onChange={e => field.onChange(parseInt(e.target.value) || 1)} 
                                required 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="totalHectares"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Hectares</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="10.5" 
                                {...field} 
                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                                required 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="growthProgress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Growth Progress (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="50" 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                              required 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="plantingDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Planting Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} required />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="estimatedHarvest"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Harvest</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} required />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Initial Tasks</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="task1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Task 1</FormLabel>
                              <FormControl>
                                <Input placeholder="Apply fertilizer" {...field} required />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="task1DueDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Due Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} required />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="task2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Task 2 (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Pest control" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="task2DueDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Due Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Add Crop</Button>
                    </div>
                  </form>
                </Form>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="relative max-w-md mx-auto md:mx-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search crops by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCrops.length > 0 ? (
            filteredCrops.map((crop, index) => (
              <Card key={crop.id} className="glass-card hover-card-effect relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center text-xl">
                    <SeedlingIcon className="h-5 w-5 mr-2 text-primary" />
                    {crop.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    onClick={() => handleRemoveCrop(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Active Fields</p>
                        <p className="font-medium">{crop.activeFields}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Hectares</p>
                        <p className="font-medium">{crop.totalHectares}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Planted</p>
                        <p className="font-medium">{crop.plantingDate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Harvest</p>
                        <p className="font-medium">{crop.estimatedHarvest}</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Tasks</h4>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() => {
                            setSelectedCropIndex(index);
                            taskForm.setValue('cropIndex', index);
                            setIsTaskDialogOpen(true);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Task
                        </Button>
                      </div>
                      <ul className="space-y-2">
                        {crop.tasks.map((task, taskIndex) => (
                          <li 
                            key={taskIndex} 
                            className="flex items-center justify-between bg-background/50 rounded-md p-2 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTaskCompletion(index, taskIndex)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <span className={task.completed ? "line-through opacity-70" : ""}>
                                {task.name} - {task.dueDate}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                              onClick={() => removeTask(index, taskIndex)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </li>
                        ))}
                        {crop.tasks.length === 0 && (
                          <li className="text-center text-muted-foreground text-sm py-2">
                            No tasks yet. Add a task to get started.
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No crops match your search criteria.</p>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          
          <Form {...taskForm}>
            <form onSubmit={taskForm.handleSubmit(onTaskSubmit)} className="space-y-4 pt-4">
              <FormField
                control={taskForm.control}
                name="task"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Apply fertilizer" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={taskForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input placeholder="May 15" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsTaskDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Task</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
