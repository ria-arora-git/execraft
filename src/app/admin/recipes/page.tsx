
'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
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
      <div className="p-4 sm:p-8 bg-background min-h-screen">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-error mb-4">Error Loading Data</h2>
          <p className="text-text-secondary">Error loading data. Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 bg-background min-h-screen space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">Recipe Management</h1>
          <p className="text-text-secondary mt-1">
            {recipes.length} ingredient{recipes.length !== 1 ? 's' : ''} across {Object.keys(groupedRecipes).length} menu item{Object.keys(groupedRecipes).length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Add Ingredient Form */}
      <Card className="card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-text">Add Ingredient to Recipe</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addIngredient} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="menuItemSelect" className="form-label">
                  Menu Item
                </label>
                <select
                  id="menuItemSelect"
                  value={form.menuItemId}
                  onChange={e => setForm(f => ({ ...f, menuItemId: e.target.value }))}
                  required
                  className="form-control"
                >
                  <option value="" disabled>Select Menu Item</option>
                  {menuItems.map(m => (
                    <option key={m.id} value={m.id}>{m.name} {m.category && `(${m.category})`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="inventoryItemSelect" className="form-label">
                  Ingredient
                </label>
                <select
                  id="inventoryItemSelect"
                  value={form.inventoryItemId}
                  onChange={e => setForm(f => ({ ...f, inventoryItemId: e.target.value }))}
                  required
                  className="form-control"
                >
                  <option value="" disabled>Select Ingredient</option>
                  {inventoryItems.map(i => (
                    <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="quantityInput" className="form-label">
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
                  className="form-control"
                />
              </div>
            </div>
            
            <Button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Adding...' : 'Add Ingredient'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recipes Display */}
      {Object.keys(groupedRecipes).length === 0 ? (
        <Card className="card">
          <CardContent className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-text mb-2">No Recipes Found</h3>
            <p className="text-text-secondary">Add ingredients to menu items to create recipes</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(groupedRecipes).map(([menuItemId, ingredients]) => (
            <Card key={menuItemId} className="card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-text">
                  {ingredients[0].menuItem?.name ?? 'Unknown Menu Item'}
                </CardTitle>
                {ingredients[0].menuItem?.category && (
                  <p className="text-text-secondary text-sm capitalize">{ingredients[0].menuItem.category}</p>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {ingredients.map(ingredient => (
                    <div key={ingredient.id} className="bg-secondary p-3 rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-text font-medium">{ingredient.inventoryItem?.name ?? 'Unknown Ingredient'}</div>
                        <div className="text-text-secondary text-sm">{ingredient.quantity} {ingredient.inventoryItem?.unit ?? ''}</div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => deleteIngredient(ingredient.id, ingredient.inventoryItem?.name ?? 'ingredient')}
                        className="ml-2 text-error border-error hover:bg-error hover:text-error-foreground"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
