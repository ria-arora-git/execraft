'use client'
export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import toast from 'react-hot-toast'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  prepTime?: number
  image?: string | null
}

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    prepTime: '',
    image: ''
  })

  useEffect(() => {
    fetchMenuItems()
  }, [])

  async function fetchMenuItems() {
    try {
      const res = await fetch('/api/menu')
      if (!res.ok) throw new Error('Failed to fetch menu items')
      const data = await res.json()
      setMenuItems(data)
    } catch {
      toast.error('Error fetching menu items')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      category: '',
      prepTime: '',
      image: ''
    })
    setEditingItem(null)
    setShowForm(false)
  }

  const startEdit = (item: MenuItem) => {
    setEditingItem(item)
    setForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      prepTime: item.prepTime?.toString() || '',
      image: item.image || ''
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.name.trim() || !form.description.trim() || !form.category.trim() || isNaN(parseFloat(form.price)) || (form.prepTime && isNaN(parseInt(form.prepTime)))) {
      toast.error('Please fill all required fields correctly')
      return
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      category: form.category.trim(),
      prepTime: form.prepTime ? parseInt(form.prepTime) : undefined,
      image: form.image.trim() || null
    }

    try {
      const url = editingItem ? `/api/menu/${editingItem.id}` : '/api/menu'
      const method = editingItem ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Failed to save menu item')
        return
      }

      toast.success(editingItem ? 'Menu item updated' : 'Menu item created')
      resetForm()
      await fetchMenuItems()
    } catch {
      toast.error('Error saving menu item')
    }
  }

  async function deleteMenuItem(id: string) {
    if (!confirm('Are you sure you want to delete this menu item?')) return

    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Failed to delete menu item')
        return
      }
      toast.success('Menu item deleted')
      await fetchMenuItems()
    } catch {
      toast.error('Error deleting menu item')
    }
  }

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))]

  const filteredItems = menuItems.filter(item =>
    (selectedCategory === 'All' || item.category === selectedCategory) &&
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="p-4 sm:p-8 bg-background min-h-screen">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 bg-background min-h-screen space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">Menu Management</h1>
          <p className="text-text-secondary mt-1">Manage your restaurant's menu items</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          aria-label="Add New Menu Item"
          className="btn-primary w-full sm:w-auto"
        >
          Add New Menu Item
        </Button>
      </div>

      {/* Search & Filter */}
      <Card className="card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="form-control"
                aria-label="Search menu items"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="form-control w-full sm:w-48"
              aria-label="Filter by category"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <Card className="card">
          <CardContent className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-text mb-2">No Menu Items Found</h3>
            <p className="text-text-secondary">
              {searchTerm || selectedCategory !== 'All' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first menu item to get started.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <Card key={item.id} className="card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-text flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <h3 className="font-semibold truncate">{item.name}</h3>
                    <div className="text-sm text-text-secondary mt-1 capitalize">
                      {item.category}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-primary">
                    ${item.price.toFixed(2)}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-text-secondary text-sm line-clamp-3">
                  {item.description}
                </p>
                
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>Prep Time: {item.prepTime ? `${item.prepTime} mins` : 'Not set'}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(item)}
                    aria-label={`Edit ${item.name}`}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => deleteMenuItem(item.id)}
                    aria-label={`Delete ${item.name}`}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <Card className="card max-w-md w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-text">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="form-control"
                    aria-label="Menu Item Name"
                  />
                </div>

                <div>
                  <label className="form-label">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="form-control resize-none"
                    aria-label="Menu Item Description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Price *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      className="form-control"
                      aria-label="Menu Item Price"
                    />
                  </div>

                  <div>
                    <label className="form-label">Prep Time (mins)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.prepTime}
                      onChange={e => setForm(f => ({ ...f, prepTime: e.target.value }))}
                      className="form-control"
                      aria-label="Menu Item Prep Time"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Category *</label>
                  <input
                    type="text"
                    required
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="form-control"
                    aria-label="Menu Item Category"
                  />
                </div>

                <div>
                  <label className="form-label">Image URL (optional)</label>
                  <input
                    type="url"
                    value={form.image}
                    onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    className="form-control"
                    aria-label="Menu Item Image URL"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" className="btn-primary">
                    {editingItem ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}