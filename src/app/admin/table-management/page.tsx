'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function TableManagement() {
  const [isAdding, setIsAdding] = useState(false)
  const [number, setNumber] = useState('')
  const [capacity, setCapacity] = useState('')

  const { data: tablesRaw, error } = useSWR('/api/tables', fetcher)
  const tables = Array.isArray(tablesRaw) ? tablesRaw : []

  if (error) return <div className="p-8 text-red-500">Failed to load tables.</div>

  async function addTable() {
    if (!number || !capacity) {
      toast.error('Please fill all fields.')
      return
    }
    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: +number, capacity: +capacity })
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Failed to add table')
        return
      }
      toast.success('Table added.')
      setNumber('')
      setCapacity('')
      setIsAdding(false)
      mutate('/api/tables')
    } catch {
      toast.error('Network error.')
    }
  }

  async function deleteTable(id: string) {
    if (!confirm('Delete this table?')) return
    try {
      const res = await fetch(`/api/tables?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Table deleted.')
        mutate('/api/tables')
      } else {
        toast.error('Failed to delete table.')
      }
    } catch {
      toast.error('Network error.')
    }
  }

  return (
    <div className="p-8 bg-blueDark text-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Table Management</h1>
        <Button onClick={() => setIsAdding(true)} className="bg-accent hover:bg-green-600">Add Table</Button>
      </div>

      {isAdding && (
        <div className="bg-blueBase p-6 rounded mb-8 max-w-md">
          <h2 className="text-xl font-bold mb-4">Add New Table</h2>
          <input
            type="number"
            placeholder="Table Number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full mb-4 p-2 rounded bg-blueDark border border-slate-600"
          />
          <input
            type="number"
            placeholder="Capacity"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full mb-4 p-2 rounded bg-blueDark border border-slate-600"
          />
          <div className="flex space-x-4">
            <Button onClick={addTable} className="bg-accent hover:bg-green-600 flex-1">Add</Button>
            <Button onClick={() => setIsAdding(false)} variant="outline" className="flex-1">Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <div key={table.id} className="bg-blueBase p-6 rounded border border-slate-600 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold">Table {table.number}</h3>
              <p className="text-slate-400">Capacity: {table.capacity}</p>
              <p className={`text-sm ${table.status === 'AVAILABLE' ? 'text-green-500' : 'text-yellow-500'}`}>
                {table.status}
              </p>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <button
                className="text-blue-400 hover:text-blue-600"
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/order/${table.token}`)}
                title="Copy QR URL"
              >
                Copy QR URL
              </button>
              <Button
                onClick={() => deleteTable(table.id)}
                variant="outline"
                className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
