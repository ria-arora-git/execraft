'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import useSWR from 'swr'
import { useOrganization } from '@clerk/nextjs'
import { 
  Clock,
  Users,
  CheckCircle,
  RefreshCw,
  Filter,
  Search,
  Bell,
  AlertCircle,
  ChefHat,
  Eye
} from 'lucide-react'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
})

interface OrderItem {
  id: string
  quantity: number
  price: number
  notes?: string
  menuItem: {
    name: string
    preparationTime?: number
  }
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone?: string
  total: number
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED'
  notes?: string
  tableId: string
  table: {
    number: number
    location?: string
  }
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export default function ActiveOrdersPage() {
  const { organization } = useOrganization()
  const [refreshKey, setRefreshKey] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const { data: orders = [], error, isLoading, mutate } = useSWR<Order[]>(
    organization ? `/api/admin/active-orders?organizationId=${organization.id}&r=${refreshKey}` : null,
    fetcher,
    { 
      refreshInterval: 5000, // Refresh every 5 seconds for real-time updates
      revalidateOnFocus: true 
    }
  )

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesSearch = searchQuery === '' || 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.table.number.toString().includes(searchQuery)
    
    return matchesStatus && matchesSearch
  })

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: orderId,
          status: newStatus
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update order status')
      }
      
      mutate()
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    mutate()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning'
      case 'PREPARING': return 'info' 
      case 'READY': return 'success'
      case 'SERVED': return 'success'
      default: return 'info'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return Clock
      case 'PREPARING': return ChefHat
      case 'READY': return CheckCircle
      case 'SERVED': return CheckCircle
      default: return Clock
    }
  }

  const ordersByStatus = {
    PENDING: filteredOrders.filter(o => o.status === 'PENDING').length,
    PREPARING: filteredOrders.filter(o => o.status === 'PREPARING').length,
    READY: filteredOrders.filter(o => o.status === 'READY').length,
    SERVED: filteredOrders.filter(o => o.status === 'SERVED').length
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-[var(--color-error)] flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Error Loading Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--color-text-secondary)] mb-4">
              Failed to load active orders. Please check your connection.
            </p>
            <Button onClick={handleRefresh} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                Active Orders
              </h1>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-1">
                Monitor and manage all active orders in real-time
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
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
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
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Pending</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">{ordersByStatus.PENDING}</p>
                </div>
                <div className="p-3 bg-[var(--color-warning)]/10 rounded-lg">
                  <Clock className="w-6 h-6 text-[var(--color-warning)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Preparing</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">{ordersByStatus.PREPARING}</p>
                </div>
                <div className="p-3 bg-[var(--color-info)]/10 rounded-lg">
                  <ChefHat className="w-6 h-6 text-[var(--color-info)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Ready</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">{ordersByStatus.READY}</p>
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
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Total Active</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">{filteredOrders.length}</p>
                </div>
                <div className="p-3 bg-[var(--color-primary)]/10 rounded-lg">
                  <Bell className="w-6 h-6 text-[var(--color-primary)]" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search orders..."
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
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="PREPARING">Preparing</option>
                  <option value="READY">Ready</option>
                  <option value="SERVED">Served</option>
                </select>

                {/* Clear Filters */}
                {(searchQuery || statusFilter !== 'all') && (
                  <Button
                    onClick={() => {
                      setSearchQuery('')
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

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-[var(--color-background-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-[var(--color-text-muted)]" />
              </div>
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                No active orders
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No orders match your current filters'
                  : 'All caught up! No orders need attention right now.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => {
              const statusColor = getStatusColor(order.status)
              const StatusIcon = getStatusIcon(order.status)
              const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0)
              
              return (
                <Card key={order.id} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg font-bold text-[var(--color-text-primary)] truncate">
                          {order.orderNumber}
                        </CardTitle>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          {order.customerName}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        statusColor === 'warning' ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning-border)]' :
                        statusColor === 'info' ? 'bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[var(--color-info-border)]' :
                        statusColor === 'success' ? 'bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)]' :
                        'bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[var(--color-info-border)]'
                      }`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {order.status}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-[var(--color-text-secondary)]">
                        <Users className="w-4 h-4 mr-2" />
                        Table {order.table.number}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[var(--color-primary)]">
                          ${order.total.toFixed(2)}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {totalItems} item{totalItems !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-[var(--color-text-secondary)]">
                      <p className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Ordered: {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">Items:</p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-[var(--color-text-secondary)]">
                              {item.quantity}x {item.menuItem.name}
                            </span>
                            <span className="font-medium text-[var(--color-text-primary)]">
                              ${(item.quantity * item.price).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.notes && (
                      <div className="p-3 bg-[var(--color-background-secondary)] rounded-lg">
                        <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                          Special Instructions:
                        </p>
                        <p className="text-sm text-[var(--color-text-primary)]">
                          {order.notes}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-[var(--color-border)]">
                      {order.status === 'PENDING' && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                          size="sm"
                          className="flex-1"
                        >
                          Start Preparing
                        </Button>
                      )}
                      {order.status === 'PREPARING' && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, 'READY')}
                          size="sm"
                          className="flex-1"
                        >
                          Mark Ready
                        </Button>
                      )}
                      {order.status === 'READY' && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, 'SERVED')}
                          size="sm"
                          className="flex-1"
                        >
                          Mark Served
                        </Button>
                      )}
                      <Link href={`/admin/active-orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
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