'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  items: { id: string; menuItem: { name: string }; quantity: number; price: number }[]
  createdAt: string
}

interface TableOrdersProps {
  params: { tableId: string }
}

export default function TableOrders({ params }: TableOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true)
      const res = await fetch(`/api/tables/${params.tableId}/orders`)
      if (res.ok) {
        const json = await res.json()
        setOrders(json.orders)
      }
      setLoading(false)
    }
    fetchOrders()
  }, [params.tableId])

  const updateOrderStatus = async (orderId: string, status: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setOrders(orders =>
        orders.map(o => (o.id === orderId ? { ...o, status } : o))
      )
    }
  }

  if (loading) {
    return <p className="p-10 text-white">Loading...</p>
  }

  return (
    <section className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-white">Orders for Table {params.tableId}</h1>
      {orders.map(order => (
        <div key={order.id} className="bg-blueBase p-6 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-accent">{order.orderNumber}</h2>
            <span className="text-white font-semibold">${order.total.toFixed(2)}</span>
          </div>
          <div className="mb-4">
            <p className="italic text-slate-400">Status: {order.status}</p>
            <ul className="list-disc list-inside text-white">
              {order.items.map(item => (
                <li key={item.id}>
                  {item.quantity} x {item.menuItem.name} (${item.price.toFixed(2)})
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-2">
            {order.status === 'PENDING' && (
              <Button onClick={() => updateOrderStatus(order.id, 'PREPARING')} size="sm">
                Start Preparing
              </Button>
            )}
            {order.status === 'PREPARING' && (
              <Button onClick={() => updateOrderStatus(order.id, 'READY')} size="sm">
                Mark Ready
              </Button>
            )}
            {order.status === 'READY' && (
              <Button onClick={() => updateOrderStatus(order.id, 'SERVED')} size="sm">
                Mark Served
              </Button>
            )}
            {order.status === 'SERVED' && (
              <Button onClick={() => updateOrderStatus(order.id, 'PAID')} size="sm" variant="outline">
                Mark Paid
              </Button>
            )}
          </div>
        </div>
      ))}
      {orders.length === 0 && (
        <p className="text-slate-400">No active orders for this table</p>
      )}
      <Button className="mt-8" onClick={() => router.back()}>
        ← Back to Active Orders
      </Button>
    </section>
  )
}
