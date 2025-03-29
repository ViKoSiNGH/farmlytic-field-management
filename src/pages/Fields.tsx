
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { FieldCard } from '@/components/FieldCard';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FieldForm } from '@/components/FieldForm';
import { Field } from '@/types/auth';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { adaptFieldToCardProps } from '@/utils/fieldAdapter';

export default function Fields() {
  const [fields, setFields] = useState<Field[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Load fields from localStorage or use default fields if not available
    const savedFields = localStorage.getItem('farmlytic_fields');
    if (savedFields) {
      try {
        const parsedFields = JSON.parse(savedFields);
        setFields(parsedFields);
      } catch (error) {
        console.error('Failed to parse saved fields:', error);
        setFields(getDefaultFields());
      }
    } else {
      setFields(getDefaultFields());
    }
  }, []);

  const getDefaultFields = (): Field[] => {
    const userId = user?.id || '1';
    return [
      {
        id: 'field-1',
        userId,
        name: 'North Field',
        location: '40.7128° N, 74.0060° W',
        size: 15,
        unit: 'acres',
        crops: ['Corn', 'Soybeans'],
        createdAt: new Date('2023-01-15'),
        soilType: 'loam',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&h=800&q=80'
      },
      {
        id: 'field-2',
        userId,
        name: 'South Field',
        location: '40.7118° N, 74.0050° W',
        size: 22,
        unit: 'acres',
        crops: ['Wheat'],
        createdAt: new Date('2023-03-10'),
        soilType: 'clay',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&h=800&q=80'
      }
    ];
  };

  const handleAddField = (newField: Field) => {
    const updatedFields = [...fields, newField];
    setFields(updatedFields);
    localStorage.setItem('farmlytic_fields', JSON.stringify(updatedFields));
    setShowForm(false);
  };

  const handleDelete = (fieldId: string) => {
    const updatedFields = fields.filter(field => field.id !== fieldId);
    setFields(updatedFields);
    localStorage.setItem('farmlytic_fields', JSON.stringify(updatedFields));
    toast({
      title: "Field Deleted",
      description: "The field has been removed."
    });
  };

  const filteredFields = fields.filter(field => 
    field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    field.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    field.soilType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    field.crops.some(crop => crop.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fields</h1>
            <p className="text-muted-foreground">Manage and monitor your farm fields</p>
          </div>
          {isAuthenticated && (
            <Button onClick={() => setShowForm(true)} disabled={showForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          )}
        </div>

        {showForm ? (
          <FieldForm 
            onFieldAdded={handleAddField} 
            onCancel={() => setShowForm(false)} 
          />
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search fields..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredFields.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No fields found. Add your first field to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFields.map((field) => (
                  <FieldCard 
                    key={field.id} 
                    field={adaptFieldToCardProps(field)}
                    onDelete={() => handleDelete(field.id)} 
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
