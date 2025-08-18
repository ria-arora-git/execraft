
'use client'
export const dynamic = 'force-dynamic'

import useSWR, { mutate } from 'swr'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function TableOrdersPage({ params }: { params: { tableId: string } }) {
  const router = useRouter()
  const { data: orders, error } = useSWR(`/api/tables/${params.tableId}/orders`, fetcher, { refreshInterval: 3000 })

  async function updateOrderStatus(orderId: string, status: string) {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status })
      })

      if (!res.ok) {
        toast.error('Failed to update order status')
        return
      }
      toast.success(`Order status updated to ${status}`)
      mutate(`/api/tables/${params.tableId}/orders`)
    } catch {
      toast.error('Network error')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-warning/20 text-warning border-warning/30'
      case 'PREPARING': return 'bg-info/20 text-info border-info/30'
      case 'READY': return 'bg-success/20 text-success border-success/30'
      case 'SERVED': return 'bg-primary/20 text-primary border-primary/30'
      default: return 'bg-secondary text-text border-border'
    }
  }

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PENDING': return { status: 'PREPARING', label: 'Start Preparing', color: 'bg-info hover:bg-info/90' }
      case 'PREPARING': return { status: 'READY', label: 'Mark Ready', color: 'bg-success hover:bg-success/90' }
      case 'READY': return { status: 'SERVED', label: 'Mark Served', color: 'bg-primary hover:bg-primary/90' }
      case 'SERVED': return { status: 'PAID', label: 'Mark Paid', color: 'bg-primary hover:bg-primary/90' }
      default: return null
    }
  }

  if (error) {
    return (
      <div className="p-4 sm:p-8 bg-background min-h-screen">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-error mb-4">Error Loading Orders</h2>
          <p className="text-text-primary mb-6">Failed to load orders for this table.</p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 bg-background min-h-screen text-text-primary">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button onClick={() => router.back()} variant="outline" className="mb-4">
            ← Back to Active Orders
          </Button>
          <h1 className="text-3xl font-bold text-text mb-2">
            Table {orders?.[0]?.table?.number ?? 'Orders'}
          </h1>
          <p className="text-text-secondary">Manage orders for this table</p>
        </div>

        {!orders ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <Card className="card">
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-text mb-2">No Active Orders</h3>
              <p className="text-text-secondary">This table has no active orders.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => {
              const nextStatus = getNextStatus(order.status)
              return (
                <Card key={order.id} className="card">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl font-semibold text-text">
                          Order #{order.orderNumber}
                        </CardTitle>
                        <div className="text-text-secondary text-sm mt-1">
                          Customer: {order.customerName}
                        </div>
                        <div className="text-text-secondary text-sm">
                          Created: {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <div className="text-2xl font-bold text-primary">
                          ${order.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <h4 className="font-medium text-text mb-3">Order Items:</h4>
                      <div className="space-y-2">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-secondary rounded-lg">
                            <span className="text-text">
                              {item.quantity}x {item.menuItem.name}
                            </span>
                            <span className="text-primary font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {nextStatus && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, nextStatus.status)}
                        className={`w-full sm:w-auto ${nextStatus.color} text-white`}
                      >
                        {nextStatus.label}
                      </Button>
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
