
  const loadInventory = async () => {
    try {
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
    }
  };
