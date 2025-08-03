'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default function ConfirmationPage() {
  const router = useRouter()


  return (
    <div className="min-h-screen bg-blueDark text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-4">Thank You!</h1>
      <p className="text-lg mb-8 text-center max-w-md">
        Your order has been placed successfully. The staff will process it shortly.
      </p>
      <Button onClick={() => router.push('/')}>Back to Home</Button>
    </div>
  )
}
