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
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Grid,
  List
} from 'lucide-react'

interface Table {
  id: string
  number: number
  capacity: number
  status: 'available' | 'occupied' | 'reserved' | 'cleaning'
  location: string
  shape: 'round' | 'square' | 'rectangle'
  currentOrder?: {
    id: string
    orderNumber: string
    customerName: string
    total: number
    status: string
    createdAt: string
  }
  reservations: {
    id: string
    customerName: string
    partySize: number
    reservationTime: string
    status: string
  }[]
  createdAt: string
  updatedAt: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function TableManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')

  const { data: tables = [], isLoading, mutate } = useSWR<Table[]>('/api/admin/tables', fetcher)

  const statuses = ['all', 'available', 'occupied', 'reserved', 'cleaning']
  const locations = ['all', 'dining-room', 'patio', 'bar', 'private-room', 'window-side']

  const filteredTables = tables.filter(table => {
    const matchesSearch = searchQuery === '' || 
      table.number.toString().includes(searchQuery) ||
      table.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || table.status === statusFilter
    const matchesLocation = locationFilter === 'all' || table.location === locationFilter
    
    return matchesSearch && matchesStatus && matchesLocation
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success'
      case 'occupied': return 'error'
      case 'reserved': return 'warning'
      case 'cleaning': return 'info'
      default: return 'info'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return CheckCircle
      case 'occupied': return Users
      case 'reserved': return Clock
      case 'cleaning': return XCircle
      default: return Users
    }
  }

  const totalTables = tables.length
  const availableTables = tables.filter(table => table.status === 'available').length
  const occupiedTables = tables.filter(table => table.status === 'occupied').length
  const reservedTables = tables.filter(table => table.status === 'reserved').length
  const totalCapacity = tables.reduce((acc, table) => acc + table.capacity, 0)

  const updateTableStatus = async (tableId: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/tables/${tableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      mutate()
    } catch (error) {
      console.error('Failed to update table status:', error)
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-40 bg-[var(--color-background-secondary)] rounded-lg"></div>
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
                Table Management
              </h1>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-1">
                Manage your restaurant's table layout and availability
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
                Add Table
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
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Total Tables</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">{totalTables}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">{totalCapacity} total seats</p>
                </div>
                <div className="p-3 bg-[var(--color-primary)]/10 rounded-lg">
                  <Grid className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Available</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">{availableTables}</p>
                  <p className="text-xs text-[var(--color-success)] mt-1">Ready for guests</p>
                </div>
                <div className="p-3 bg-[var(--color-success)]/10 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-[var(--color-success)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Occupied</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">{occupiedTables}</p>
                  <p className="text-xs text-[var(--color-error)] mt-1">Currently dining</p>
                </div>
                <div className="p-3 bg-[var(--color-error)]/10 rounded-lg">
                  <Users className="w-6 h-6 text-[var(--color-error)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Reserved</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">{reservedTables}</p>
                  <p className="text-xs text-[var(--color-warning)] mt-1">Upcoming reservations</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tables..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>

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

                {/* Location Filter */}
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                >
                  {locations.map(location => (
                    <option key={location} value={location}>
                      {location.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
                    onClick={() => setViewMode('map')}
                    className={`flex-1 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      viewMode === 'map'
                        ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    Map
                  </button>
                </div>

                {/* Clear Filters */}
                {(searchQuery || statusFilter !== 'all' || locationFilter !== 'all') && (
                  <Button
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('all')
                      setLocationFilter('all')
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

        {/* Tables Display */}
        {filteredTables.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-[var(--color-background-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid className="w-8 h-8 text-[var(--color-text-muted)]" />
              </div>
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                No tables found
              </h3>
              <p className="text-[var(--color-text-secondary)] mb-4">
                {searchQuery || statusFilter !== 'all' || locationFilter !== 'all'
                  ? 'Try adjusting your filters' 
                  : 'Start by adding your first table'
                }
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Table
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4'
          }>
            {filteredTables.map((table) => {
              const statusColor = getStatusColor(table.status)
              const StatusIcon = getStatusIcon(table.status)
              
              return (
                <Card 
                  key={table.id} 
                  className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${
                    viewMode === 'map' ? 'aspect-square' : ''
                  }`}
                >
                  <CardContent className={viewMode === 'grid' ? 'p-6' : 'p-4'}>
                    {viewMode === 'grid' ? (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-[var(--color-text-primary)]">
                                Table {table.number}
                              </h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                statusColor === 'success' ? 'bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)]' :
                                statusColor === 'warning' ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning-border)]' :
                                statusColor === 'error' ? 'bg-[var(--color-error-bg)] text-[var(--color-error)] border border-[var(--color-error-border)]' :
                                'bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[var(--color-info-border)]'
                              }`}>
                                {table.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-[var(--color-text-secondary)]">
                              <span className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {table.capacity} seats
                              </span>
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {table.location}
                              </span>
                            </div>
                          </div>
                        </div>

                        {table.currentOrder && (
                          <div className="p-3 bg-[var(--color-background-secondary)] rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                  {table.currentOrder.orderNumber}
                                </p>
                                <p className="text-xs text-[var(--color-text-secondary)]">
                                  {table.currentOrder.customerName}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-[var(--color-primary)]">
                                  ${table.currentOrder.total.toFixed(2)}
                                </p>
                                <p className="text-xs text-[var(--color-text-muted)]">
                                  {new Date(table.currentOrder.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {table.reservations.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                              Upcoming Reservations:
                            </p>
                            {table.reservations.slice(0, 2).map((reservation) => (
                              <div key={reservation.id} className="text-xs text-[var(--color-text-secondary)]">
                                {reservation.customerName} - {reservation.partySize} guests at {new Date(reservation.reservationTime).toLocaleTimeString()}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-3 border-t border-[var(--color-border)]">
                          <select
                            value={table.status}
                            onChange={(e) => updateTableStatus(table.id, e.target.value)}
                            className="flex-1 px-3 py-1.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                          >
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                            <option value="reserved">Reserved</option>
                            <option value="cleaning">Cleaning</option>
                          </select>
                          <Button variant="outline" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Map view - compact table representation
                      <div className="flex flex-col items-center justify-center h-full space-y-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          statusColor === 'success' ? 'bg-[var(--color-success)] text-white' :
                          statusColor === 'warning' ? 'bg-[var(--color-warning)] text-white' :
                          statusColor === 'error' ? 'bg-[var(--color-error)] text-white' :
                          'bg-[var(--color-info)] text-white'
                        }`}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-[var(--color-text-primary)]">
                            {table.number}
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {table.capacity} seats
                          </p>
                        </div>
                      </div>
                    )}
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