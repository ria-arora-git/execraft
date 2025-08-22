'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import useSWR from 'swr'
import { useOrganization } from '@clerk/nextjs'
import { 
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  ChefHat,
  DollarSign,
  Clock,
  Users,
  Star,
  MoreVertical
} from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
})

interface MenuItemIngredient {
  id: string
  ingredient: {
    name: string
  }
  quantity: number
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  prepTime?: number
  image?: string
  ingredients: MenuItemIngredient[]
  createdAt: string
  updatedAt: string
}

export default function MenuManagementPage() {
  const { organization } = useOrganization()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { data: menuItems = [], isLoading, mutate } = useSWR<MenuItem[]>(
    organization ? `/api/menu?organizationId=${organization.id}` : null,
    fetcher
  )

  const categories = ['all', 'appetizers', 'mains', 'desserts', 'beverages', 'specials']

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return
    
    try {
      const response = await fetch(`/api/menu/${itemId}`, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        mutate()
      } else {
        console.error('Failed to delete menu item')
      }
    } catch (error) {
      console.error('Failed to delete menu item:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[var(--color-background-secondary)] rounded w-1/3"></div>
            <div className="h-12 bg-[var(--color-background-secondary)] rounded"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-[var(--color-background-secondary)] rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm">
        <div className="container py-6">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
                Menu Management
              </h1>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-1">
                Manage your restaurant's menu items and categories
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Menu Item
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Total Items</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">{menuItems.length}</p>
                </div>
                <div className="p-3 bg-[var(--color-primary)]/10 rounded-lg">
                  <ChefHat className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Categories</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {new Set(menuItems.map(item => item.category)).size}
                  </p>
                </div>
                <div className="p-3 bg-[var(--color-success)]/10 rounded-lg">
                  <Eye className="w-6 h-6 text-[var(--color-success)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Avg Price</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    ${menuItems.length > 0 ? (menuItems.reduce((acc, item) => acc + item.price, 0) / menuItems.length).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="p-3 bg-[var(--color-accent)]/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-[var(--color-accent)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Avg Prep Time</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {menuItems.length > 0 ? Math.round(menuItems.filter(item => item.prepTime).reduce((acc, item) => acc + (item.prepTime || 0), 0) / menuItems.filter(item => item.prepTime).length) || 0 : 0}m
                  </p>
                </div>
                <div className="p-3 bg-[var(--color-warning)]/10 rounded-lg">
                  <Clock className="w-6 h-6 text-[var(--color-warning)]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>

                {/* View Toggle */}
                <div className="flex rounded-lg border border-[var(--color-border)] p-1 bg-[var(--color-background-secondary)]">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      viewMode === 'list'
                        ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    List
                  </button>
                </div>

                {/* Clear Filters */}
                {(searchQuery || categoryFilter !== 'all') && (
                  <Button
                    onClick={() => {
                      setSearchQuery('')
                      setCategoryFilter('all')
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Menu Items Display */}
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-[var(--color-background-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-8 h-8 text-[var(--color-text-muted)]" />
              </div>
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                No menu items found
              </h3>
              <p className="text-[var(--color-text-secondary)] mb-4">
                {searchQuery || categoryFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Start by adding your first menu item'
                }
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Menu Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-all duration-200">
                {viewMode === 'grid' ? (
                  <CardContent className="p-6">
                    <div className="aspect-w-16 aspect-h-9 bg-[var(--color-background-secondary)] rounded-lg mb-4">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center rounded-lg">
                          <ChefHat className="w-8 h-8 text-[var(--color-text-muted)]" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-[var(--color-text-primary)] truncate">
                            {item.name}
                          </h3>
                          <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {item.prepTime || 15}min
                        </div>
                        <div className="text-lg font-bold text-[var(--color-primary)]">
                          ${item.price.toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-[var(--color-border)]">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 min-w-0 flex-1">
                        <div className="w-16 h-16 bg-[var(--color-background-secondary)] rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <ChefHat className="w-6 h-6 text-[var(--color-text-muted)]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-[var(--color-text-primary)] truncate">
                            {item.name}
                          </h3>
                          <p className="text-sm text-[var(--color-text-secondary)] line-clamp-1">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-[var(--color-text-secondary)]">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {item.prepTime || 15}min
                            </span>
                            <span className="capitalize">{item.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-[var(--color-primary)]">
                            ${item.price.toFixed(2)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}