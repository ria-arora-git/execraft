'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
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

export default function CustomerOrderPage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const [table, setTable] = useState<Table | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  useEffect(() => {
    async function fetchTableAndMenu() {
      setLoading(true)
      try {
        const resTable = await fetch('/api/tables/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: params.token }),
        })
        if (!resTable.ok) throw new Error('Invalid table token')
        const tableData = await resTable.json()
        setTable(tableData)

        const resMenu = await fetch('/api/menu')
        if (!resMenu.ok) throw new Error('Failed to load menu')
        const menuData = await resMenu.json()
        setMenuItems(menuData)
      } catch (error) {
        toast.error((error as Error).message || 'Failed to load data')
        setTable(null)
        setMenuItems([])
      } finally {
        setLoading(false)
      }
    }
    fetchTableAndMenu()
  }, [params.token])

  function addToCart(menuItem: MenuItem) {
    setCart((prev) => {
      const exists = prev.find((item) => item.menuItemId === menuItem.id)
      if (exists) {
        return prev.map((item) =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { menuItemId: menuItem.id, menuItem, quantity: 1 }]
    })
  }

  function updateQuantity(menuItemId: string, quantity: number) {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.menuItemId !== menuItemId))
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.menuItemId === menuItemId ? { ...item, quantity } : item
        )
      )
    }
  }

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  )

  async function handlePlaceOrder() {
    if (!table) {
      toast.error('Invalid table')
      return
    }
    if (!customerName.trim()) {
      toast.error('Please enter your name')
      return
    }
    if (cart.length === 0) {
      toast.error('Please add at least one item to cart')
      return
    }

    const orderBody = {
      tableId: table.id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: cart.map(({ menuItemId, quantity }) => ({
        menuItemId,
        quantity,
      })),
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderBody),
      })
      if (!res.ok) {
        const error = await res.json()
        toast.error(error.error || 'Failed to place order')
        return
      }
      toast.success('Order placed successfully')
      // Reset form
      setCart([])
      setCustomerName('')
      setCustomerPhone('')
      router.push(`/order/${params.token}/confirmation`) // Optional - confirmation page
    } catch (error) {
      toast.error('Network error on placing order')
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-blueDark text-white">
        Loading...
      </div>
    )

  if (!table)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blueDark text-white p-4">
        <h2 className="text-3xl mb-4">Invalid Table QR Code</h2>
        <p className="mb-6 text-center">
          The scanned QR code is invalid. Please use a valid QR code or contact
          restaurant staff.
        </p>
      </div>
    )

  return (
    <div className="min-h-screen bg-blueDark text-white p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Table {table.number} - {table.restaurantName}</h1>
      <p className="mb-6 text-slate-400">Capacity: {table.capacity} {table.capacity === 1 ? 'person' : 'people'}</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Info</h2>
        <div className="flex flex-col space-y-4 max-w-md">
          <input
            type="text"
            placeholder="Your Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="p-3 rounded bg-blueBase border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            type="tel"
            placeholder="Phone Number (Optional)"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="p-3 rounded bg-blueBase border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Menu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((menu) => {
            const cartItem = cart.find((ci) => ci.menuItemId === menu.id)
            return (
              <div
                key={menu.id}
                className="bg-blueBase rounded-lg p-6 flex flex-col justify-between shadow"
              >
                <div>
                  <h3 className="text-xl font-semibold mb-2">{menu.name}</h3>
                  <p className="text-slate-400 mb-4">{menu.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-accent font-bold text-xl">${menu.price.toFixed(2)}</span>
                  {cartItem ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(menu.id, cartItem.quantity - 1)}
                        className="bg-blueDark rounded-full w-8 h-8 text-white hover:bg-blue-600"
                        aria-label={`Decrease quantity of ${menu.name}`}
                      >
                        −
                      </button>
                      <span>{cartItem.quantity}</span>
                      <button
                        onClick={() => updateQuantity(menu.id, cartItem.quantity + 1)}
                        className="bg-accent rounded-full w-8 h-8 text-white hover:bg-green-600"
                        aria-label={`Increase quantity of ${menu.name}`}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <Button onClick={() => addToCart(menu)}>Add</Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Order summary & place order */}
      <section className="sticky bottom-0 bg-blueBase p-4 rounded-t-lg shadow-lg max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="text-white text-xl font-bold">Total:</span>
          <span className="text-accent text-xl font-bold">${totalPrice.toFixed(2)}</span>
        </div>
        <Button onClick={handlePlaceOrder} disabled={cart.length === 0 || !customerName.trim()}>
          Place Order
        </Button>
      </section>
    </div>
  )
}
