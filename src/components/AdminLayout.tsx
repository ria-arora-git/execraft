'use client'

import { ReactNode } from 'react'
import { useOrganization } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import AdminNavbar from '@/components/AdminNavbar'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { organization } = useOrganization()

  // Redirect to organization selection if no organization is selected
  if (!organization) {
    redirect('/admin/select-organization')
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Navigation */}
      <AdminNavbar />
      
      {/* Main Content */}
      <main className="w-full">
        <div className="min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </main>
    </div>
  )
}