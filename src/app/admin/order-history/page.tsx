'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { exportOrders } from '@/lib/export'
import useSWR from 'swr'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default function OrderHistory() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 20

  const { data: orders = [] } = useSWR(
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

  return (
    <div className="p-10 min-h-screen bg-blueDark">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Order History</h1>
          <div className="flex items-center gap-4">
            <DatePicker
              selected={selectedDate}
              onChange={date => {
                setSelectedDate(date)
                setCurrentPage(1)
              }}
              placeholderText="Filter by date"
              className="bg-blueBase rounded-lg px-3 py-2 text-white border border-slate-600"
            />
            <Button onClick={handleExport}>Export Excel</Button>
          </div>
        </div>

        <table className="w-full text-white text-sm border-collapse border border-slate-700 rounded-md">
          <thead className="bg-blueBase border-b border-slate-600">
            <tr>
              <th className="py-2 px-4 text-left">Order #</th>
              <th className="py-2 px-4 text-left">Table</th>
              <th className="py-2 px-4 text-left">Total</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-4 text-slate-400">
                  No orders found.
                </td>
              </tr>
            )}
            {orders.map((order: any) => (
              <tr key={order.id} className="border-b border-slate-700">
                <td className="py-2 px-4">{order.orderNumber}</td>
                <td className="py-2 px-4">Table {order.table.number}</td>
                <td className="py-2 px-4">${order.total.toFixed(2)}</td>
                <td className="py-2 px-4">{order.status}</td>
                <td className="py-2 px-4">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-between items-center">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            variant="outline"
          >
            Previous
          </Button>
          <div className="text-white">Page {currentPage}</div>
          <Button
            disabled={orders.length < ordersPerPage}
            onClick={() => setCurrentPage(p => p + 1)}
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
