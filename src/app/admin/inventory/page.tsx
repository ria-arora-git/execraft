'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  minStock: number
  maxStock: number
}

export default function InventoryPage() {
  const { data: items = [], mutate } = useSWR<InventoryItem[]>(`/api/inventory`, u => fetch(u).then(r => r.json()))
  const [form, setForm] = useState<Partial<InventoryItem>>({})
  const [editing, setEditing] = useState<string | null>(null)

  const reset = () => {
    setEditing(null)
    setForm({})
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editing ? 'PUT' : 'POST'
    await fetch('/api/inventory', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    mutate()
    reset()
  }

  const remove = async (id: string) => {
    await fetch(`/api/inventory?id=${id}`, { method: 'DELETE' })
    mutate()
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-white">Inventory Management</h1>

      <form onSubmit={save} className="space-x-4 flex flex-wrap bg-blueBase p-4 rounded-xl">
        <input className="rounded p-2 bg-blueDark text-white" style={{width: '15ch'}} required placeholder="Name" value={form.name || ''} onChange={e => setForm(f=>({...f, name: e.target.value }))}/>
        <input className="rounded p-2 bg-blueDark text-white" style={{width: '12ch'}} required placeholder="Category" value={form.category || ''} onChange={e => setForm(f=>({...f, category: e.target.value }))}/>
        <input className="rounded p-2 bg-blueDark text-white" type="number" required placeholder="Qty" value={form.quantity || 0} onChange={e => setForm(f=>({...f, quantity: +(e.target.value) }))}/>
        <input className="rounded p-2 bg-blueDark text-white" style={{width: '8ch'}} required placeholder="Unit" value={form.unit || ''} onChange={e => setForm(f=>({...f, unit: e.target.value }))}/>
        <input className="rounded p-2 bg-blueDark text-white" type="number" required placeholder="Min" value={form.minStock || 0} onChange={e => setForm(f=>({...f, minStock: +(e.target.value) }))}/>
        <input className="rounded p-2 bg-blueDark text-white" type="number" required placeholder="Max" value={form.maxStock || 0} onChange={e => setForm(f=>({...f, maxStock: +(e.target.value) }))}/>
        <Button type="submit">{editing ? 'Update' : 'Add'} Item</Button>
        {editing && <Button variant="outline" type="button" onClick={reset}>Cancel</Button>}
      </form>

      <table className="w-full bg-blueBase rounded-lg overflow-hidden">
        <thead>
          <tr className="text-slate-400">
            <th className="px-4 py-2 text-left">Name</th>
            <th>Category</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Min</th>
            <th>Max</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map(item =>
            <tr key={item.id} className="border-b border-slate-700 hover:bg-blueDark">
              <td className="px-4 py-2">{item.name}</td>
              <td>{item.category}</td>
              <td>{item.quantity}</td>
              <td>{item.unit}</td>
              <td>{item.minStock}</td>
              <td>{item.maxStock}</td>
              <td>
                <Button size="xs" variant="outline" onClick={()=>{ setEditing(item.id); setForm(item) }}>Edit</Button>
                <Button size="xs" variant="outline" onClick={()=>remove(item.id)}>Delete</Button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
