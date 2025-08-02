'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
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
    try {
      const tableRes = await fetch('/api/tables/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: params.token }),
      })
      if (!tableRes.ok) {
        toast.error('Invalid table token')
        setTable(null)
        setLoading(false)
        return
      }
      const tableData = await tableRes.json()
      setTable(tableData)

      const menuRes = await fetch('/api/menu')
      if (!menuRes.ok) {
        toast.error('Failed to load menu')
        setMenuItems([])
      } else {
        const menuData = await menuRes.json()
        setMenuItems(menuData)
      }
    } catch {
      toast.error('Failed to load data')
      setTable(null)
      setMenuItems([])
    }
    setLoading(false)
  }

  const categories = ['All', ...Array.from(new Set(menuItems.map(i => i.category)))]

  const filteredItems =
    activeCategory === 'All'
      ? menuItems
      : menuItems.filter(i => i.category === activeCategory)

  const addToCart = (menuItem: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(ci => ci.menuItemId === menuItem.id)
      if (existing) {
        return prev.map(ci =>
          ci.menuItemId === menuItem.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        )
      }
      return [...prev, { menuItemId: menuItem.id, menuItem, quantity: 1 }]
    })
  }

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(ci => ci.menuItemId !== menuItemId))
    } else {
      setCart(prev =>
        prev.map(ci =>
          ci.menuItemId === menuItemId ? { ...ci, quantity } : ci
        )
      )
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
          <h2 className="text-2xl text-white mb-4">Invalid Table QR Code</h2>
          <p className="text-slate-400 mb-6">Please scan a valid QR code or contact staff.</p>
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
          <h2 className="text-2xl font-bold text-white mb-1">Table {table.number}</h2>
          <p className="text-slate-400 text-sm mb-1">{table.restaurantName}</p>
          <p className="text-slate-400 text-sm">Capacity: {table.capacity} people</p>
        </div>

        <h3 className="text-lg font-semibold text-white mb-3">Categories</h3>
        <nav className="space-y-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`w-full py-2 px-4 rounded-lg text-left text-sm transition-colors ${
                activeCategory === cat
                  ? 'bg-accent font-semibold text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
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
          Choose from {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
        </p>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map(item => {
            const cartItem = cart.find(ci => ci.menuItemId === item.id)
            return (
              <div
                key={item.id}
                className="bg-blueBase rounded-2xl p-6 flex flex-col hover:ring-2 hover:ring-accent transition duration-200 hover:scale-105"
              >
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-2">{item.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">{item.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-accent font-bold text-xl">${item.price.toFixed(2)}</span>

                  {cartItem ? (
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        aria-label={`Decrease ${item.name} quantity`}
                        onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="text-white font-medium w-8 text-center">{cartItem.quantity}</span>
                      <Button
                        size="sm"
                        aria-label={`Increase ${item.name} quantity`}
                        onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => addToCart(item)} aria-label={`Add ${item.name} to cart`}>
                      Add
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* Sticky Cart (bottom-left) */}
      <div className="fixed bottom-0 left-0 m-4 w-96 z-50">
        <div className="bg-blueBase border-t-4 border-bluePri rounded-t-2xl p-6 shadow-2xl max-h-[350px] flex flex-col">
          <h3 className="text-white font-bold text-lg mb-4">Your Order</h3>

          {cart.length > 0 ? (
            <>
              <ul className="overflow-y-auto mb-4 flex-1 space-y-3">
                {cart.map(ci => (
                  <li key={ci.menuItemId} className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{ci.menuItem.name}</p>
                      <p className="text-slate-400 text-sm">${ci.menuItem.price.toFixed(2)} each</p>
                    </div>

                    <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                      <button
                        onClick={() => updateQuantity(ci.menuItemId, ci.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-slate-700 text-white hover:bg-slate-600 flex items-center justify-center"
                        aria-label={`Decrease quantity of ${ci.menuItem.name}`}
                      >
                        –
                      </button>
                      <span className="w-8 text-center text-white font-medium">{ci.quantity}</span>
                      <button
                        onClick={() => updateQuantity(ci.menuItemId, ci.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-accent text-white hover:bg-bluePri flex items-center justify-center"
                        aria-label={`Increase quantity of ${ci.menuItem.name}`}
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-slate-600 pt-4 mb-4">
                <div className="flex justify-between items-center text-white text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-accent">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <Link
                href={{
                  pathname: `/order/${params.token}/checkout`,
                  query: {
                    cart: JSON.stringify(
                      cart.map(ci => ({
                        menuItemId: ci.menuItemId,
                        quantity: ci.quantity,
                        price: ci.menuItem.price,
                        name: ci.menuItem.name,
                      }))
                    ),
                  },
                }}
              >
                <Button className="w-full" aria-label="Proceed to Checkout">
                  Proceed to Checkout (${totalAmount.toFixed(2)})
                </Button>
              </Link>
            </>
          ) : (
            <p className="text-slate-400 text-center py-14">Your cart is empty</p>
          )}
        </div>
      </div>
    </div>
  )
}
