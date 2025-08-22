import React from 'react'
import { Navigation } from '@/components/ui/Navigation'
import { AlertsManager } from '@/components/AlertsManager'
import { cn } from '@/lib/utils'

// ============================================================================
// ADMIN LAYOUT COMPONENT
// ============================================================================

interface AdminLayoutProps {
  children: React.ReactNode
  className?: string
}

export default function AdminLayout({ children, className }: AdminLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-background-main', className)}>
      {/* Enhanced Navigation */}
      <Navigation />
      
      {/* Alerts Manager */}
      <AlertsManager />
      
      {/* Main Content Area */}
      <main className="flex-1 transition-all duration-200">
        <div className={cn(
          'mx-auto max-w-8xl px-4 py-6 sm:px-6 lg:px-8',
          // Responsive padding adjustments
          'md:py-8 lg:py-10'
        )}>
          {children}
        </div>
      </main>
      
      {/* Background Pattern (Optional) */}
      <div 
        className="fixed inset-0 bg-grid opacity-[0.02] pointer-events-none"
        aria-hidden="true"
      />
    </div>
  )
}