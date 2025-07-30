'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default function Confirmation() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-blueDark flex flex-col items-center justify-center">
      <div className="bg-blueBase rounded-xl max-w-lg p-8 w-full text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-green-500 mb-2">Order Confirmed!</h1>
        <p className="text-slate-400 mb-8">Your order has been placed.</p>
        <Button className="w-full mb-2" onClick={() => router.push('/')}>Go Home</Button>
        <Button variant="outline" className="w-full" onClick={() => router.push('/order/demo123')}>Order More</Button>
      </div>
    </div>
  )
}
