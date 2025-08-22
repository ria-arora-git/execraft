'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import useSWR from 'swr'
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Target,
  Award,
  BarChart3
} from 'lucide-react'

interface AnalyticsData {
  revenue: {
    today: number
    yesterday: number
    thisWeek: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  orders: {
    today: number
    thisWeek: number
    thisMonth: number
    averageOrderValue: number
    totalOrders: number
    growth: number
  }
  customers: {
    total: number
    returning: number
    new: number
    retention: number
  }
  popularItems: {
    id: string
    name: string
    orders: number
    revenue: number
  }[]
  hourlyData: {
    hour: number
    orders: number
    revenue: number
  }[]
  dailyData: {
    date: string
    orders: number
    revenue: number
  }[]
  monthlyData: {
    month: string
    orders: number
    revenue: number
  }[]
  performance: {
    averageOrderTime: number
    customerSatisfaction: number
    tableUtilization: number
    inventoryTurnover: number
  }
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d')
  const [showFilters, setShowFilters] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const { data: analytics, isLoading, mutate } = useSWR<AnalyticsData>(
    `/api/admin/analytics?range=${dateRange}&r=${refreshKey}`, 
    fetcher,
    { refreshInterval: 300000 } // Refresh every 5 minutes
  )

  const dateRanges = [
    { value: '1d', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ]

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    mutate()
  }

  const handleExport = () => {
    // Export analytics data
    console.log('Exporting analytics data...')
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-[var(--color-background-secondary)] rounded-lg"></div>
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
                Analytics Dashboard
              </h1>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-1">
                Monitor your restaurant's performance and insights
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              >
                {dateRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={handleExport}
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Total Revenue</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    ${analytics?.revenue.thisMonth.toFixed(2) || '0.00'}
                  </p>
                  <div className="flex items-center mt-2">
                    {(analytics?.revenue.growth || 0) >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-[var(--color-success)] mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-[var(--color-error)] mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      (analytics?.revenue.growth || 0) >= 0 
                        ? 'text-[var(--color-success)]' 
                        : 'text-[var(--color-error)]'
                    }`}>
                      {analytics?.revenue.growth?.toFixed(1) || 0}%
                    </span>
                    <span className="text-sm text-[var(--color-text-muted)] ml-1">vs last month</span>
                  </div>
                </div>
                <div className="p-3 bg-[var(--color-success)]/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-[var(--color-success)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Total Orders</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {analytics?.orders.thisMonth || 0}
                  </p>
                  <div className="flex items-center mt-2">
                    {(analytics?.orders.growth || 0) >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-[var(--color-success)] mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-[var(--color-error)] mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      (analytics?.orders.growth || 0) >= 0 
                        ? 'text-[var(--color-success)]' 
                        : 'text-[var(--color-error)]'
                    }`}>
                      {analytics?.orders.growth?.toFixed(1) || 0}%
                    </span>
                    <span className="text-sm text-[var(--color-text-muted)] ml-1">vs last month</span>
                  </div>
                </div>
                <div className="p-3 bg-[var(--color-primary)]/10 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Avg Order Value</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    ${analytics?.orders.averageOrderValue?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)] mt-2">
                    {analytics?.orders.today || 0} orders today
                  </p>
                </div>
                <div className="p-3 bg-[var(--color-accent)]/10 rounded-lg">
                  <Target className="w-6 h-6 text-[var(--color-accent)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Customer Retention</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {analytics?.customers.retention?.toFixed(1) || 0}%
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)] mt-2">
                    {analytics?.customers.returning || 0} returning customers
                  </p>
                </div>
                <div className="p-3 bg-[var(--color-warning)]/10 rounded-lg">
                  <Users className="w-6 h-6 text-[var(--color-warning)]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[var(--color-info)]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-[var(--color-info)]" />
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                {analytics?.performance.averageOrderTime || 0}m
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">Avg Order Time</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[var(--color-success)]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-[var(--color-success)]" />
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                {analytics?.performance.customerSatisfaction?.toFixed(1) || 0}/5
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">Customer Satisfaction</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[var(--color-accent)]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-[var(--color-accent)]" />
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                {analytics?.performance.tableUtilization?.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">Table Utilization</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                {analytics?.performance.inventoryTurnover?.toFixed(1) || 0}x
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">Inventory Turnover</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-[var(--color-background-secondary)] rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Chart visualization would go here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders by Hour */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Orders by Hour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-[var(--color-background-secondary)] rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Clock className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Hourly distribution chart would go here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Popular Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Menu Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.popularItems?.slice(0, 5).map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[var(--color-primary)]/10 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-[var(--color-primary)]">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-text-primary)]">{item.name}</p>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          {item.orders} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[var(--color-primary)]">
                        ${item.revenue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      No data available for the selected period
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">New Customers</span>
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {analytics?.customers.new || 0}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--color-background-secondary)] rounded-full h-2">
                    <div 
                      className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, ((analytics?.customers.new || 0) / (analytics?.customers.total || 1)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">Returning Customers</span>
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {analytics?.customers.returning || 0}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--color-background-secondary)] rounded-full h-2">
                    <div 
                      className="bg-[var(--color-accent)] h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, ((analytics?.customers.returning || 0) / (analytics?.customers.total || 1)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)]">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                        {analytics?.customers.total || 0}
                      </p>
                      <p className="text-sm text-[var(--color-text-secondary)]">Total Customers</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[var(--color-accent)]">
                        {analytics?.customers.retention?.toFixed(0) || 0}%
                      </p>
                      <p className="text-sm text-[var(--color-text-secondary)]">Retention Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  ${analytics?.revenue.today.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">Today's Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {analytics?.orders.today || 0}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">Today's Orders</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  ${analytics?.revenue.thisWeek.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">This Week</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {analytics?.orders.thisWeek || 0}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">Weekly Orders</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--color-primary)]">
                  ${analytics?.revenue.thisMonth.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">Monthly Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}