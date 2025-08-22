'use client'

import { ReactNode } from 'react'
import { useOrganization } from '@clerk/nextjs'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AdminNavbar from '@/components/AdminNavbar'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { organization, isLoaded } = useOrganization()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Wait for Clerk to load
    if (!isLoaded) return
    
    // Don't redirect if we're on the select-organization page
    if (pathname === '/admin/select-organization') return
    
    // Redirect to organization selection if no organization is selected
    if (!organization) {
      router.push('/admin/select-organization')
      return
    }
  }, [organization, isLoaded, pathname, router])

  // Show loading while Clerk loads
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--color-text-secondary)]">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't show navbar on select-organization page
  if (pathname === '/admin/select-organization') {
    return <>{children}</>
  }

  // Show loading if no organization (while redirecting)
  if (!organization) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--color-text-secondary)]">Setting up your restaurant...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <AdminNavbar />
      <main className="w-full">
        <div className="min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </main>
    </div>
  )
}