'use client'

import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/Button'
import { ChefHat, Users, BarChart3, Package, ShoppingCart } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      {/* Header */}
      <header className="bg-primary shadow-lg">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-wrap sm:flex-nowrap justify-between items-center min-h-[64px] py-4 sm:py-0 gap-4">
            <div className="flex items-center space-x-3">
              <ChefHat className="h-8 w-8 text-accent" />
              <span className="text-2xl font-bold text-text">RestaurantOS</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6">
              <SignedOut>
                <div className="flex space-x-3">
                  <SignInButton mode="modal">
                    <Button variant="outline" size="sm">Sign In</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button size="sm">Get Started</Button>
                  </SignUpButton>
                </div>
              </SignedOut>
              <SignedIn>
                <Link href="/admin" className="inline-block">
                  <Button size="sm">Admin Portal</Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center py-24 px-8 sm:px-12 lg:px-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-8 text-text leading-tight">
            Complete Restaurant<br />
            <span className="text-accent">Management System</span>
          </h1>
          <p className="text-lg sm:text-xl text-textMuted mb-12 max-w-lg mx-auto leading-relaxed">
            Streamline your restaurant operations with a comprehensive platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg" className="w-full sm:w-auto">Start Free Trial</Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">Sign In</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/admin">
                <Button size="xl">Go to Dashboard</Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="min-h-screen bg-secondary flex flex-col py-24 px-8 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center max-w-3xl mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text mb-5">
              Everything You Need to Run Your Restaurant
            </h2>
            <p className="text-lg sm:text-xl text-textMuted leading-relaxed">
              From inventory tracking to order management, we've got you covered
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-14 w-full">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-bg p-8 rounded-xl shadow-lg text-center transition-shadow hover:shadow-xl">
                <div className="flex justify-center mb-6">
                  <feature.icon className="h-12 w-12 text-accent" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-text mb-3">{feature.title}</h3>
                <p className="text-base text-textMuted leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className=" flex flex-col justify-center py-24 px-8 sm:px-12 lg:px-20 text-center mb-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 text-text">
            Ready to Transform Your Restaurant?
          </h2>
          <p className="text-lg sm:text-xl text-textMuted mb-12 max-w-xl mx-auto leading-relaxed">
            Join thousands of restaurants already using RestaurantOS to streamline operations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-8 max-w-xs mx-auto sm:max-w-none sm:mx-0">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/admin">
                <Button size="lg" className="w-full sm:w-auto">Access Dashboard</Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary py-4 px-8 sm:px-12 lg:px-20 mt-auto text-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="flex items-center space-x-3 mb-3">
            <ChefHat className="h-8 w-8 text-accent" aria-hidden="true" />
            <span className="text-2xl font-semibold text-text">RestaurantOS</span>
          </div>
          <p className="text-textMuted text-sm select-none">© 2024 RestaurantOS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: Package,
    title: 'Inventory Management',
    description: 'Track stock levels, set alerts, and manage suppliers with ease',
  },
  {
    icon: ChefHat,
    title: 'Recipe Management',
    description: 'Create and manage recipes with automatic calculations',
  },
  {
    icon: ShoppingCart,
    title: 'Order Processing',
    description: 'Streamline your orders from table to kitchen with real-time updates',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Gain insights into sales, inventory turnover, and performance',
  },
  {
    icon: Users,
    title: 'Staff Management',
    description: 'Manage roles, permissions, and track staff performance',
  },
  {
    icon: ChefHat,
    title: 'Menu Planning',
    description: 'Design menus, set pricing, and manage seasonal offerings',
  },
]

