'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Active Orders', href: '/admin/active-orders' },
  { name: 'Order History', href: '/admin/order-history' },
  { name: 'Menu Management', href: '/admin/menu-management' }, // Added this line
  { name: 'Inventory', href: '/admin/inventory' },
  { name: 'Recipes', href: '/admin/recipes' },
  { name: 'Table Management', href: '/admin/table-management' },
  { name: 'Alerts', href: '/admin/alerts' },
  { name: 'Analytics', href: '/admin/analytics' },
]

export default function AdminNavbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-blueBase border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/admin" className="text-white font-bold text-xl">
            Restaurant Admin
          </Link>

          <div className="hidden md:flex space-x-6">
            {navigation.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium px-3 py-2 rounded-md ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              className="text-white focus:outline-none focus:ring-2 focus:ring-accent rounded-md"
            >
              {menuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-blueBase border-t border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}