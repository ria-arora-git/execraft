'use client'

import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  Clock,
  Package,
  RefreshCw,
  ChefHat,
  Eye,
  ArrowUpRight,
  Activity
} from 'lucide-react'
import { useState } from 'react'
import { useOrganization } from '@clerk/nextjs'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface AnalyticsData {
  todayOrders: number
  todayRevenue: number
  lowStockCount: number
  activeOrdersCount: number
  totalMenuItems: number
  totalInventoryItems: number
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  total: number
  status: string
  table: {
    number: number
  }
  createdAt: string
}

interface Alert {
  id: string
  message: string
  acknowledged: boolean
  alertType: string
  createdAt: string
}

export default function AdminDashboard() {
  const { organization } = useOrganization()
  const [refreshKey, setRefreshKey] = useState(0)
  
  const { data: analytics, error: analyticsError, mutate: mutateAnalytics } = useSWR<AnalyticsData>(
    organization ? `/api/admin/analytics?organizationId=${organization.id}&r=${refreshKey}` : null, 
    fetcher, 
    { refreshInterval: 30000, revalidateOnFocus: true }
  )
  
  const { data: activeOrders = [], error: ordersError, mutate: mutateOrders } = useSWR<Order[]>(
    organization ? `/api/admin/active-orders?organizationId=${organization.id}&r=${refreshKey}` : null, 
    fetcher, 
    { refreshInterval: 10000, revalidateOnFocus: true }
  )
  
  const { data: alerts = [], error: alertsError, mutate: mutateAlerts } = useSWR<Alert[]>(
    organization ? `/api/admin/alerts?organizationId=${organization.id}&r=${refreshKey}` : null, 
    fetcher, 
    { refreshInterval: 15000, revalidateOnFocus: true }
  )

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    mutateAnalytics()
    mutateOrders()
    mutateAlerts()
  }

  if (analyticsError || ordersError || alertsError) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-[var(--color-error)] flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Error Loading Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--color-text-secondary)] mb-4">
              Failed to load dashboard data. Please check your connection and try again.
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mb-4">
              {analyticsError?.message || ordersError?.message || alertsError?.message}
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

  if (!analytics) {
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
            <div className="h-64 bg-[var(--color-background-secondary)] rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  const statsCards = [
    {
      title: "Today's Orders",
      value: analytics.todayOrders ?? 0,
      icon: ShoppingCart,
      change: "+12%",
      changeType: "positive" as const,
      href: "/admin/order-history",
    },
    {
      title: "Active Orders",
      value: activeOrders.length,
      icon: Clock,
      change: activeOrders.length > 5 ? "High" : "Normal",
      changeType: activeOrders.length > 5 ? "warning" as const : "positive" as const,
      href: "/admin/active-orders",
    },
    {
      title: "Today's Revenue",
      value: `$${analytics.todayRevenue?.toFixed(2) ?? '0.00'}`,
      icon: DollarSign,
      change: "+8.2%",
      changeType: "positive" as const,
      href: "/admin/analytics",
    },
    {
      title: "Low Stock Items",
      value: analytics.lowStockCount ?? 0,
      icon: AlertTriangle,
      change: analytics.lowStockCount && analytics.lowStockCount > 0 ? "Action Needed" : "All Good",
      changeType: analytics.lowStockCount && analytics.lowStockCount > 0 ? "warning" as const : "positive" as const,
      href: "/admin/inventory",
    }
  ]

  const quickActions = [
    {
      title: "Add Menu Item",
      description: "Create new menu items",
      href: "/admin/menu-management",
      icon: ChefHat,
    },
    {
      title: "Manage Inventory",
      description: "Update stock levels",
      href: "/admin/inventory", 
      icon: Package,
    },
    {
      title: "View Analytics",
      description: "Business insights",
      href: "/admin/analytics",
      icon: Activity,
    }
  ]

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm">
        <div className="container py-6">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] truncate">
                {organization?.name} Dashboard
              </h1>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-1">
                Welcome back! Here's what's happening today.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Refresh Data</span>
                <span className="sm:hidden">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Link key={index} href={stat.href} className="block">
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-[var(--color-text-secondary)] text-sm font-medium truncate">
                          {stat.title}
                        </p>
                        <div className="mt-2 flex items-baseline">
                          <p className="text-2xl lg:text-3xl font-bold text-[var(--color-text-primary)] truncate">
                            {stat.value}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                          {stat.changeType === 'positive' && (
                            <TrendingUp className="w-4 h-4 text-[var(--color-success)] mr-1 flex-shrink-0" />
                          )}
                          {stat.changeType === 'warning' && (
                            <TrendingDown className="w-4 h-4 text-[var(--color-warning)] mr-1 flex-shrink-0" />
                          )}
                          <span className={`font-medium truncate ${
                            stat.changeType === 'positive' ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'
                          }`}>
                            {stat.change}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <div className="p-3 bg-[var(--color-background-secondary)] rounded-lg group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-primary-foreground)] transition-colors">
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Active Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-4">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-xl">
                    Recent Active Orders
                  </CardTitle>
                  <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                    {activeOrders.length} active order{activeOrders.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Link href="/admin/active-orders">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {activeOrders.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-[var(--color-background-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="w-8 h-8 text-[var(--color-text-muted)]" />
                    </div>
                    <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                      No active orders
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      New orders will appear here when customers place them
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--color-border)]">
                    {activeOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="p-6 hover:bg-[var(--color-background-secondary)] transition-colors">
                        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                              <h4 className="font-semibold text-[var(--color-text-primary)] truncate">
                                {order.orderNumber}
                              </h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${
                                order.status === 'PENDING' ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning-border)]' :
                                order.status === 'PREPARING' ? 'bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[var(--color-info-border)]' :
                                order.status === 'READY' ? 'bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)]' :
                                'bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[var(--color-info-border)]'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-[var(--color-text-secondary)]">
                              <span className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                Table {order.table?.number ?? 'N/A'}
                              </span>
                              <span className="hidden sm:inline">•</span>
                              <span className="truncate">{order.customerName}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-6">
                            <div className="text-right">
                              <p className="text-xl font-bold text-[var(--color-primary)]">
                                ${typeof order.total === 'number' ? order.total.toFixed(2) : '0.00'}
                              </p>
                              <p className="text-xs text-[var(--color-text-muted)]">
                                {new Date(order.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                            <Link href={`/admin/active-orders/${order.id}`}>
                              <Button size="sm" variant="outline" className="flex-shrink-0">
                                <ArrowUpRight className="w-4 h-4" />
                                <span className="hidden sm:inline ml-2">View</span>
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href}>
                    <div className="flex items-center p-3 rounded-lg hover:bg-[var(--color-background-secondary)] transition-colors cursor-pointer group">
                      <div className="flex-shrink-0">
                        <action.icon className="w-5 h-5 text-[var(--color-primary)]" />
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)]">
                          {action.title}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] truncate">
                          {action.description}
                        </p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] ml-2" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg">Recent Alerts</CardTitle>
                <Link href="/admin/alerts">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-[var(--color-success-bg)] rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package className="w-6 h-6 text-[var(--color-success)]" />
                    </div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
                      All systems normal
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      No alerts at this time
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {alerts.slice(0, 3).map((alert) => (
                      <div 
                        key={alert.id} 
                        className="flex items-start gap-3 p-3 bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] rounded-lg"
                      >
                        <AlertTriangle className="w-4 h-4 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[var(--color-warning)] mb-1">
                            {alert.alertType}
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)] break-words">
                            {alert.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-[var(--color-background-secondary)] rounded-lg">
                    <p className="text-lg font-bold text-[var(--color-text-primary)]">
                      {analytics.totalMenuItems ?? 0}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">Menu Items</p>
                  </div>
                  <div className="text-center p-3 bg-[var(--color-background-secondary)] rounded-lg">
                    <p className="text-lg font-bold text-[var(--color-text-primary)]">
                      {analytics.totalInventoryItems ?? 0}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">Inventory Items</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <div className="grid grid-cols-1 gap-2">
                    <Link href="/admin/menu-management">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <ChefHat className="w-4 h-4 mr-2" />
                        Manage Menu
                      </Button>
                    </Link>
                    <Link href="/admin/inventory">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Package className="w-4 h-4 mr-2" />
                        Manage Stock
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}