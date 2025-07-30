'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AdminHome() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const cards = [
    {
      href: '/admin/active-orders',
      icon: '📦',
      label: 'Active Orders',
      description: 'Manage current table orders and status updates'
    },
    {
      href: '/admin/order-history',
      icon: '📋',
      label: 'Order History',
      description: 'Browse and export previous orders'
    },
    {
      href: '/admin/inventory',
      icon: '🥕',
      label: 'Inventory',
      description: 'Manage stock and supplies'
    },
    {
      href: '/admin/recipes',
      icon: '🍽️',
      label: 'Recipe Management',
      description: 'Map ingredients to menu items'
    },
    {
      href: '/admin/table-management',
      icon: '🪑',
      label: 'Table Management',
      description: 'Manage tables and QR codes'
    },
    {
      href: '/admin/alerts',
      icon: '⚠️',
      label: 'Stock Alerts',
      description: 'View inventory low-stock alerts'
    },
    {
      href: '/admin/analytics',
      icon: '📊',
      label: 'Analytics',
      description: 'Business performance metrics'
    },
  ]

  return (
    <div className="min-h-screen bg-blueDark pt-8 px-6">
      <div className="max-w-7xl mx-auto p-4">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <div className="text-right text-slate-400">
            <div>{currentTime.toLocaleDateString()}</div>
            <div className="font-mono text-accent text-lg">{currentTime.toLocaleTimeString()}</div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {cards.map(card => (
            <Link key={card.href} href={card.href}>
              <div className="bg-blueBase p-8 rounded-3xl cursor-pointer hover:bg-slate-800 transition transform hover:scale-[1.04]">
                <div className="text-5xl mb-4">{card.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{card.label}</h3>
                <p className="text-slate-400 text-sm">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
