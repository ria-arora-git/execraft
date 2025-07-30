'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'

const demoMenu = [
  { id: '1', name: 'Spring Rolls', price: 8.99 },
  { id: '2', name: 'Margherita Pizza', price: 16.99 },
  { id: '3', name: 'Beef Steak', price: 28.99 },
  { id: '4', name: 'Chocolate Cake', price: 7.99 },
]

export default function Checkout({ params }: { params: { token: string } }) {
  const router = useRouter()
  const query = useSearchParams()
  const cartRaw = query.get('cart')
  const cartObj = cartRaw ? JSON.parse(cartRaw) : {}
  const items = Object.entries(cartObj).map(([id, qty]) => ({
    ...demoMenu.find(m => m.id === id)!,
    qty
  }))
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const handleOrder = async () => {
    // Demo: In actual app, send order to `/api/orders`
    router.push(`/order/${params.token}/confirmation/fake123`)
  }
  return (
    <div className="min-h-screen bg-blueDark flex flex-col items-center justify-center">
      <div className="bg-blueBase rounded-xl max-w-lg p-8 w-full">
        <h1 className="text-3xl font-bold mb-8 text-white">Order Review</h1>
        <ul className="mb-8">
          {items.map(ci =>
            <li key={ci.id} className="flex justify-between">
              <span className="text-white">{ci.qty} x {ci.name}</span>
              <span className="text-accent font-semibold">${(ci.price * ci.qty).toFixed(2)}</span>
            </li>
          )}
        </ul>
        <div className="flex justify-between text-xl font-bold border-t border-slate-600 pt-6 mb-8">
          <span className="text-white">Total</span>
          <span className="text-accent">${total.toFixed(2)}</span>
        </div>
        <Button className="w-full mb-3" onClick={handleOrder}>Place Order</Button>
        <Button variant="outline" className="w-full" onClick={() => router.back()}>Back</Button>
      </div>
    </div>
  )
}
