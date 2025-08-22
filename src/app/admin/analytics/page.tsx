'use client'
export const dynamic = "force-dynamic";
import useSWR from 'swr'

export default function AnalyticsPage() {
  const { data = {} } = useSWR(`/api/analytics`, u => fetch(u).then(r => r.json()))
  const cards = [
    { label: 'Customers / Day', value: data.avgCustomersPerDay },
    { label: 'Revenue / Day', value: `$${data.revenuePerDay?.toFixed(2)}` },
    { label: 'Orders / Day', value: data.ordersPerDay },
    { label: 'Inventory Used / Day', value: data.inventoryUsagePerDay }
  ]
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Business Analytics</h1>
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(card => (
          <div key={card.label} className="bg-blueBase p-8 rounded-xl">
            <p className="text-slate-400 text-sm mb-2">{card.label}</p>
            <p className="text-2xl font-bold">{card.value ?? '--'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
