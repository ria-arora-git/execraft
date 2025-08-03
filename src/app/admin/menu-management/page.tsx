'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
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

  if (loading) return <div className="p-8 text-white text-center">Loading menu items...</div>

  return (
    <div className="p-8 bg-blueDark min-h-screen space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Menu Management</h1>
        <Button onClick={() => setShowForm(true)} aria-label="Add New Menu Item">
          Add New Menu Item
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 bg-blueBase p-4 rounded-xl">
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 rounded border border-slate-600 text-white bg-blueDark focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Search menu items"
        />
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-4 py-2 rounded border border-slate-600 text-white bg-blueDark focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Filter by category"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Items Table */}
      <div className="bg-blueBase rounded-xl overflow-hidden">
        <table className="w-full text-white">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Name & Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Price ($)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Prep Time (mins)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-slate-400">
                  No menu items found.
                </td>
              </tr>
            ) : (
              filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-800">
                  <td className="px-6 py-4 whitespace-normal">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-slate-400 text-sm">{item.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-accent font-semibold">
                    {item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                    {item.prepTime ?? '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(item)} aria-label={`Edit ${item.name}`}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteMenuItem(item.id)} aria-label={`Delete ${item.name}`}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-blueBase rounded-xl p-8 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2 rounded border border-slate-600 bg-blueDark text-white focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Menu Item Name"
              />
              <textarea
                required
                placeholder="Description"
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-4 py-2 rounded border border-slate-600 bg-blueDark text-white focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                aria-label="Menu Item Description"
              />
              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="Price"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full px-4 py-2 rounded border border-slate-600 bg-blueDark text-white focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Menu Item Price"
              />
              <input
                type="number"
                min="0"
                placeholder="Prep Time (minutes)"
                value={form.prepTime}
                onChange={e => setForm(f => ({ ...f, prepTime: e.target.value }))}
                className="w-full px-4 py-2 rounded border border-slate-600 bg-blueDark text-white focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Menu Item Prep Time"
              />
              <input
                type="text"
                required
                placeholder="Category"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-4 py-2 rounded border border-slate-600 bg-blueDark text-white focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Menu Item Category"
              />
              <input
                type="url"
                placeholder="Image URL (optional)"
                value={form.image}
                onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                className="w-full px-4 py-2 rounded border border-slate-600 bg-blueDark text-white focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Menu Item Image URL"
              />
              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
