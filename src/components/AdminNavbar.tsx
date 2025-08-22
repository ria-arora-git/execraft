'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/Button'
import { 
  BarChart3,
  ChefHat,
  Clock,
  FileText,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Users,
  AlertTriangle,
  Menu,
  X,
  Monitor,
  Utensils,
  TrendingUp
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Active Orders', href: '/admin/active-orders', icon: Clock },
  { name: 'Order History', href: '/admin/order-history', icon: FileText },
  { name: 'Menu Management', href: '/admin/menu-management', icon: ChefHat },
  { name: 'Inventory', href: '/admin/inventory', icon: Package },
  { name: 'Recipes', href: '/admin/recipes', icon: Utensils },
  { name: 'Table Management', href: '/admin/table-management', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
  { name: 'Alerts', href: '/admin/alerts', icon: AlertTriangle },
]

interface AdminNavbarProps {
  className?: string
}

export default function AdminNavbar({ className = '' }: AdminNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`hidden lg:flex bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm sticky top-0 z-50 ${className}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/admin" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-lg flex items-center justify-center">
                <Monitor className="h-5 w-5 text-white" />
              </div>
              <div className="hidden xl:block">
                <h1 className="text-lg font-bold text-[var(--color-text-primary)]">RestaurantOS</h1>
                <p className="text-xs text-[var(--color-text-secondary)]">Admin Portal</p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={active ? 'default' : 'ghost'}
                      size="sm"
                      className={`
                        relative flex items-center space-x-2 px-3 py-2 text-sm font-medium
                        ${active 
                          ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]' 
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background-secondary)]'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden xl:inline">{item.name}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm sticky top-0 z-50">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-lg flex items-center justify-center">
                <Monitor className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-[var(--color-text-primary)]">RestaurantOS</h1>
              </div>
            </Link>

            {/* Mobile menu button and user */}
            <div className="flex items-center space-x-3">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-7 h-7"
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="px-2 pt-2 pb-3 space-y-1 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <div
                      className={`
                        flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors
                        ${active
                          ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                          : 'text-[var(--color-text-primary)] hover:bg-[var(--color-background-secondary)]'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.name}</span>
                      {active && (
                        <div className="ml-auto w-2 h-2 bg-[var(--color-primary-foreground)] rounded-full" />
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-25" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}