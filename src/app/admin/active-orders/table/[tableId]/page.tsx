'use client'
export const dynamic = 'force-dynamic'

import useSWR, { mutate } from 'swr'
import { Button } from '@/components/ui/Button'
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

  if (error) return <div className="p-8 text-red-500">Failed to load orders.</div>

  return (
    <div className="p-8 bg-blueDark min-h-screen text-white">
      <Button onClick={() => router.back()} variant="outline" className="mb-8">← Back</Button>
      <h1 className="text-3xl font-bold mb-6">Orders for Table {orders?.[0]?.table?.number ?? params.tableId}</h1>

      {orders?.length === 0 && <div>No active orders.</div>}

      {orders?.map((order: any) => (
        <div key={order.id} className="bg-blueBase rounded p-6 mb-4 border border-slate-600">
          <div className="flex justify-between mb-4 items-center">
            <div>
              <h2 className="text-xl font-semibold">Order #{order.orderNumber}</h2>
              <p className="text-slate-400">Customer: {order.customerName}</p>
              <p className="text-slate-400">Created: {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <span className="text-accent font-bold text-2xl">${order.total.toFixed(2)}</span>
          </div>
          <div className="mb-4">
            <strong>Items:</strong>
            <ul className="list-disc list-inside">
              {order.items.map((item: any) => (
                <li key={item.id}>{item.quantity} x {item.menuItem.name}</li>
              ))}
            </ul>
          </div>
          <div className="flex space-x-2">
            {order.status === 'PENDING' && <Button onClick={() => updateOrderStatus(order.id, 'PREPARING')} className="bg-blue-600">Start Preparing</Button>}
            {order.status === 'PREPARING' && <Button onClick={() => updateOrderStatus(order.id, 'READY')} className="bg-green-600">Mark Ready</Button>}
            {order.status === 'READY' && <Button onClick={() => updateOrderStatus(order.id, 'SERVED')} className="bg-purple-600">Mark Served</Button>}
            {order.status === 'SERVED' && <Button onClick={() => updateOrderStatus(order.id, 'PAID')} className="bg-accent">Mark Paid</Button>}
          </div>
        </div>
      ))}
    </div>
  )
}
