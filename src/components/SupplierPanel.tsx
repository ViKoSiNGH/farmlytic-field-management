
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InventoryItem } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export function SupplierPanel() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadInventory();
    }
  }, [user]);

  const loadInventory = async () => {
    try {
      setIsLoading(true);
      if (!user?.id) {
        console.error('User not authenticated or missing ID');
        setInventory(getInventorySamples());
        return;
      }
      
      // Check session to ensure proper authentication
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error checking session:', sessionError);
        setInventory(getInventorySamples());
        return;
      }
      
      console.log('Fetching inventory for user:', user.id);
      
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching inventory:', error);
        
        const savedInventory = localStorage.getItem('farmlytic_supplier_inventory');
        if (savedInventory) {
          try {
            const parsedInventory: InventoryItem[] = JSON.parse(savedInventory);
            setInventory(parsedInventory);
          } catch (err) {
            console.error('Error parsing saved inventory:', err);
            setInventory(getInventorySamples());
          }
        } else {
          setInventory(getInventorySamples());
        }
        return;
      }
      
      const mappedInventory: InventoryItem[] = data.map(item => ({
        id: item.id,
        type: item.type,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price || 0,
        sellerId: item.user_id,
        available: item.available
      }));
      
      console.log('Fetched inventory items:', mappedInventory.length);
      setInventory(mappedInventory);
      localStorage.setItem('farmlytic_supplier_inventory', JSON.stringify(mappedInventory));
    } catch (error) {
      console.error('Error in loadInventory:', error);
      setInventory(getInventorySamples());
    } finally {
      setIsLoading(false);
    }
  };

  // Sample inventory items for fallback
  const getInventorySamples = (): InventoryItem[] => {
    return [
      {
        id: '1',
        type: 'seed',
        name: 'Corn Seeds',
        quantity: 100,
        unit: 'kg',
        price: 25,
        sellerId: 'sample-supplier-1',
        available: true
      },
      {
        id: '2',
        type: 'fertilizer',
        name: 'Organic Fertilizer',
        quantity: 50,
        unit: 'bags',
        price: 30,
        sellerId: 'sample-supplier-1',
        available: true
      }
    ];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : inventory.length > 0 ? (
            <div className="space-y-4">
              {inventory.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} {item.unit} - ${item.price} per {item.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.available ? 'Available' : 'Not Available'}
                    </p>
                  </div>
                  <Button size="sm" variant={item.available ? "default" : "outline"}>
                    {item.available ? 'Mark Unavailable' : 'Make Available'}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-muted-foreground">No inventory items yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SupplierPanel;
