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
  const [activeCategory, setActiveCategory] = useState<string>('all')

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
        
        // Set first category as active if items exist
        if (menuData.length > 0) {
          const categories = [...new Set(menuData.map((item: MenuItem) => item.category))]
          setActiveCategory(categories[0] || 'all')
        }
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

 // In the handlePlaceOrder function, replace the router.push line:

async function handlePlaceOrder() {
  if (!table) {
    toast.error('Invalid table')
    return
  }
  if (cart.length === 0) {
    toast.error('Please add at least one item to cart')
    return
  }

  const orderBody = {
    tableId: table.id,
    customerName: `Table ${table.number} Customer`,
    customerPhone: '',
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
    const order = await res.json()
    toast.success('Order placed successfully')
    setCart([])
    // Fixed: Navigate to confirmation page with order ID
    router.push(`/order/${params.token}/confirmation`)
  } catch (error) {
    toast.error('Network error on placing order')
  }
}


  // Get unique categories
  const categories = ['all', ...new Set(menuItems.map(item => item.category))]
  
  // Filter items by active category
  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory)

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-blueDark text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-lg">Loading menu...</p>
        </div>
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
    <div className="min-h-screen bg-blueDark text-white">
      {/* Header */}
      <div className="bg-blueBase shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">{table.restaurantName}</h1>
            <p className="text-accent text-lg">Table {table.number} • Capacity: {table.capacity} {table.capacity === 1 ? 'person' : 'people'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:w-1/4">
            <div className="bg-blueBase rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4">Categories</h2>
              <nav className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors capitalize ${
                      activeCategory === category
                        ? 'bg-accent text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {category === 'all' ? 'All Items' : category}
                  </button>
                ))}
              </nav>

              {/* Cart Summary in Sidebar */}
              {cart.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-600">
                  <h3 className="text-lg font-semibold mb-4">Your Order ({cart.length} items)</h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.menuItemId} className="flex justify-between items-center text-sm">
                        <div className="flex-1">
                          <p className="font-medium truncate">{item.menuItem.name}</p>
                          <p className="text-slate-400">${item.menuItem.price.toFixed(2)} x {item.quantity}</p>
                        </div>
                        <p className="text-accent font-semibold ml-2">
                          ${(item.menuItem.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-600">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-accent">${totalPrice.toFixed(2)}</span>
                    </div>
                    <Button 
                      onClick={handlePlaceOrder} 
                      className="w-full mt-4 bg-accent hover:bg-green-600 text-white py-3 rounded-lg font-semibold"
                    >
                      Place Order
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Menu Items */}
          <div className="lg:w-3/4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold capitalize">
                {activeCategory === 'all' ? 'All Menu Items' : activeCategory}
              </h2>
              <p className="text-slate-400 mt-1">
                {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} available
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((menu) => {
                const cartItem = cart.find((ci) => ci.menuItemId === menu.id)
                return (
                  <div
                    key={menu.id}
                    className="bg-blueBase rounded-xl p-6 flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{menu.name}</h3>
                      <p className="text-slate-400 mb-4 line-clamp-3">{menu.description}</p>
                      <p className="text-accent font-bold text-2xl mb-4">${menu.price.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {cartItem ? (
                        <div className="flex items-center space-x-3 bg-blueDark rounded-lg p-2">
                          <button
                            onClick={() => updateQuantity(menu.id, cartItem.quantity - 1)}
                            className="bg-slate-600 hover:bg-slate-500 rounded-full w-8 h-8 text-white font-bold transition-colors"
                            aria-label={`Decrease quantity of ${menu.name}`}
                          >
                            −
                          </button>
                          <span className="font-semibold min-w-[2rem] text-center">{cartItem.quantity}</span>
                          <button
                            onClick={() => updateQuantity(menu.id, cartItem.quantity + 1)}
                            className="bg-accent hover:bg-green-600 rounded-full w-8 h-8 text-white font-bold transition-colors"
                            aria-label={`Increase quantity of ${menu.name}`}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => addToCart(menu)}
                          className="bg-accent hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-16">
                <p className="text-slate-400 text-lg">No items found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Cart Summary - Fixed Bottom */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 bg-blueBase rounded-xl p-4 shadow-2xl border border-slate-600">
          <div className="flex justify-between items-center mb-3">
            <span className="text-white font-semibold">{cart.length} items</span>
            <span className="text-accent font-bold text-xl">${totalPrice.toFixed(2)}</span>
          </div>
          <Button 
            onClick={handlePlaceOrder} 
            className="w-full bg-accent hover:bg-green-600 text-white py-3 rounded-lg font-semibold"
          >
            Place Order
          </Button>
        </div>
      )}
    </div>
  )
}
