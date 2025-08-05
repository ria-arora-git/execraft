'use client'

import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default function ConfirmationPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  return (
    <div className="min-h-screen bg-blueDark text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-4">Thank You!</h1>
        <p className="text-lg mb-2">Your order has been placed successfully.</p>
        <p className="text-slate-400 mb-8">The staff will process it shortly and bring it to your table.</p>

        <div className="space-y-4">
          <Button
            onClick={() => router.push(`/order/${token}`)}
            className="w-full bg-accent hover:bg-green-600"
          >
            Place Another Order
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
