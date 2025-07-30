'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'

interface Table {
  id: string
  number: number
  capacity: number
  status: string
  token: string
}

export default function TableManagement() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ number: '', capacity: '' })

  useEffect(() => {
    fetchTables()
  }, [])

  async function fetchTables() {
    setLoading(true)
    try {
      const res = await fetch('/api/tables')
      const data = await res.json()
      setTables(data)
    } catch (error) {
      toast.error('Failed to fetch tables')
    }
    setLoading(false)
  }

  const createTable = async () => {
    if (!form.number || !form.capacity) {
      toast.error('Please enter table number and capacity')
      return
    }
    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: parseInt(form.number),
          capacity: parseInt(form.capacity),
        }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        setTables(prev => [...prev, data])
        toast.success('Table created')
        setForm({ number: '', capacity: '' })
      }
    } catch {
      toast.error('Failed to create table')
    }
  }

  return (
    <div className="p-8 bg-blueDark min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-8">Table Management</h1>

      {/* Create Table Form */}
      <Card className="p-6 mb-8 max-w-md">
        <h2 className="text-xl font-semibold text-white mb-4">Add New Table</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="number"
            placeholder="Table Number"
            className="flex-1 px-4 py-2 rounded border border-slate-600 text-white bg-blueBase focus:outline-none focus:ring-2 focus:ring-accent"
            value={form.number}
            onChange={e => setForm({ ...form, number: e.target.value })}
          />
          <input
            type="number"
            placeholder="Capacity"
            className="flex-1 px-4 py-2 rounded border border-slate-600 text-white bg-blueBase focus:outline-none focus:ring-2 focus:ring-accent"
            value={form.capacity}
            onChange={e => setForm({ ...form, capacity: e.target.value })}
          />
          <Button onClick={createTable} disabled={!form.number || !form.capacity}>
            Create
          </Button>
        </div>
      </Card>

      {/* Tables Grid */}
      {loading ? (
        <div className="text-white">Loading tables...</div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {tables.map(table => (
            <Card key={table.id} className="p-6 flex flex-col items-center">
              <h3 className="text-2xl font-bold text-accent mb-2">Table {table.number}</h3>
              <p className="text-white mb-2">Capacity: {table.capacity}</p>
              <p className="text-white mb-4">Status: {table.status}</p>
              <p className="text-slate-400 mb-4 break-all text-sm">{table.token}</p>
              {table.token ? (
                // QR code of URL: <your-app-url>/order/{token}
                <QRCodeDisplay token={table.token} />
              ) : (
                <p className="text-slate-400 text-sm">No token available</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function QRCodeDisplay({ token }: { token: string }) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    let url = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/order/${token}`
    QRCode.toDataURL(url, { width: 150, margin: 1 }).then(setSrc).catch(console.error)
  }, [token])

  return (
    <img
      src={src}
      alt={`QR code for table token: ${token}`}
      className="w-40 h-40 object-contain"
    />
  )
}
