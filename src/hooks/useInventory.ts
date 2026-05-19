import { useState, useEffect } from "react";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      if (data.items) setItems(data.items);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const saveItem = async (item: { id?: string; name: string; quantity: number }) => {
    try {
      const url = item.id ? `/api/inventory/${item.id}` : "/api/inventory";
      const method = item.id ? "PUT" : "POST";
      
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: item.name, quantity: item.quantity }),
      });
      
      await fetchInventory();
      return { success: true };
    } catch (error) {
      console.error("Save error:", error);
      return { success: false, error };
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      await fetchInventory();
      return { success: true };
    } catch (error) {
      console.error("Delete error:", error);
      return { success: false, error };
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return {
    items: filteredItems,
    loading,
    search,
    setSearch,
    saveItem,
    deleteItem,
    refresh: fetchInventory
  };
}
