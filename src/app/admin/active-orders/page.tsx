'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface Table {
  id: string
  number: number
  orders: any[]
}

export default function ActiveOrders() {
  const { data: tables = [] } = useSWR<Table[]>('/api/admin/active-orders', url =>
    fetch(url).then(res => res.json())
  )

  return (
    <section className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">Active Orders</h1>
        <p className="text-slate-400">Tables currently with active orders</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map(table => (
          <Link
            key={table.id}
            href={`/admin/active-orders/table/${table.id}`}
          >
            <div className="bg-blueBase p-6 rounded-xl cursor-pointer hover:ring-2 hover:ring-accent transition">
              <h3 className="text-xl font-bold text-accent">Table {table.number}</h3>
              <p className="text-slate-400">{table.orders.length} active order(s)</p>
              <Button size="sm" variant="outline" className="mt-4">
                View Orders
              </Button>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
