
'use client'
export const dynamic = "force-dynamic";

import useSWR from 'swr'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface Table {
  id: string
  number: number
  orders: any[]
}

export default function ActiveOrders() {
  const { data: tables, isLoading } = useSWR<Table[]>('/api/admin/active-orders', (url: string) =>
    fetch(url).then(res => res.json())
  )

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text mb-2">Active Orders</h1>
            <p className="text-text-secondary">Tables currently with active orders</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Active Orders</h1>
          <p className="text-text-secondary">Tables currently with active orders</p>
        </div>

        {(tables ?? []).length === 0 ? (
          <Card className="card">
            <CardContent className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-text mb-2">No Active Orders</h3>
              <p className="text-text-secondary">All tables are currently available with no pending orders.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(tables ?? []).map(table => (
              <Card key={table.id} className="card card-interactive">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-text flex items-center justify-between">
                    Table {table.number}
                    <div className="h-2 w-2 bg-primary rounded-full"></div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-text-secondary text-sm">
                      {table.orders.length} active order{table.orders.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Link href={`/admin/active-orders/table/${table.id}`} className="block">
                    <Button className="w-full btn-default bg-primary text-primary-foreground hover:bg-primary/90">
                      View Orders
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

