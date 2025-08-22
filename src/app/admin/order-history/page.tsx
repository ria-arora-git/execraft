'use client'
export const dynamic = "force-dynamic";

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { exportOrders } from '@/lib/export'
import useSWR from 'swr'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default function OrderHistory() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 20

  const { data: orders = [], isLoading } = useSWR(
    selectedDate
      ? `/api/admin/order-history?date=${selectedDate.toISOString()}&skip=${
          (currentPage - 1) * ordersPerPage
        }&take=${ordersPerPage}`
      : `/api/admin/order-history?skip=${
          (currentPage - 1) * ordersPerPage
        }&take=${ordersPerPage}`,
    (url: string) => fetch(url).then(res => res.json())
  )

  const handleExport = () => {
    exportOrders(orders, 'order-history')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-success/20 text-success border-success/30'
      case 'CANCELLED': return 'bg-error/20 text-error border-error/30'
      case 'SERVED': return 'bg-info/20 text-info border-info/30'
      default: return 'bg-secondary text-text border-border'
    }
  }

  return (
    <div className="p-4 sm:p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text">Order History</h1>
            <p className="text-text-secondary mt-1">View and export historical order data</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <DatePicker
              selected={selectedDate}
              onChange={date => {
                setSelectedDate(date)
                setCurrentPage(1)
              }}
              placeholderText="Filter by date"
              className="form-control w-full sm:w-48"
            />
            <Button onClick={handleExport} className="btn-primary">
              Export Excel
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <Card className="card">
            <CardContent className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-text mb-2">No Orders Found</h3>
              <p className="text-text-secondary">
                {selectedDate 
                  ? 'No orders found for the selected date.'
                  : 'No order history available yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Order #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Table
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-secondary/50">
                        <td className="px-4 py-3 text-sm font-medium text-text">
                          {order.orderNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-text">
                          Table {order.table?.number}
                        </td>
                        <td className="px-4 py-3 text-sm text-text">
                          {order.customerName}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-primary">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {new Date(order.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <div className="text-text-secondary text-sm">
                Showing page {currentPage} of order history
              </div>
              <div className="flex gap-2">
                <Button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  disabled={orders.length < ordersPerPage}
                  onClick={() => setCurrentPage(p => p + 1)}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
