'use client'
export const dynamic = "force-dynamic";
import useSWR from 'swr'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import toast from 'react-hot-toast'

export default function AlertsPage() {
  const { data: alerts = [], mutate } = useSWR(`/api/alerts`, url => fetch(url).then(res => res.json()))
  
  async function acknowledgeAlert(id: string) {
    try {
      const res = await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, acknowledged: true }),
      })
      if (!res.ok) {
        toast.error('Failed to acknowledge alert')
        return
      }
      toast.success('Alert acknowledged')
      await mutate()
    } catch {
      toast.error('Failed to acknowledge alert')
    }
  }

  return (
    <div className="p-4 sm:p-8 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text">Stock Alerts</h1>
          <p className="text-text-secondary mt-1">Manage inventory alerts and notifications</p>
        </div>

        {alerts.length === 0 ? (
          <Card className="card">
            <CardContent className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-success mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-text mb-2">All Clear! 🎉</h3>
              <p className="text-text-secondary">No active alerts at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert: any) => (
              <Card key={alert.id} className="card border-l-4 border-l-warning">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="bg-warning/20 rounded-full p-2">
                        <svg className="h-4 w-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-text">{alert.message}</h4>
                        <p className="text-text-secondary text-sm mt-1">
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="border-warning text-warning hover:bg-warning hover:text-warning-foreground"
                    >
                      Acknowledge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
