'use client'
import useSWR from 'swr'
import { Button } from '@/components/ui/Button'

export default function AlertsPage() {
  const { data: alerts = [] } = useSWR(`/api/alerts`, url => fetch(url).then(res => res.json()))
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-white">Stock Alerts</h1>
      {alerts.length === 0 ? (
        <p className="text-slate-400">No alerts 🎉</p>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert: any) => (
            <li key={alert.id} className="bg-blueBase p-4 rounded-xl flex items-center justify-between">
              <span>{alert.message}</span>
              <Button size="sm" variant="outline">Acknowledge</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
