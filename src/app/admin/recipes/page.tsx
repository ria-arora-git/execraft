'use client';

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface MenuItem {
  id: string;
  name: string;
}

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
}

interface Recipe {
  id: string;
  quantity: number;
  menuItem: MenuItem;
  inventoryItem: InventoryItem;
}

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
});

export default function RecipesPage() {
  // Fetch all recipes with included menuItem and inventoryItem info
  const { data: recipes = [], mutate: mutateRecipes } = useSWR<Recipe[]>('/api/recipes', fetcher);

  // Fetch menu items and inventory items for selection dropdowns in form
  const { data: menuItems = [] } = useSWR<MenuItem[]>('/api/menu', fetcher);
  const { data: inventoryItems = [] } = useSWR<InventoryItem[]>('/api/inventory', fetcher);

  const [form, setForm] = useState({
    menuItemId: '',
    inventoryItemId: '',
    quantity: '',
  });

  // Group recipes by menu item for easier rendering by cards
  const groupedRecipes = recipes.reduce<Record<string, Recipe[]>>((acc, recipe) => {
    if (!acc[recipe.menuItem.id]) {
      acc[recipe.menuItem.id] = [];
    }
    acc[recipe.menuItem.id].push(recipe);
    return acc;
  }, {});

  // Only include menu items that have ingredients (i.e., appear in groupedRecipes)
  const menuItemIdsWithIngredients = new Set(Object.keys(groupedRecipes));

  // Recipe addition handler
  const addIngredient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.menuItemId || !form.inventoryItemId || !form.quantity) {
      toast.error('Please fill all fields');
      return;
    }
    if (parseFloat(form.quantity) <= 0) {
      toast.error('Quantity must be positive');
      return;
    }
  
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuItemId: form.menuItemId,
          inventoryItemId: form.inventoryItemId,
          quantity: parseFloat(form.quantity),
        }),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to add ingredient');
        return;
      }
  
      toast.success('Ingredient added!');
      // Reset the ingredient field but keep the menuItem selected for convenience
      setForm(f => ({ ...f, inventoryItemId: '', quantity: '' }));
      await mutateRecipes();
    } catch {
      toast.error('Error occurred while adding ingredient');
    }
  };

  // Remove ingredient handler
  const removeIngredient = async (id: string) => {
    if (!confirm('Are you sure you want to remove this ingredient?')) return;

    try {
      const res = await fetch(`/api/recipes?id=${id}`, { method: 'DELETE' });

      if (!res.ok) {
        toast.error('Failed to remove ingredient');
        return;
      }

      toast.success('Ingredient removed');
      await mutateRecipes();
    } catch {
      toast.error('Error occurred while removing ingredient');
    }
  };

  return (
    <div className="p-8 bg-blueDark min-h-screen space-y-8">
      <h1 className="text-3xl font-bold text-white">Recipe Management</h1>

      {/* Form for adding ingredients */}
      <form onSubmit={addIngredient} className="bg-blueBase p-6 rounded-xl flex flex-wrap gap-4">
        <select
          value={form.menuItemId}
          onChange={e => setForm(f => ({ ...f, menuItemId: e.target.value }))}
          required
          className="bg-blueDark text-white rounded px-3 py-2 flex-1 min-w-[180px]"
          aria-label="Select Menu Item"
        >
          <option value="" disabled>Select Menu Item</option>
          {menuItems.map(mi => (
            <option key={mi.id} value={mi.id}>{mi.name}</option>
          ))}
        </select>

        <select
          value={form.inventoryItemId}
          onChange={e => setForm(f => ({ ...f, inventoryItemId: e.target.value }))}
          required
          className="bg-blueDark text-white rounded px-3 py-2 flex-1 min-w-[180px]"
          aria-label="Select Ingredient"
        >
          <option value="" disabled>Select Ingredient</option>
          {inventoryItems.map(ii => (
            <option key={ii.id} value={ii.id}>
              {ii.name} ({ii.unit})
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Quantity"
          value={form.quantity}
          onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
          required
          aria-label="Ingredient Quantity"
          className="rounded px-3 py-2 w-24 bg-blueDark text-white border border-slate-600"
        />

        <Button type="submit" className="whitespace-nowrap">Add Ingredient</Button>
      </form>

      {/* Grid showing recipes grouped by menu item */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {menuItems
          .filter(mi => menuItemIdsWithIngredients.has(mi.id))
          .map(mi => (
            <div key={mi.id} className="bg-blueBase rounded-xl p-6 flex flex-col shadow-md min-h-[220px]">
              <h2 className="text-xl text-white font-semibold mb-4">{mi.name}</h2>

              <div className="flex flex-col gap-3 overflow-auto max-h-[320px]">
                {groupedRecipes[mi.id].map(recipe => (
                  <div key={recipe.id} className="bg-blueDark p-3 rounded shadow flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">{recipe.inventoryItem.name}</div>
                      <div className="text-sm text-slate-400">
                        Quantity: {recipe.quantity} {recipe.inventoryItem.unit}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => removeIngredient(recipe.id)} aria-label={`Remove ${recipe.inventoryItem.name}`}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
