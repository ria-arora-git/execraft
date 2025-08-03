'use client'

import { useEffect, useState } from 'react'
import { Package, ShoppingCart, AlertTriangle, TrendingUp, DollarSign, Users, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface DashboardStats {
  totalOrders: number
  todayRevenue: number
  lowStockItems: number
  activeOrders: number
  totalMenuItems: number
  totalInventoryItems: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/orders?limit=5'),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setRecentOrders(ordersData.slice(0, 5))
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-white text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent mx-auto"></div>
        <p className="mt-4">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-blueDark min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-300 mt-2 sm:mt-0">Welcome back! Here's what's happening with your restaurant.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(stats?.todayRevenue || 0)}
          icon={DollarSign}
          color="text-green-400"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders?.toString() || '0'}
          icon={ShoppingCart}
          color="text-blue-400"
        />
        <StatCard
          title="Active Orders"
          value={stats?.activeOrders?.toString() || '0'}
          icon={Clock}
          color="text-yellow-400"
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.lowStockItems?.toString() || '0'}
          icon={AlertTriangle}
          color="text-red-400"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-blueBase p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Orders</h2>
        <div className="space-y-3">
          {recentOrders.length === 0 ? (
            <p className="text-slate-400">No recent orders</p>
          ) : (
            recentOrders.map(order => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-blueDark rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">#{order.orderNumber}</p>
                  <p className="text-sm text-slate-400">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{formatCurrency(order.total)}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : order.status === 'PREPARING'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'READY'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'SERVED'
                        ? 'bg-purple-100 text-purple-800'
                        : order.status === 'PAID'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  color
}: {
  title: string
  value: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-blueBase p-6 rounded-xl shadow-lg flex items-center space-x-4">
      <Icon className={`h-10 w-10 ${color}`} />
      <div>
        <p className="text-slate-400 text-sm">{title}</p>
        <p className="text-white font-bold text-2xl">{value}</p>
      </div>
    </div>
  )
}
