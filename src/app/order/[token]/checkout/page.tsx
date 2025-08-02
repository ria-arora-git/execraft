'use client'

import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function Checkout() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const cartRaw = searchParams.get('cart')

  const cart: { menuItemId: string; quantity: number; price: number; name: string }[] =
    cartRaw ? JSON.parse(cartRaw) : []

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const [loading, setLoading] = useState(false)

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableToken: params.token,
          items: cart.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            notes: null,
          })),
          customerName: `Table ${params.token}`,
          customerPhone: null,
          notes: null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to place order')
        setLoading(false)
        return
      }

      const order = await response.json()
      toast.success('Order placed successfully!')

      router.push(`/order/${params.token}/confirmation/${order.id}`)
    } catch {
      toast.error('Failed to place order - network or server error')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-blueDark flex flex-col items-center justify-center px-4 sm:px-0">
      <div className="bg-blueBase rounded-xl max-w-lg p-8 w-full sm:shadow-lg">
        <h1 className="text-3xl font-bold mb-8 text-white">Order Review</h1>

        {cart.length === 0 ? (
          <p className="text-slate-400 mb-8">Your cart is empty</p>
        ) : (
          <ul className="mb-8 divide-y divide-slate-700 max-h-96 overflow-y-auto">
            {cart.map((item) => (
              <li
                key={item.menuItemId}
                className="py-3 flex justify-between items-center"
              >
                <span className="text-white">{item.quantity} x {item.name}</span>
                <span className="text-accent font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-between text-xl font-bold border-t border-slate-600 pt-6 mb-8">
          <span className="text-white">Total</span>
          <span className="text-accent">${total.toFixed(2)}</span>
        </div>

        <Button
          className="w-full mb-3"
          onClick={handlePlaceOrder}
          disabled={loading || cart.length === 0}
          aria-disabled={loading || cart.length === 0}
          aria-busy={loading}
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.back()}
          aria-label="Go back to menu"
        >
          Back to Menu
        </Button>
      </div>
    </div>
  )
}
