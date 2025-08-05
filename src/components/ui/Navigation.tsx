'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  UtensilsCrossed,
  ChefHat,
  ShoppingCart,
  BarChart3,
  Bell,
  Table
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Inventory', href: '/admin/inventory', icon: Package },
  { name: 'Menu', href: '/admin/menu-management', icon: UtensilsCrossed },
  { name: 'Recipes', href: '/admin/recipes', icon: ChefHat },
  { name: 'Order History', href: '/admin/order-history', icon: ShoppingCart },
  { name: 'Table Management', href: '/admin/table-management', icon: Table },
  { name: 'Active Orders', href: '/admin/active-orders', icon: BarChart3 },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-blueBase shadow-lg">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/admin" className="flex-shrink-0 flex items-center pr-20">
              <ChefHat className="h-8 w-8 text-accent" />
              <span className="ml-2 text-xl font-bold text-white">RestaurantOS</span>
            </Link>

            {/* Desktop navigation links */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navigation.map(item => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors',
                      isActive
                        ? 'border-accent text-white'
                        : 'border-transparent text-slate-300 hover:text-white hover:border-slate-300'
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
   
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navigation.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
