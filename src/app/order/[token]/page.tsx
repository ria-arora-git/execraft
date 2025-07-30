'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

const demoMenu = [
  { id: '1', name: 'Spring Rolls', description: 'Crispy veg spring rolls', price: 8.99, category: 'Appetizers' },
  { id: '2', name: 'Margherita Pizza', description: 'Classic pizza with mozzarella', price: 16.99, category: 'Main Course' },
  { id: '3', name: 'Beef Steak', description: 'Ribeye steak', price: 28.99, category: 'Main Course' },
  { id: '4', name: 'Chocolate Cake', description: 'Rich chocolate cake', price: 7.99, category: 'Desserts' },
]

const categories = ['All', ...Array.from(new Set(demoMenu.map(i => i.category)))]

export default function CustomerOrder({ params }: { params: { token: string } }) {
  const [active, setActive] = useState('All')
  const [cart, setCart] = useState<Record<string, number>>({})

  const filtered = active === 'All' ? demoMenu : demoMenu.filter(i => i.category === active)
  const items = Object.entries(cart).map(([id, qty]) => ({ ...demoMenu.find(item => item.id === id)!, qty }))

  return (
    <div className="flex min-h-screen bg-blueDark">
      {/* Sidebar */}
      <aside className="w-56 bg-blueBase border-r border-slate-700 p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Menu</h2>
          <p className="text-slate-400 text-sm">Choose a category</p>
        </div>
        <nav>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`w-full py-2 mb-2 rounded-lg transition ${cat === active ? 'bg-accent text-white font-semibold' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              {cat}
            </button>
          ))}
        </nav>
        <div className="mt-8">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="w-full">Admin Portal</Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold text-white mb-8">{active} Items</h1>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-blueBase p-6 rounded-2xl flex flex-col hover:ring-2 hover:ring-accent transition">
              <div className="font-semibold text-lg mb-1 text-white">{item.name}</div>
              <div className="mb-2 text-slate-400">{item.description}</div>
              <div className="text-accent text-xl font-bold mb-4">${item.price.toFixed(2)}</div>
              <div className="mt-auto flex items-center gap-2">
                {cart[item.id] ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => setCart(c => ({ ...c, [item.id]: Math.max(0, c[item.id] - 1) }))}
                    >-</Button>
                    <span className="text-white w-5 text-center">{cart[item.id]}</span>
                    <Button
                      size="sm"
                      onClick={() => setCart(c => ({ ...c, [item.id]: c[item.id] + 1 }))}
                    >+</Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setCart(c => ({ ...c, [item.id]: 1 }))}
                  >Add</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Sticky Cart */}
      <div className="fixed bottom-0 right-0 md:right-10 md:w-96 w-full z-50">
        <div className="bg-blueBase border-t-4 border-bluePri rounded-t-2xl p-6 shadow-2xl">
          <h3 className="font-bold text-lg mb-4 text-white">Your Basket</h3>
          {items.length > 0 ? (
            <>
              <ul className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {items.map(ci => (
                  <li key={ci.id} className="flex justify-between items-center">
                    <span className="text-white">{ci.qty} x {ci.name}</span>
                    <span className="text-accent font-semibold">${(ci.price * ci.qty).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-slate-600 pt-4 mb-4">
                <div className="flex justify-between items-center text-xl font-bold text-white">
                  <span>Total:</span>
                  <span className="text-accent">${items.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2)}</span>
                </div>
              </div>
              <Link
                href={{
                  pathname: `/order/${params.token}/checkout`,
                  query: { cart: JSON.stringify(cart) }
                }}
              >
                <Button className="w-full">Proceed to Checkout</Button>
              </Link>
            </>
          ) : (
            <p className="text-slate-400 text-center py-8">Your basket is empty</p>
          )}
        </div>
      </div>
    </div>
  )
}
