'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, OrganizationSwitcher } from '@clerk/nextjs'
import { 
  ChefHat, 
  Menu, 
  X, 
  LayoutDashboard,
  Package,
  UtensilsCrossed,
  ShoppingCart,
  Table,
  BarChart3,
  Bell,
  Settings as SettingsIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme, useResponsive } from '@/lib/ThemeProvider'
import { Button } from '@/components/ui/Button'
import SettingsDrawer from '@/components/SettingsDrawer'
import { AlertsManager } from '../AlertsManager'

// ============================================================================
// NAVIGATION DATA
// ============================================================================

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/admin', 
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  { 
    name: 'Inventory', 
    href: '/admin/inventory', 
    icon: Package,
    description: 'Stock management'
  },
  { 
    name: 'Menu', 
    href: '/admin/menu-management', 
    icon: UtensilsCrossed,
    description: 'Menu items'
  },
  { 
    name: 'Recipes', 
    href: '/admin/recipes', 
    icon: ChefHat,
    description: 'Recipe management'
  },
  { 
    name: 'Order History', 
    href: '/admin/order-history', 
    icon: ShoppingCart,
    description: 'Past orders'
  },
  { 
    name: 'Tables', 
    href: '/admin/table-management', 
    icon: Table,
    description: 'Table configuration'
  },
  { 
    name: 'Active Orders', 
    href: '/admin/active-orders', 
    icon: BarChart3,
    description: 'Current orders'
  },
]

// ============================================================================
// NAVIGATION COMPONENT
// ============================================================================

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { theme } = useTheme()
  const { isMobile, isTablet, isDesktop } = useResponsive()

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            
            {/* Logo and Brand */}
            <div className="flex items-center gap-8">
              <Link 
                href="/admin" 
                className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-gray-100 hover:opacity-80 transition-opacity"
              >
                <ChefHat className="h-8 w-8 text-blue-600" />
                <span className="hidden sm:block">RestaurantOS</span>
              </Link>

              {/* Desktop Navigation Links */}
              {!isMobile && (
                <div className="hidden lg:flex lg:gap-1">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                          'hover:bg-gray-100 dark:hover:bg-gray-800',
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                        )}
                        title={item.description}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden xl:inline">{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              
              {/* Organization Switcher - Hidden on mobile */}
              {!isMobile && (
                <OrganizationSwitcher 
                  hidePersonal
                  afterLeaveOrganizationUrl="/admin/select-organization"
                  afterSelectOrganizationUrl="/admin"
                  appearance={{
                    elements: {
                      organizationSwitcherTrigger: cn(
                        'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600',
                        'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800',
                        'px-3 py-2 rounded-md text-sm'
                      ),
                      organizationPreview: 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100',
                      card: 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700',
                      headerTitle: 'text-gray-900 dark:text-gray-100',
                      headerSubtitle: 'text-gray-600 dark:text-gray-300',
                      formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
                      formFieldInput: 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100',
                      formFieldLabel: 'text-gray-700 dark:text-gray-300',
                    }
                  }}
                />
              )}

              {/* Notifications Button */}
              <Button
                variant="ghost"
                size="sm"
                className="relative h-9 w-9 p-0"
                aria-label="Notifications"
              >
                <AlertsManager/>
              </Button>

              <SettingsDrawer />

              {/* User Button */}
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'h-9 w-9',
                    userButtonPopoverCard: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
                    userButtonPopoverActionButton: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                  }
                }}
              />

              {/* Mobile Menu Button */}
              {isMobile && (
                <Button
                  onClick={toggleMobileMenu}
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 lg:hidden"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && isMobile && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="px-2 py-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-all duration-200',
                      'hover:bg-gray-100 dark:hover:bg-gray-800',
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <div>{item.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                )
              })}
              
              {/* Mobile Organization Switcher */}
              <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 mt-3 pt-3">
                <OrganizationSwitcher 
                  hidePersonal
                  afterLeaveOrganizationUrl="/admin/select-organization"
                  afterSelectOrganizationUrl="/admin"
                  appearance={{
                    elements: {
                      organizationSwitcherTrigger: cn(
                        'w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600',
                        'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700',
                        'px-3 py-2 rounded-md text-sm'
                      ),
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Settings Drawer */}
      

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30 lg:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </>
  )
}

export default Navigation