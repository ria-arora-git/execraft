'use client'
export const dynamic = "force-dynamic";
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function AnalyticsPage() {
  const { data = {}, isLoading } = useSWR(`/api/analytics`, u => fetch(u).then(r => r.json()))

  const cards = [
    { 
      label: 'Average Customers per Day', 
      value: data.avgCustomersPerDay ?? 0,
      icon: (
        <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    { 
      label: 'Revenue per Day', 
      value: `$${data.revenuePerDay?.toFixed(2) ?? '0.00'}`,
      icon: (
        <svg className="h-4 w-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    { 
      label: 'Orders per Day', 
      value: data.ordersPerDay ?? 0,
      icon: (
        <svg className="h-4 w-4 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    { 
      label: 'Inventory Usage per Day', 
      value: data.inventoryUsagePerDay ?? '--',
      icon: (
        <svg className="h-4 w-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    }
  ]

  return (
    <div className="p-4 sm:p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text">Business Analytics</h1>
          <p className="text-text-secondary mt-1">Key performance indicators for your restaurant</p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="card">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-4 bg-secondary rounded w-24"></div>
                      <div className="h-4 w-4 bg-secondary rounded"></div>
                    </div>
                    <div className="h-8 bg-secondary rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => (
              <Card key={index} className="card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-text-secondary">
                    {card.label}
                  </CardTitle>
                  {card.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-text">{card.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Additional Analytics Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card">
            <CardHeader>
              <CardTitle className="text-text">Performance Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-text-secondary text-sm">
                Track your restaurant's daily performance metrics to identify trends and optimize operations.
              </div>
              <div className="bg-secondary p-4 rounded-lg">
                <p className="text-text-secondary text-sm">
                  📊 Analytics data is calculated based on your restaurant's order history and inventory usage.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader>
              <CardTitle className="text-text">Quick Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-text-secondary">Total Menu Items:</span>
                <span className="font-medium text-text">{data.totalMenuItems ?? 0}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-text-secondary">Inventory Items:</span>
                <span className="font-medium text-text">{data.totalInventoryItems ?? 0}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-text-secondary">Low Stock Items:</span>
                <span className="font-medium text-warning">{data.lowStockCount ?? 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
