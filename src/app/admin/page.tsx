'use client'

import React from 'react'
import useSWR from 'swr'
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  AlertTriangle,
  Users,
  DollarSign,
  Clock
} from 'lucide-react'
import { StatsCard, ActionCard, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useResponsive } from '@/lib/ThemeProvider'
import { formatCurrency, formatNumber, cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function EnhancedAdminDashboard() {
  const { isMobile, isTablet, isDesktop } = useResponsive()
  
  // Data fetching with SWR
  const { data: analytics, error: analyticsError } = useSWR(
    '/api/admin/analytics', 
    fetcher, 
    { refreshInterval: 30000 }
  )
  
  const { data: activeOrders, error: ordersError } = useSWR(
    '/api/admin/active-orders', 
    fetcher, 
    { refreshInterval: 5000 }
  )
  
  const { data: alerts, error: alertsError } = useSWR(
    '/api/admin/alerts', 
    fetcher, 
    { refreshInterval: 10000 }
  )

  // Error handling
  if (analyticsError || ordersError || alertsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-error mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Error Loading Dashboard
            </h3>
            <p className="text-text-secondary mb-4">
              There was an error loading the dashboard data. Please try refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Loading state
  if (!analytics || !activeOrders || !alerts) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className={cn(
          'grid gap-4',
          isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'
        )}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-surface-variant rounded-xl h-32"></div>
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-surface-variant rounded-xl h-64"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Safely access data with fallbacks
  const safeAnalytics = analytics || {}
  const safeActiveOrders = Array.isArray(activeOrders) ? activeOrders : []
  const safeAlerts = Array.isArray(alerts) ? alerts : []

  const lowStockAlerts = safeAlerts.filter(
    alert => alert.alertType === 'LOW_STOCK' && !alert.acknowledged
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Restaurant Dashboard
          </h1>
          <p className="text-text-secondary">
            Monitor your restaurant's performance and operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <Clock className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className={cn(
        'grid gap-4',
        isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-4'
      )}>
        <StatsCard
          title="Today's Orders"
          value={safeAnalytics.todayOrders?.toString() || '0'}
          subtitle="Total orders placed today"
          icon={<ShoppingCart className="h-6 w-6" />}
          trend={
            safeAnalytics.ordersGrowth ? {
              value: safeAnalytics.ordersGrowth,
              label: 'vs yesterday',
              isPositive: safeAnalytics.ordersGrowth > 0
            } : undefined
          }
        />
        
        <StatsCard
          title="Active Orders"
          value={safeActiveOrders.length.toString()}
          subtitle="Currently processing"
          icon={<Clock className="h-6 w-6" />}
        />
        
        <StatsCard
          title="Today's Revenue"
          value={formatCurrency(safeAnalytics.todayRevenue || 0)}
          subtitle="Total revenue today"
          icon={<DollarSign className="h-6 w-6" />}
          trend={
            safeAnalytics.revenueGrowth ? {
              value: safeAnalytics.revenueGrowth,
              label: 'vs yesterday',
              isPositive: safeAnalytics.revenueGrowth > 0
            } : undefined
          }
        />
        
        <StatsCard
          title="Low Stock Alerts"
          value={lowStockAlerts.length.toString()}
          subtitle="Items need restocking"
          icon={<AlertTriangle className="h-6 w-6" />}
          className={lowStockAlerts.length > 0 ? 'border-warning/20 bg-warning/5' : ''}
        />
      </div>

      {/* Main Content Grid */}
      <div className={cn(
        'grid gap-6',
        isDesktop ? 'grid-cols-2' : 'grid-cols-1'
      )}>
        {/* Recent Active Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">Active Orders</CardTitle>
            <Button variant="outline" size="sm" >
              <a href="/admin/active-orders">View All</a>
            </Button>
          </CardHeader>
          <CardContent>
            {safeActiveOrders.length > 0 ? (
              <div className="space-y-3">
                {safeActiveOrders.slice(0, 5).map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-variant hover:bg-surface-variant/80 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        Order #{order.orderNumber}
                      </p>
                      <p className="text-sm text-text-secondary">
                        Table {order.table?.number || 'N/A'} • {order.items?.length || 0} items
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-foreground">
                        {formatCurrency(order.total || 0)}
                      </span>
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        {
                          'bg-warning/10 text-warning': order.status === 'PENDING',
                          'bg-info/10 text-info': order.status === 'PREPARING',
                          'bg-success/10 text-success': order.status === 'READY',
                        }
                      )}>
                        {order.status?.toLowerCase().replace('_', ' ') || 'Unknown'}
                      </span>
                    </div>
                  </div>
                ))}
                
                {safeActiveOrders.length > 5 && (
                  <div className="text-center pt-2">
                    <Button variant="ghost" size="sm" >
                      <a href="/admin/active-orders">
                        View {safeActiveOrders.length - 5} more orders
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-text-disabled mx-auto mb-4" />
                <p className="text-text-secondary">No active orders</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">Recent Alerts</CardTitle>
            <Button variant="outline" size="sm" >
              <a href="/admin/alerts">View All</a>
            </Button>
          </CardHeader>
          <CardContent>
            {safeAlerts.length > 0 ? (
              <div className="space-y-3">
                {safeAlerts.slice(0, 5).map((alert: any) => (
                  <div
                    key={alert.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg transition-colors',
                      alert.acknowledged 
                        ? 'bg-surface-variant/50' 
                        : 'bg-warning/5 border border-warning/20'
                    )}
                  >
                    <AlertTriangle className={cn(
                      'h-4 w-4 mt-1 flex-shrink-0',
                      alert.acknowledged ? 'text-text-disabled' : 'text-warning'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-medium',
                        alert.acknowledged ? 'text-text-secondary' : 'text-foreground'
                      )}>
                        {alert.message}
                      </p>
                      <p className="text-xs text-text-disabled mt-1">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium flex-shrink-0',
                      alert.acknowledged 
                        ? 'bg-success/10 text-success' 
                        : 'bg-warning/10 text-warning'
                    )}>
                      {alert.acknowledged ? 'Resolved' : 'Active'}
                    </span>
                  </div>
                ))}
                
                {safeAlerts.length > 5 && (
                  <div className="text-center pt-2">
                    <Button variant="ghost" size="sm" >
                      <a href="/admin/alerts">
                        View {safeAlerts.length - 5} more alerts
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-text-disabled mx-auto mb-4" />
                <p className="text-text-secondary">No recent alerts</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className={cn(
          'grid gap-4',
          isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        )}>
          <ActionCard
            title="Manage Inventory"
            description="View and update stock levels"
            icon={<Package className="h-5 w-5" />}
            actionLabel="Manage"
            onAction={() => window.location.href = '/admin/inventory'}
          />
          
          <ActionCard
            title="View Menu"
            description="Edit menu items and pricing"
            icon={<Users className="h-5 w-5" />}
            actionLabel="Edit"
            onAction={() => window.location.href = '/admin/menu-management'}
          />
          
          <ActionCard
            title="Table Management"
            description="Configure tables and QR codes"
            icon={<Users className="h-5 w-5" />}
            actionLabel="Configure"
            onAction={() => window.location.href = '/admin/table-management'}
          />
          
          <ActionCard
            title="Order History"
            description="View past orders and reports"
            icon={<ShoppingCart className="h-5 w-5" />}
            actionLabel="View"
            onAction={() => window.location.href = '/admin/order-history'}
          />
        </div>
      </div>
    </div>
  )
}