'use client'
import useSWR from 'swr'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export default function RecipesPage() {
  const { data: items = [] } = useSWR(`/api/recipes`, u => fetch(u).then(r=>r.json()))
  const [form, setForm] = useState<{menuItemId?: string, inventoryItemId?: string, quantity?: number}>({})
  const [refresh, setRefresh] = useState(0)
  const { data: menu = [] } = useSWR(`/api/menu`)
  const { data: inv = [] } = useSWR(`/api/inventory`)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/recipes', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(form)
    })
    setForm({})
    setRefresh(r => r+1)
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-white">Recipe Management</h1>
      <form className="flex gap-2 bg-blueBase rounded-lg p-4" onSubmit={save}>
        <select required value={form.menuItemId||''} onChange={e=>setForm(f=>({...f, menuItemId: e.target.value}))}
          className="rounded p-2 bg-blueDark text-white">
          <option value="">Menu Item</option>
          {menu.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select required value={form.inventoryItemId||''} onChange={e=>setForm(f=>({...f, inventoryItemId: e.target.value}))}
          className="rounded p-2 bg-blueDark text-white">
          <option value="">Ingredient</option>
          {inv.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        <input type="number" required placeholder="Qty" className="rounded p-2 bg-blueDark text-white"
          value={form.quantity||0} onChange={e=>setForm(f=>({...f, quantity:+(e.target.value)}))}/>
        <Button type="submit">Add</Button>
      </form>
      <table className="w-full bg-blueBase">
        <thead>
          <tr className="text-slate-400">
            <th className="px-4 py-2">Menu Item</th>
            <th>Ingredient</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r:any) => (
              <tr key={r.id} className="border-b border-slate-700">
                <td className="px-4 py-2">{r.menuItem.name}</td>
                <td>{r.inventoryItem.name}</td>
                <td>{r.quantity}</td>
              </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
