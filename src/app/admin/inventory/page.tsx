'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import useSWR from 'swr'
import { 
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Download
} from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  category: string
  currentStock: number
  minStock: number
  maxStock: number
  unit: string
  costPerUnit: number
  supplier?: string
  lastRestocked?: string
  expiryDate?: string
  createdAt: string
  updatedAt: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  const { data: inventory = [], isLoading, mutate } = useSWR<InventoryItem[]>('/api/admin/inventory', fetcher)

  const categories = ['all', 'proteins', 'vegetables', 'dairy', 'grains', 'spices', 'beverages', 'other']
  const statuses = ['all', 'low-stock', 'out-of-stock', 'well-stocked', 'overstocked']

  const filteredItems = inventory.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    
    let matchesStatus = true
    if (statusFilter === 'low-stock') matchesStatus = item.currentStock <= item.minStock && item.currentStock > 0
    else if (statusFilter === 'out-of-stock') matchesStatus = item.currentStock === 0
    else if (statusFilter === 'well-stocked') matchesStatus = item.currentStock > item.minStock && item.currentStock <= item.maxStock
    else if (statusFilter === 'overstocked') matchesStatus = item.currentStock > item.maxStock
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) return { status: 'out-of-stock', label: 'Out of Stock', color: 'error' }
    if (item.currentStock <= item.minStock) return { status: 'low-stock', label: 'Low Stock', color: 'warning' }
    if (item.currentStock > item.maxStock) return { status: 'overstocked', label: 'Overstocked', color: 'info' }
    return { status: 'well-stocked', label: 'Well Stocked', color: 'success' }
  }

  const totalItems = inventory.length
  const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock && item.currentStock > 0).length
  const outOfStockItems = inventory.filter(item => item.currentStock === 0).length
  const totalValue = inventory.reduce((acc, item) => acc + (item.currentStock * item.costPerUnit), 0)

  const handleUpdateStock = async (itemId: string, newStock: number) => {
    try {
      await fetch(`/api/admin/inventory/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentStock: newStock })
      })
      mutate()
    } catch (error) {
      console.error('Failed to update stock:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[var(--color-background-secondary)] rounded w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-[var(--color-background-secondary)] rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-[var(--color-background-secondary)] rounded-lg"></div>
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
                Inventory Management
              </h1>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-1">
                Track and manage your restaurant's inventory levels
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
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
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
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">{totalItems}</p>
                </div>
                <div className="p-3 bg-[var(--color-primary)]/10 rounded-lg">
                  <Package className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Low Stock</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">{lowStockItems}</p>
                  {lowStockItems > 0 && (
                    <p className="text-xs text-[var(--color-warning)] mt-1">Needs attention</p>
                  )}
                </div>
                <div className="p-3 bg-[var(--color-warning)]/10 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-[var(--color-warning)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Out of Stock</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">{outOfStockItems}</p>
                  {outOfStockItems > 0 && (
                    <p className="text-xs text-[var(--color-error)] mt-1">Critical</p>
                  )}
                </div>
                <div className="p-3 bg-[var(--color-error)]/10 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-[var(--color-error)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Total Value</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">${totalValue.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-[var(--color-success)]/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-[var(--color-success)]" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search inventory..."
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

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>

                {/* View Toggle */}
                <div className="flex rounded-lg border border-[var(--color-border)] p-1 bg-[var(--color-background-secondary)]">
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
                </div>

                {/* Clear Filters */}
                {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'all') && (
                  <Button
                    onClick={() => {
                      setSearchQuery('')
                      setCategoryFilter('all')
                      setStatusFilter('all')
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

        {/* Inventory Display */}
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-[var(--color-background-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-[var(--color-text-muted)]" />
              </div>
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                No inventory items found
              </h3>
              <p className="text-[var(--color-text-secondary)] mb-4">
                {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters' 
                  : 'Start by adding your first inventory item'
                }
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Inventory Item
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'list' ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-background-secondary)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Current Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Cost/Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Total Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {filteredItems.map((item) => {
                    const stockStatus = getStockStatus(item)
                    return (
                      <tr key={item.id} className="hover:bg-[var(--color-background-secondary)] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-[var(--color-text-primary)]">
                            {item.name}
                          </div>
                          {item.supplier && (
                            <div className="text-sm text-[var(--color-text-secondary)]">
                              {item.supplier}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[var(--color-text-primary)] capitalize">
                          {item.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-[var(--color-text-primary)]">
                            {item.currentStock} {item.unit}
                          </div>
                          <div className="text-sm text-[var(--color-text-secondary)]">
                            Min: {item.minStock} | Max: {item.maxStock}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            stockStatus.color === 'success' ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' :
                            stockStatus.color === 'warning' ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]' :
                            stockStatus.color === 'error' ? 'bg-[var(--color-error-bg)] text-[var(--color-error)]' :
                            'bg-[var(--color-info-bg)] text-[var(--color-info)]'
                          }`}>
                            {stockStatus.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-[var(--color-text-primary)]">
                          ${item.costPerUnit.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-[var(--color-primary)]">
                          ${(item.currentStock * item.costPerUnit).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const stockStatus = getStockStatus(item)
              return (
                <Card key={item.id} className="hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-[var(--color-text-primary)] truncate">
                            {item.name}
                          </h3>
                          <p className="text-sm text-[var(--color-text-secondary)] capitalize">
                            {item.category}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          stockStatus.color === 'success' ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' :
                          stockStatus.color === 'warning' ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]' :
                          stockStatus.color === 'error' ? 'bg-[var(--color-error-bg)] text-[var(--color-error)]' :
                          'bg-[var(--color-info-bg)] text-[var(--color-info)]'
                        }`}>
                          {stockStatus.label}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[var(--color-text-secondary)]">Current Stock:</span>
                          <span className="font-medium text-[var(--color-text-primary)]">
                            {item.currentStock} {item.unit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[var(--color-text-secondary)]">Cost/Unit:</span>
                          <span className="font-medium text-[var(--color-text-primary)]">
                            ${item.costPerUnit.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[var(--color-text-secondary)]">Total Value:</span>
                          <span className="font-bold text-[var(--color-primary)]">
                            ${(item.currentStock * item.costPerUnit).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Stock Level Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-[var(--color-text-secondary)]">
                          <span>Min: {item.minStock}</span>
                          <span>Max: {item.maxStock}</span>
                        </div>
                        <div className="w-full bg-[var(--color-background-secondary)] rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              stockStatus.color === 'success' ? 'bg-[var(--color-success)]' :
                              stockStatus.color === 'warning' ? 'bg-[var(--color-warning)]' :
                              stockStatus.color === 'error' ? 'bg-[var(--color-error)]' :
                              'bg-[var(--color-info)]'
                            }`}
                            style={{ 
                              width: `${Math.min(100, (item.currentStock / item.maxStock) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-[var(--color-border)]">
                        <Button variant="outline" size="sm" className="flex-1">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Restock
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}