'use client'
export const dynamic = 'force-dynamic'

import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function AdminDashboard() {
  const { data: analyticsRaw, error: analyticsError } = useSWR('/api/admin/analytics', fetcher, { refreshInterval: 5000 })
  const { data: activeOrdersRaw, error: ordersError } = useSWR('/api/admin/active-orders', fetcher, { refreshInterval: 3000 })
  const { data: alertsRaw, error: alertsError } = useSWR('/api/admin/alerts', fetcher, { refreshInterval: 2000 })

  const analytics = analyticsRaw && typeof analyticsRaw === 'object' ? analyticsRaw : {}
  const activeOrders = Array.isArray(activeOrdersRaw) ? activeOrdersRaw : []
  const alerts = Array.isArray(alertsRaw) ? alertsRaw : []

  if (analyticsError || ordersError || alertsError) {
    return <div className="p-8 text-red-500">Error loading dashboard data</div>
  }

  return (
    <div className="p-8 bg-blueDark min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8">Restaurant Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-blueBase border-slate-600">
          <CardHeader>
            <CardTitle className="text-white">Total Orders Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">{analytics.todayOrders ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-blueBase border-slate-600">
          <CardHeader>
            <CardTitle className="text-white">Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">{activeOrders.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-blueBase border-slate-600">
          <CardHeader>
            <CardTitle className="text-white">Revenue Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">${analytics.todayRevenue?.toFixed(2) ?? '0.00'}</p>
          </CardContent>
        </Card>
        <Card className="bg-blueBase border-slate-600">
          <CardHeader>
            <CardTitle className="text-white">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">
              {alerts.filter(a => a.alertType === 'LOW_STOCK' && !a.acknowledged).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blueBase border-slate-600 mb-8">
        <CardHeader>
          <CardTitle className="text-white">Recent Active Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {activeOrders.length > 0 ? (
            activeOrders.slice(0, 5).map(order => (
              <div key={order.id} className="flex justify-between items-center py-2 border-b border-slate-600">
                <span className="text-white">Order #{order.orderNumber}</span>
                <span className="text-accent">${typeof order.total === 'number' ? order.total.toFixed(2) : '0.00'}</span>
                <span className="text-slate-400">Table {order.table?.number ?? 'N/A'}</span>
              </div>
            ))
          ) : (
            <p>No recent active orders.</p>
          )}
        </CardContent>
      </Card>

      {alerts.length > 0 && (
        <Card className="bg-blueBase border-slate-600">
          <CardHeader>
            <CardTitle className="text-white">Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="flex justify-between items-center py-2 border-b border-slate-600">
                <span className="text-white">{alert.message}</span>
                <span className={`px-2 py-1 rounded text-xs ${alert.acknowledged ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                  {alert.acknowledged ? 'Acknowledged' : 'New'}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
