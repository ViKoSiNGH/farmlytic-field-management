
  const fetchInventory = async () => {
    try {
      // Check session to ensure proper authentication
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error checking session:', sessionError);
        setInventory(getSampleInventoryItems());
        return;
      }
      
      console.log('Fetching available inventory items');
      
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          profiles:user_id(name, email, phone)
        `)
        .eq('available', true)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching inventory:', error);
        setInventory(getSampleInventoryItems());
        return;
      }
      
      if (data) {
        const formattedItems: InventoryItem[] = data.map(item => {
          const sellerProfile = item.profiles || {};
          return {
            id: item.id,
            type: item.type,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            price: item.price || 0,
            sellerId: item.user_id,
            sellerName: sellerProfile.name || 'Unknown Supplier',
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
    }
  };
