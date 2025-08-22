'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import useSWR from 'swr'
import { useOrganization } from '@clerk/nextjs'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { 
  Download, 
  Filter, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  FileText,
  Clock,
  DollarSign,
  Users,
  Eye,
  RefreshCw,
  AlertCircle
} from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone?: string
  total: number
  status: string
  notes?: string
  createdAt: string
  table: {
    number: number
    location: string
  }
  items: {
    id: string
    quantity: number
    price: number
    menuItem: {
      name: string
    }
  }[]
}

interface OrderHistoryResponse {
  orders: Order[]
  totalCount: number
  totalPages: number
  currentPage: number
}

export default function OrderHistoryPage() {
  const { organization } = useOrganization()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')
  const [refreshKey, setRefreshKey] = useState(0)
  const ordersPerPage = 20

  const { data, error, isLoading, mutate } = useSWR<OrderHistoryResponse>(
    organization ? `/api/admin/order-history?organizationId=${organization.id}&page=${currentPage}&limit=${ordersPerPage}&search=${searchQuery}&status=${statusFilter}&date=${selectedDate?.toISOString() || ''}&r=${refreshKey}` : null,
    fetcher,
    { revalidateOnFocus: true }
  )

  const orders = data?.orders || []
  const totalPages = data?.totalPages || 1
  const totalCount = data?.totalCount || 0

  const handleExport = async () => {
    try {
      const exportData = {
        organizationId: organization?.id,
        search: searchQuery,
        status: statusFilter,
        date: selectedDate?.toISOString() || ''
      }
      
      const response = await fetch('/api/admin/export/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData)
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `order-history-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    mutate()
  }

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PREPARING', label: 'Preparing' },
    { value: 'READY', label: 'Ready' },
    { value: 'SERVED', label: 'Served' },
    { value: 'PAID', label: 'Paid' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ]

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
              Failed to load order history. Please check your connection.
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
            <div className="h-12 bg-[var(--color-background-secondary)] rounded"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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
                Order History
              </h1>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-1">
                View and manage all your restaurant orders ({totalCount} total)
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
                onClick={handleExport}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
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
        {/* Filters Section */}
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
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>

                {/* Date Filter */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4 z-10" />
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => {
                      setSelectedDate(date)
                      setCurrentPage(1)
                    }}
                    placeholderText="Select date"
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* View Toggle */}
                <div className="flex rounded-lg border border-[var(--color-border)] p-1 bg-[var(--color-background-secondary)]">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`flex-1 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      viewMode === 'cards'
                        ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    Cards
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`flex-1 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      viewMode === 'table'
                        ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    Table
                  </button>
                </div>
              </div>

              {/* Clear Filters */}
              {(searchQuery || selectedDate || statusFilter !== 'all') && (
                <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {totalCount} order{totalCount !== 1 ? 's' : ''} found
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedDate(null)
                      setStatusFilter('all')
                      setCurrentPage(1)
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Orders Display */}
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-[var(--color-background-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-[var(--color-text-muted)]" />
              </div>
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                No orders found
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                Try adjusting your filters or check back later
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === 'cards' ? (
              /* Card View */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {orders.map((order) => (
                  <Card key={order.id} className="hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-[var(--color-text-primary)] truncate">
                            {order.orderNumber}
                          </h3>
                          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                            {order.customerName}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'PAID' ? 'bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)]' :
                          order.status === 'CANCELLED' ? 'bg-[var(--color-error-bg)] text-[var(--color-error)] border border-[var(--color-error-border)]' :
                          order.status === 'SERVED' ? 'bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[var(--color-info-border)]' :
                          'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning-border)]'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-[var(--color-text-secondary)]">
                          <Users className="w-4 h-4 mr-2" />
                          Table {order.table.number}
                        </div>
                        <div className="flex items-center text-sm text-[var(--color-text-secondary)]">
                          <Clock className="w-4 h-4 mr-2" />
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-[var(--color-text-secondary)]">
                            <FileText className="w-4 h-4 mr-2" />
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </div>
                          <div className="flex items-center font-bold text-[var(--color-primary)]">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {order.total.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {order.notes && (
                        <div className="mt-4 p-3 bg-[var(--color-background-secondary)] rounded-lg">
                          <p className="text-xs text-[var(--color-text-secondary)] font-medium mb-1">Notes:</p>
                          <p className="text-sm text-[var(--color-text-primary)]">{order.notes}</p>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Table View */
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--color-background-secondary)]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                          Table
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-[var(--color-background-secondary)] transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-[var(--color-text-primary)]">
                              {order.orderNumber}
                            </div>
                            <div className="text-sm text-[var(--color-text-secondary)]">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-[var(--color-text-primary)]">
                              {order.customerName}
                            </div>
                            {order.customerPhone && (
                              <div className="text-sm text-[var(--color-text-secondary)]">
                                {order.customerPhone}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-[var(--color-text-primary)]">
                            {order.table.number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-[var(--color-primary)]">
                            ${order.total.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'PAID' ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' :
                              order.status === 'CANCELLED' ? 'bg-[var(--color-error-bg)] text-[var(--color-error)]' :
                              order.status === 'SERVED' ? 'bg-[var(--color-info-bg)] text-[var(--color-info)]' :
                              'bg-[var(--color-warning-bg)] text-[var(--color-warning)]'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                            {new Date(order.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <div className="text-sm text-[var(--color-text-secondary)]">
                  Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, totalCount)} of {totalCount} orders
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                      return (
                        <Button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className="w-10 h-10 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    variant="outline"
                    size="sm"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}