'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
}

interface CartItem {
  menuItemId: string
  menuItem: MenuItem
  quantity: number
}

interface Table {
  id: string
  number: number
  capacity: number
  restaurantName: string
}

export default function CustomerOrder({ params }: { params: { token: string } }) {
  const [table, setTable] = useState<Table | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    validateTableAndLoadMenu()
  }, [params.token])

  async function validateTableAndLoadMenu() {
    setLoading(true)
    try {
      const tableRes = await fetch('/api/table-management/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: params.token }),
      })
      if (!tableRes.ok) {
        toast.error('Invalid table token.')
        setTable(null)
        setMenuItems([])
        setLoading(false)
        return
      }
      const tableData = await tableRes.json()
      setTable(tableData)

      const menuRes = await fetch('/api/menu')
      if (!menuRes.ok) {
        toast.error('Failed to load menu.')
        setMenuItems([])
      } else {
        const menuData = await menuRes.json()
        setMenuItems(menuData)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to load data. Please try again.')
      setTable(null)
      setMenuItems([])
    } finally {
      setLoading(false)
    }
  }

  const categories = ['All', ...Array.from(new Set(menuItems.map(i => i.category)))]

  const filteredItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(i => i.category === activeCategory)

  function addToCart(menuItem: MenuItem) {
    setCart(prev => {
      const existingIndex = prev.findIndex(ci => ci.menuItemId === menuItem.id)
      if (existingIndex !== -1) {
        // increment quantity
        const newCart = [...prev]
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + 1,
        }
        return newCart
      }
      return [...prev, { menuItemId: menuItem.id, menuItem, quantity: 1 }]
    })
  }

  function updateQuantity(menuItemId: string, quantity: number) {
    if (quantity <= 0) {
      // remove item
      setCart(prev => prev.filter(ci => ci.menuItemId !== menuItemId))
    } else {
      setCart(prev => prev.map(ci => ci.menuItemId === menuItemId ? { ...ci, quantity } : ci))
    }
  }

  const totalAmount = cart.reduce((sum, ci) => sum + ci.menuItem.price * ci.quantity, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-blueDark flex items-center justify-center text-white text-lg">
        Loading...
      </div>
    )
  }

  if (!table) {
    return (
      <div className="min-h-screen bg-blueDark flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl text-white mb-4">Invalid Table</h2>
          <p className="text-slate-400 mb-6">
            This QR code is invalid. Please scan a valid table QR code or contact restaurant staff.
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-blueDark">
      {/* Sidebar */}
      <aside className="w-72 bg-blueBase border-r border-slate-800 p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-1">Table {table.number}</h2>
          <p className="text-slate-400 text-sm">{table.restaurantName}</p>
          <p className="text-slate-400 text-sm">Capacity: {table.capacity} {table.capacity === 1 ? 'person' : 'people'}</p>
        </div>

        <h3 className="text-lg font-semibold text-white mb-3">Categories</h3>
        <nav className="space-y-2">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`w-full py-2 px-4 rounded-lg text-left text-sm transition-colors ${
                activeCategory === cat
                  ? 'bg-accent font-semibold text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              aria-current={activeCategory === cat ? 'page' : undefined}
            >
              {cat}
            </button>
          ))}
        </nav>
      </aside>

      {/* Menu Items */}
      <main className="flex-1 p-10 overflow-y-auto">
        <h1 className="text-3xl font-bold text-white mb-2">
          {activeCategory === 'All' ? 'All Menu Items' : activeCategory}
        </h1>
        <p className="text-slate-400 mb-6">
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
        </p>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map(item => {
            const cartItem = cart.find(ci => ci.menuItemId === item.id)
            return (
              <div
                key={item.id}
                className="bg-blueBase rounded-2xl p-6 flex flex-col hover:ring-2 ring-accent transition-transform duration-200"
              >
                <h3 className="text-xl font-semibold text-white mb-2">{item.name}</h3>
                <p className="text-slate-400 flex-grow">{item.description}</p>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-2xl font-bold text-accent">${item.price.toFixed(2)}</span>
                  {cartItem ? (
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.name}`}
                        onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-blueDark flex items-center justify-center text-white hover:bg-blue-600"
                      >
                        –
                      </button>
                      <span className="text-white font-semibold w-8 text-center">{cartItem.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.name}`}
                        onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center hover:bg-green-600"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <Button onClick={() => addToCart(item)}>Add</Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* Cart (sticky bottom-left) */}
      <div className="fixed bottom-0 left-0 m-4 w-96 z-50">
        <div className="bg-blueBase border-t-4 border-bluePri rounded-t-3xl p-6 shadow-lg max-h-[380px] flex flex-col">
          <h3 className="text-xl font-bold text-white mb-4">Your Order</h3>

          {cart.length === 0 ? (
            <p className="text-slate-400 text-center py-16">Your cart is empty</p>
          ) : (
            <>
              <ul className="overflow-y-auto max-h-52 space-y-3 mb-6">
                {cart.map(ci => (
                  <li key={ci.menuItemId} className="flex items-center justify-between">
                    <div className="truncate max-w-xs">
                      <p className="text-white font-semibold truncate">{ci.menuItem.name}</p>
                      <p className="text-slate-400 text-sm">${ci.menuItem.price.toFixed(2)} each</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${ci.menuItem.name}`}
                        onClick={() => updateQuantity(ci.menuItemId, ci.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-blueDark flex items-center justify-center text-white hover:bg-blue-600"
                      >
                        –
                      </button>
                      <span className="text-white font-semibold w-8 text-center">{ci.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${ci.menuItem.name}`}
                        onClick={() => updateQuantity(ci.menuItemId, ci.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center hover:bg-green-600"
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-slate-600 pt-4">
                <div className="flex justify-between text-white text-2xl font-bold">
                  <span>Total:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <Link
                href={{
                  pathname: `/order/${params.token}/checkout`,
                  query: { cart: JSON.stringify(cart.map(({ menuItemId, quantity }) => ({ menuItemId, quantity }))) },
                }}
                className="block mt-6"
              >
                <Button className="w-full" disabled={cart.length === 0}>
                  Proceed to Checkout
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
