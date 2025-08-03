'use client'

import { useEffect, useState } from 'react'
import { Bell, X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Alert {
  id: string
  inventoryItem: {
    name: string
    quantity: number
    unit: string
  }
  alertType: string
  message: string
  acknowledged: boolean
  createdAt: string
}

export function AlertsManager() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [showAlerts, setShowAlerts] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAlerts()
    // Check for alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts')
      if (res.ok) {
        const data = await res.json()
        setAlerts(data.filter((alert: Alert) => !alert.acknowledged))
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    }
  }

  const acknowledgeAlert = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, acknowledged: true }),
      })
      if (res.ok) {
        setAlerts(alerts.filter(alert => alert.id !== id))
        toast.success('Alert acknowledged')
      }
    } catch (error) {
      toast.error('Failed to acknowledge alert')
    }
    setLoading(false)
  }

  const unacknowledgedCount = alerts.length

  return (
    <>
      {/* Alert Bell */}
      <div className="fixed top-4 right-20 z-50">
        <button
          onClick={() => setShowAlerts(!showAlerts)}
          className="relative p-2 text-white hover:text-accent transition-colors"
        >
          <Bell className="h-6 w-6" />
          {unacknowledgedCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unacknowledgedCount}
            </span>
          )}
        </button>
      </div>

      {/* Alerts Panel */}
      {showAlerts && (
        <div className="fixed top-16 right-4 w-80 bg-blueBase border border-slate-700 rounded-lg shadow-xl z-40 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-slate-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Stock Alerts</h3>
              <button
                onClick={() => setShowAlerts(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-4 text-center text-slate-400">
                No active alerts
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="p-4 border-b border-slate-700 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="h-4 w-4 text-warning mr-2" />
                        <span className="text-sm font-medium text-white">
                          Low Stock Alert
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">
                        {alert.inventoryItem.name}: {alert.inventoryItem.quantity} {alert.inventoryItem.unit} remaining
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acknowledgeAlert(alert.id)}
                      disabled={loading}
                      className="ml-2"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  )
}