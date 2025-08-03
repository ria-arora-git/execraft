'use client'
export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'

interface Table {
  id: string
  number: number
  capacity: number
  status: string
  token: string
  orders: { id: string; status: string; total: number }[]
}

export default function TableManagement() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ number: '', capacity: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables')
      if (response.ok) {
        const data = await response.json()
        setTables(data)
      } else {
        toast.error('Failed to fetch tables')
      }
    } catch (error) {
      toast.error('Error fetching tables')
    }
    setLoading(false)
  }

  const createTable = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: parseInt(form.number),
          capacity: parseInt(form.capacity)
        })
      })

      if (response.ok) {
        toast.success('Table created successfully')
        setForm({ number: '', capacity: '' })
        fetchTables()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create table')
      }
    } catch (error) {
      toast.error('Error creating table')
    }
    setSubmitting(false)
  }

  const deleteTable = async (id: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return

    try {
      const response = await fetch(`/api/tables?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Table deleted successfully')
        fetchTables()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete table')
      }
    } catch (error) {
      toast.error('Error deleting table')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-white">Loading tables...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 bg-blueDark min-h-screen">
      <h1 className="text-3xl font-bold text-white">Table Management</h1>

      {/* Create Table Form */}
      <form onSubmit={createTable} className="bg-blueBase p-6 rounded-xl space-y-4">
        <h2 className="text-xl font-semibold text-white">Add New Table</h2>
        <div className="flex gap-4">
          <input
            type="number"
            placeholder="Table Number"
            required
            min="1"
            value={form.number}
            onChange={e => setForm({ ...form, number: e.target.value })}
            className="px-4 py-2 rounded border border-slate-600 text-white bg-blueDark focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            type="number"
            placeholder="Capacity"
            required
            min="1"
            max="20"
            value={form.capacity}
            onChange={e => setForm({ ...form, capacity: e.target.value })}
            className="px-4 py-2 rounded border border-slate-600 text-white bg-blueDark focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <Button type="submit" disabled={submitting || !form.number || !form.capacity}>
            {submitting ? 'Creating...' : 'Create Table'}
          </Button>
        </div>
      </form>

      {/* Tables Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {tables.map(table => (
          <TableCard
            key={table.id}
            table={table}
            onDelete={() => deleteTable(table.id)}
          />
        ))}
      </div>
    </div>
  )
}

function TableCard({ table, onDelete }: { table: Table; onDelete: () => void }) {
  const [qrCode, setQrCode] = useState('')

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order/${table.token}`
        const qr = await QRCode.toDataURL(url, { width: 200, margin: 1 })
        setQrCode(qr)
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }
    generateQR()
  }, [table.token])

  const activeOrdersCount = table.orders?.length || 0
  const totalRevenue = table.orders?.reduce((sum, order) => sum + order.total, 0) || 0

  return (
    <div className="bg-blueBase p-6 rounded-xl flex flex-col items-center space-y-4">
      <h3 className="text-2xl font-bold text-accent">Table {table.number}</h3>
      <div className="text-center">
        <p className="text-white">Capacity: {table.capacity}</p>
        <p className="text-white">Status: {table.status}</p>
        <p className="text-slate-400">Active Orders: {activeOrdersCount}</p>
        {totalRevenue > 0 && (
          <p className="text-green-400">Revenue: ${totalRevenue.toFixed(2)}</p>
        )}
      </div>
      
      {qrCode && (
        <div className="text-center">
          <img src={qrCode} alt={`QR code for table ${table.number}`} className="w-40 h-40" />
          <p className="text-slate-400 text-xs mt-2 break-all">{table.token}</p>
        </div>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
        disabled={activeOrdersCount > 0}
      >
        Delete Table
      </Button>
      
      {activeOrdersCount > 0 && (
        <p className="text-yellow-400 text-xs text-center">
          Cannot delete table with active orders
        </p>
      )}
    </div>
  )
}
