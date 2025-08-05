'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface MenuItem {
  id: string
  name: string
  category?: string
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
  const { data: recipes = [], mutate: mutateRecipes, error: recipesError } = useSWR<Recipe[]>('/api/recipes', fetcher)
  const { data: menuItems = [], error: menuError } = useSWR<MenuItem[]>('/api/menu', fetcher)
  const { data: inventoryItems = [], error: inventoryError } = useSWR<InventoryItem[]>('/api/inventory', fetcher)

  const [form, setForm] = useState({
    menuItemId: '',
    inventoryItemId: '',
    quantity: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  function fetcher(url: string) {
    return fetch(url).then(res => {
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    })
  }

  const addIngredient = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.menuItemId || !form.inventoryItemId || !form.quantity) {
      toast.error('Please fill all fields')
      return
    }
    
    const quantityNum = parseFloat(form.quantity)
    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast.error('Quantity must be a positive number')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuItemId: form.menuItemId,
          inventoryItemId: form.inventoryItemId,
          quantity: quantityNum,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data?.error || 'Failed to add ingredient')
        return
      }

      toast.success('Ingredient added to recipe')
      setForm(prev => ({ ...prev, inventoryItemId: '', quantity: '' }))
      await mutateRecipes()
    } catch (error) {
      console.error('Error adding ingredient:', error)
      toast.error('Network error occurred while adding ingredient')
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteIngredient = async (id: string, ingredientName: string) => {
    if (!confirm(`Remove ${ingredientName} from recipe?`)) return

    try {
      const res = await fetch(`/api/recipes?id=${id}`, { method: 'DELETE' })
      
      if (!res.ok) {
        const error = await res.json()
        toast.error(error?.error || 'Failed to delete ingredient')
        return
      }
      
      toast.success('Ingredient removed from recipe')
      await mutateRecipes()
    } catch (error) {
      console.error('Error deleting ingredient:', error)
      toast.error('Network error occurred while deleting ingredient')
    }
  }

  // Group recipes by menuItem id safely
  const groupedRecipes = recipes.reduce<Record<string, Recipe[]>>((acc, recipe) => {
    const menuItemId = recipe.menuItem?.id
    if (!menuItemId) return acc
    if (!acc[menuItemId]) acc[menuItemId] = []
    acc[menuItemId].push(recipe)
    return acc
  }, {})

  // Loading states
  if (recipesError || menuError || inventoryError) {
    return (
      <div className="p-8 bg-blueDark min-h-screen">
        <div className="text-red-400">
          Error loading data. Please try refreshing the page.
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-blueDark min-h-screen space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Recipe Management</h1>
        <div className="text-slate-400 text-sm">
          {recipes.length} ingredient{recipes.length !== 1 ? 's' : ''} across {Object.keys(groupedRecipes).length} menu item{Object.keys(groupedRecipes).length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Add Ingredient Form */}
      <form onSubmit={addIngredient} className="bg-blueBase p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Add Ingredient to Recipe</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="menuItemSelect" className="block text-sm font-medium text-slate-300 mb-2">
              Menu Item
            </label>
            <select
              id="menuItemSelect"
              value={form.menuItemId}
              onChange={e => setForm(f => ({ ...f, menuItemId: e.target.value }))}
              required
              className="w-full bg-blueDark text-white rounded px-3 py-2 border border-slate-600 focus:border-accent focus:outline-none"
            >
              <option value="" disabled>Select Menu Item</option>
              {menuItems.map(m => (
                <option key={m.id} value={m.id}>{m.name} {m.category && `(${m.category})`}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="inventoryItemSelect" className="block text-sm font-medium text-slate-300 mb-2">
              Ingredient
            </label>
            <select
              id="inventoryItemSelect"
              value={form.inventoryItemId}
              onChange={e => setForm(f => ({ ...f, inventoryItemId: e.target.value }))}
              required
              className="w-full bg-blueDark text-white rounded px-3 py-2 border border-slate-600 focus:border-accent focus:outline-none"
            >
              <option value="" disabled>Select Ingredient</option>
              {inventoryItems.map(i => (
                <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
              ))}
            </select>
          </div>

          <div className="w-32">
            <label htmlFor="quantityInput" className="block text-sm font-medium text-slate-300 mb-2">
              Quantity
            </label>
            <input
              id="quantityInput"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={form.quantity}
              onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
              required
              className="w-full rounded px-3 py-2 bg-blueDark text-white border border-slate-600 focus:border-accent focus:outline-none"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="px-6">
            {isSubmitting ? 'Adding...' : 'Add Ingredient'}
          </Button>
        </div>
      </form>

      {/* Recipes Display */}
      {Object.keys(groupedRecipes).length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-400 text-lg mb-2">No recipes found</div>
          <div className="text-slate-500 text-sm">Add ingredients to menu items to create recipes</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(groupedRecipes).map(([menuItemId, ingredients]) => (
            <div key={menuItemId} className="bg-blueBase rounded-xl p-6 shadow-lg">
              <div className="mb-4">
                <h2 className="text-xl text-white font-semibold">{ingredients[0].menuItem?.name ?? 'Unknown Menu Item'}</h2>
                {ingredients[0].menuItem?.category && (
                  <div className="text-sm text-slate-400">{ingredients[0].menuItem.category}</div>
                )}
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {ingredients.map(ingredient => (
                  <div key={ingredient.id} className="bg-blueDark p-3 rounded-lg flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-white font-medium">{ingredient.inventoryItem?.name ?? 'Unknown Ingredient'}</div>
                      <div className="text-slate-300 text-sm">{ingredient.quantity} {ingredient.inventoryItem?.unit ?? ''}</div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => deleteIngredient(ingredient.id, ingredient.inventoryItem?.name ?? 'ingredient')}
                      className="ml-2"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
