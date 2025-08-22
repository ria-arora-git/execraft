'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import toast from 'react-hot-toast'
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Filter,
  X,
  ChefHat,
  Clock,
  Star,
  Loader2,
  Heart
} from 'lucide-react'

interface MenuItem {
  id: string
  name: string
  description: string
  price?: number
  category?: string | null
  prepTime?: number
  image?: string | null
}

interface CartItem {
  menuItemId: string
  menuItem: MenuItem
  quantity: number
  notes?: string
}

interface Table {
  id: string
  number: number
  capacity: number
  restaurantName: string
}

interface CustomerOrderPageProps {
  params: {
    token: string
  }
}

export default function EnhancedCustomerOrderPage({ params }: CustomerOrderPageProps) {
  const router = useRouter()
  const [table, setTable] = useState<Table | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart-${params.token}`)
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error('Failed to parse saved cart:', error)
      }
    }
  }, [params.token])

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem(`cart-${params.token}`, JSON.stringify(cart))
    } else {
      localStorage.removeItem(`cart-${params.token}`)
    }
  }, [cart, params.token])

  const fetchTableAndMenu = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch table data
      const resTable = await fetch('/api/tables/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: params.token }),
      })
      
      if (!resTable.ok) throw new Error('Invalid table token')
      const tableData: Table = await resTable.json()
      setTable(tableData)

      // Fetch menu data
      const resMenu = await fetch(`/api/menu?tableToken=${params.token}`)
      if (!resMenu.ok) throw new Error('Failed to load menu')
      const menuData: MenuItem[] = await resMenu.json()
      setMenuItems(menuData)

      // Set initial category
      const categories = getCategories(menuData)
      setActiveCategory(categories.length > 0 ? categories[0] : 'all')
    } catch (error) {
      toast.error((error as Error).message || 'Failed to load data')
      setTable(null)
      setMenuItems([])
    } finally {
      setLoading(false)
    }
  }, [params.token])

  useEffect(() => {
    fetchTableAndMenu()
  }, [fetchTableAndMenu])

  const getCategories = (items: MenuItem[]) => {
    const cats = [...new Set(
      items
        .map(item => item.category)
        .filter((cat): cat is string => typeof cat === 'string' && cat.trim().length > 0)
    )]
    return ['all', ...cats]
  }

  const filteredItems = useMemo(() => {
    let items = menuItems
    
    // Filter by category
    if (activeCategory !== 'all') {
      items = items.filter(item => item.category === activeCategory)
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      )
    }
    
    return items
  }, [menuItems, activeCategory, searchQuery])

  const categories = useMemo(() => getCategories(menuItems), [menuItems])

  const addToCart = (menuItem: MenuItem) => {
    setCart(prev => {
      const exists = prev.find(item => item.menuItemId === menuItem.id)
      if (exists) {
        return prev.map(item =>
          item.menuItemId === menuItem.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      }
      return [...prev, { menuItemId: menuItem.id, menuItem, quantity: 1 }]
    })
    toast.success(`${menuItem.name} added to cart`)
  }

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.menuItemId !== menuItemId))
    } else {
      setCart(prev =>
        prev.map(item => (item.menuItemId === menuItemId ? { ...item, quantity } : item))
      )
    }
  }

  const toggleFavorite = (menuItemId: string) => {
    setFavorites(prev => {
      const newFavs = new Set(prev)
      if (newFavs.has(menuItemId)) {
        newFavs.delete(menuItemId)
      } else {
        newFavs.add(menuItemId)
      }
      return newFavs
    })
  }

  const totalPrice = cart.reduce((sum, item) => {
    const price = item.menuItem.price ?? 0
    return sum + price * item.quantity
  }, 0)

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handlePlaceOrder = async () => {
    if (!table) {
      toast.error('Invalid table')
      return
    }
    if (cart.length === 0) {
      toast.error('Please add at least one item to cart')
      return
    }

    setSubmitting(true)
    const orderBody = {
      tableId: table.id,
      customerName: `Table ${table.number} Customer`,
      customerPhone: '',
      items: cart.map(({ menuItemId, quantity }) => ({ menuItemId, quantity })),
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderBody),
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        toast.error(errorData.error || 'Failed to place order')
        return
      }
      
      toast.success('Order placed successfully!')
      setCart([])
      localStorage.removeItem(`cart-${params.token}`)
      router.push(`/order/${params.token}/confirmation`)
    } catch {
      toast.error('Network error while placing order')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
          <p className="text-lg text-[var(--color-text-primary)]">Loading menu...</p>
        </div>
      </div>
    )
  }

  if (!table) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-background)] p-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-[var(--color-error-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-[var(--color-error)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Invalid Table QR Code</h2>
          <p className="text-[var(--color-text-secondary)] mb-6">
            The scanned QR code is invalid. Please use a valid QR code or contact restaurant staff.
          </p>
          <Button onClick={() => router.push('/')} variant="outline">
            Go to Homepage
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm sticky top-0 z-40">
        <div className="container py-4 sm:py-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-1">
              {table.restaurantName}
            </h1>
            <p className="text-[var(--color-primary)] font-medium">
              Table {table.number} • Capacity: {table.capacity} {table.capacity === 1 ? 'person' : 'people'}
            </p>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="sm:w-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Category Filters */}
          {showFilters && (
            <Card className="bg-[var(--color-surface)] border-[var(--color-border)]">
              <CardContent className="p-4">
                <p className="font-medium text-[var(--color-text-primary)] mb-3">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                        category === activeCategory
                          ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                          : 'bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background-tertiary)]'
                      }`}
                    >
                      {category === 'all' ? 'All Items' : category}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Menu Items */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] capitalize">
                {activeCategory === 'all' ? 'All Menu Items' : activeCategory}
              </h2>
              <p className="text-[var(--color-text-secondary)]">
                {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
              </p>
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-16">
                <ChefHat className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  No items found
                </h3>
                <p className="text-[var(--color-text-secondary)]">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredItems.map(menu => {
                  const cartItem = cart.find(ci => ci.menuItemId === menu.id)
                  const isFavorite = favorites.has(menu.id)
                  
                  return (
                    <Card 
                      key={menu.id} 
                      className="bg-[var(--color-surface)] border-[var(--color-border)] hover:shadow-lg transition-all duration-200 overflow-hidden group"
                    >
                      <CardContent className="p-0">
                        {/* Image placeholder */}
                        <div className="h-48 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center relative overflow-hidden">
                          <ChefHat className="w-12 h-12 text-white opacity-75" />
                          <button
                            onClick={() => toggleFavorite(menu.id)}
                            className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
                          >
                            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                          </button>
                        </div>
                        
                        <div className="p-4">
                          <div className="mb-3">
                            <h3 className="font-semibold text-[var(--color-text-primary)] mb-1 line-clamp-1">
                              {menu.name}
                            </h3>
                            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
                              {menu.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <p className="text-2xl font-bold text-[var(--color-primary)]">
                                ${(menu.price ?? 0).toFixed(2)}
                              </p>
                              {menu.prepTime && (
                                <div className="flex items-center text-[var(--color-text-muted)]">
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span className="text-xs">{menu.prepTime}min</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Cart Controls */}
                          {cartItem ? (
                            <div className="flex items-center justify-between bg-[var(--color-background-secondary)] rounded-lg p-2">
                              <button
                                onClick={() => updateQuantity(menu.id, cartItem.quantity - 1)}
                                className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-background-tertiary)] transition-colors"
                              >
                                <Minus className="w-4 h-4 text-[var(--color-text-primary)]" />
                              </button>
                              <span className="font-semibold text-[var(--color-text-primary)] px-4">
                                {cartItem.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(menu.id, cartItem.quantity + 1)}
                                className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] flex items-center justify-center hover:bg-[var(--color-primary-hover)] transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => addToCart(menu)}
                              className="w-full"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add to Cart
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Cart Sidebar - Desktop */}
          <div className="hidden lg:block w-80">
            <div className="sticky top-24">
              <CartSidebar
                cart={cart}
                totalPrice={totalPrice}
                totalItems={totalItems}
                onUpdateQuantity={updateQuantity}
                onPlaceOrder={handlePlaceOrder}
                submitting={submitting}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cart Button */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
          <Card className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[var(--color-primary)]" />
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {totalItems} item{totalItems !== 1 ? 's' : ''}
                  </span>
                </div>
                <span className="text-xl font-bold text-[var(--color-primary)]">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <Button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Cart Sidebar Component
function CartSidebar({ 
  cart, 
  totalPrice, 
  totalItems, 
  onUpdateQuantity, 
  onPlaceOrder, 
  submitting 
}: {
  cart: CartItem[]
  totalPrice: number
  totalItems: number
  onUpdateQuantity: (id: string, qty: number) => void
  onPlaceOrder: () => void
  submitting: boolean
}) {
  if (cart.length === 0) {
    return (
      <Card className="bg-[var(--color-surface)] border-[var(--color-border)]">
        <CardContent className="p-6 text-center">
          <ShoppingCart className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3" />
          <p className="text-[var(--color-text-secondary)] font-medium">Your cart is empty</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Add items to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[var(--color-surface)] border-[var(--color-border)]">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Your Order ({totalItems} items)
        </h3>

        <div className="space-y-4 max-h-64 overflow-y-auto mb-6">
          {cart.map(item => (
            <div key={item.menuItemId} className="flex items-center gap-3 p-3 bg-[var(--color-background-secondary)] rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--color-text-primary)] truncate">
                  {item.menuItem.name}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  ${(item.menuItem.price ?? 0).toFixed(2)} × {item.quantity}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateQuantity(item.menuItemId, item.quantity - 1)}
                  className="w-6 h-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-background-tertiary)] transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center font-medium text-[var(--color-text-primary)]">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.menuItemId, item.quantity + 1)}
                  className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] flex items-center justify-center hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--color-border)] pt-4">
          <div className="flex justify-between items-center text-xl font-bold mb-4">
            <span className="text-[var(--color-text-primary)]">Total:</span>
            <span className="text-[var(--color-primary)]">${totalPrice.toFixed(2)}</span>
          </div>
          <Button
            onClick={onPlaceOrder}
            disabled={submitting}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Placing Order...
              </>
            ) : (
              'Place Order'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}