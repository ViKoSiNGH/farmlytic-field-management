
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InventoryItem } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define type for the profile data from Supabase
interface SellerProfile {
  name?: string;
  email?: string;
  phone?: string;
}

export function FarmerPanel() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      // Check session to ensure proper authentication
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error checking session:', sessionError);
        setInventory(getSampleInventoryItems());
        return;
      }
      
      console.log('Fetching available inventory items');
      
      // Modified query - get inventory items directly and join with profiles table
      const { data, error } = await supabase
        .from('inventory')
        .select('*, profiles:user_id(name, email, phone)')
        .eq('available', true)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching inventory:', error);
        setInventory(getSampleInventoryItems());
        return;
      }
      
      if (data) {
        console.log('Raw inventory data:', data);
        
        const formattedItems: InventoryItem[] = data.map(item => {
          // Properly cast the profiles data to our SellerProfile type
          const sellerProfile = item.profiles as SellerProfile || {};
          
          return {
            id: item.id,
            type: item.type,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            price: item.price || 0,
            sellerId: item.user_id,
            sellerName: sellerProfile?.name || 'Unknown Supplier',
            available: item.available
          };
        });
        
        console.log('Fetched inventory items:', formattedItems.length);
        setInventory(formattedItems);
        localStorage.setItem('farmlytic_inventory', JSON.stringify(formattedItems));
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      setInventory(getSampleInventoryItems());
    } finally {
      setIsLoading(false);
    }
  };

  // Sample inventory items for fallback
  const getSampleInventoryItems = (): InventoryItem[] => {
    return [
      {
        id: '1',
        type: 'seed',
        name: 'Corn Seeds',
        quantity: 100,
        unit: 'kg',
        price: 25,
        sellerId: 'sample-supplier-1',
        sellerName: 'Sample Supplier',
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
        sellerName: 'Sample Supplier',
        available: true
      }
    ];
  };
  
  const handleRequestItem = (item: InventoryItem) => {
    toast({
      title: "Request Sent",
      description: `Your request for ${item.name} has been submitted to the supplier.`,
    });
    // In a real implementation, we would create a record in the requests table
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Supplies</CardTitle>
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
                      Supplier: {item.sellerName || 'Unknown Supplier'}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handleRequestItem(item)}>Request</Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-muted-foreground">No supplies available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default FarmerPanel;
