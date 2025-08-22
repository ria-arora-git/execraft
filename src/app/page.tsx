'use client'

import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/Button'
import { ChefHat, Users, BarChart3, Package, ShoppingCart } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-blueDark">
      {/* Header */}
      <header className="bg-blueBase shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ChefHat className="h-8 w-8 text-accent" />
              <span className="ml-2 text-xl font-bold text-white">RestaurantOS</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="outline">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button>Get Started</Button>
                </SignUpButton>
              </SignedOut>
              
              <SignedIn>
                <Link href="/admin">
                  <Button>Admin Portal</Button>
                </Link>
              </SignedIn>
              
              {/* Quick Order Button */}
              <Link href="/order">
                <Button size="sm" color="green">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Quick Order
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Complete Restaurant
            <span className="text-accent block">Management System</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Streamline your restaurant operations with our comprehensive management platform. 
            Handle inventory, orders, recipes, and analytics all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg">Start Free Trial</Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button size="lg" variant="outline">Sign In</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/admin">
                <Button size="lg">Go to Dashboard</Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blueBase">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Run Your Restaurant
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              From inventory tracking to order management, we've got you covered
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="flex justify-center mb-4">
                  <feature.icon className="h-12 w-12 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Restaurant?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of restaurants already using RestaurantOS to streamline their operations
          </p>
          <SignedOut>
            <SignUpButton mode="modal">
              <Button size="lg">Get Started Today</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/admin">
              <Button size="lg">Access Your Dashboard</Button>
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blueBase py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <ChefHat className="h-8 w-8 text-accent" />
            <span className="ml-2 text-xl font-bold text-white">RestaurantOS</span>
          </div>
          <p className="text-slate-400">
            © 2024 RestaurantOS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: Package,
    title: 'Inventory Management',
    description: 'Track stock levels, set alerts, and manage suppliers with ease'
  },
  {
    icon: ChefHat,
    title: 'Recipe Management',
    description: 'Create and manage recipes with automatic ingredient calculations'
  },
  {
    icon: ShoppingCart,
    title: 'Order Processing',
    description: 'Streamline orders from table to kitchen with real-time updates'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Get insights into sales, inventory turnover, and performance metrics'
  },
  {
    icon: Users,
    title: 'Staff Management',
    description: 'Manage roles, permissions, and track staff performance'
  },
  {
    icon: ChefHat,
    title: 'Menu Planning',
    description: 'Design menus, set pricing, and manage seasonal offerings'
  }
]