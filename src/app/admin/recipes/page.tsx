'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface MenuItem {
  id: string
  name: string
}

interface InventoryItem {
  id: string
  name: string
  unit: string
}

interface Recipe {
  id: string
  quantity: number
  menuItem: MenuItem
  inventoryItem: InventoryItem
}

export default function RecipesPage() {
  const { data: recipes = [], mutate: mutateRecipes } = useSWR<Recipe[]>('/api/recipes', fetcher)
  const { data: menuItems = [] } = useSWR<MenuItem[]>('/api/menu', fetcher)
  const { data: inventoryItems = [] } = useSWR<InventoryItem[]>('/api/inventory', fetcher)

  const [form, setForm] = useState({
    menuItemId: '',
    inventoryItemId: '',
    quantity: '',
  })

  function fetcher(url: string) {
    return fetch(url).then(res => {
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    })
  }

  const addIngredient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.menuItemId || !form.inventoryItemId || !form.quantity) {
      toast.error('Fill all fields')
      return
    }
    if (parseFloat(form.quantity) <= 0) {
      toast.error('Quantity must be positive')
      return
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
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Failed to add ingredient')
        return
      }
      toast.success('Ingredient added to recipe')
      setForm(prev => ({ ...prev, inventoryItemId: '', quantity: '' }))
      await mutateRecipes()
    } catch {
      toast.error('Error occurred while adding ingredient')
    }
  }

  const deleteIngredient = async (id: string) => {
    if (!confirm('Delete this ingredient from recipe?')) return
    try {
      const res = await fetch(`/api/recipes?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error('Failed to delete ingredient')
        return
      }
      toast.success('Ingredient removed')
      await mutateRecipes()
    } catch {
      toast.error('Error deleting ingredient')
    }
  }

  // Group recipes by menu item for display in cards
  const groupedRecipes = recipes.reduce<Record<string, Recipe[]>>((acc, recipe) => {
    if (!acc[recipe.menuItem.id]) acc[recipe.menuItem.id] = []
    acc[recipe.menuItem.id].push(recipe)
    return acc
  }, {})

  return (
    <div className="p-8 bg-blueDark min-h-screen space-y-8">
      <h1 className="text-3xl font-bold text-white">Recipe Management</h1>

      <form onSubmit={addIngredient} className="bg-blueBase p-6 rounded-xl flex flex-wrap gap-4 max-w-xl">
        <select
          value={form.menuItemId}
          onChange={e => setForm(f => ({ ...f, menuItemId: e.target.value }))}
          required
          className="bg-blueDark text-white rounded px-3 py-2 flex-1 min-w-[180px]"
          aria-label="Select Menu Item"
        >
          <option value="" disabled>Select Menu Item</option>
          {menuItems.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
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
          {inventoryItems.map(i => (
            <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
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
          className="rounded px-3 py-2 w-24 bg-blueDark text-white border border-slate-600"
          aria-label="Ingredient Quantity"
        />

        <Button type="submit">Add Ingredient</Button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Object.entries(groupedRecipes).map(([menuItemId, ingredients]) => (
          <div key={menuItemId} className="bg-blueBase rounded-xl p-6 shadow-md flex flex-col">
            <h2 className="text-xl text-white font-semibold mb-4">{ingredients[0].menuItem.name}</h2>
            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
              {ingredients.map(ingredient => (
                <div key={ingredient.id} className="bg-blueDark p-3 rounded shadow flex justify-between items-center">
                  <span className="text-white font-medium">{ingredient.inventoryItem.name}</span>
                  <span className="text-slate-300">{ingredient.quantity} {ingredient.inventoryItem.unit}</span>
                  <Button size="sm" variant="outline" onClick={() => deleteIngredient(ingredient.id)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
