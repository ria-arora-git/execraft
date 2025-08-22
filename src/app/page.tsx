'use client'

import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { 
  ChefHat, 
  Users, 
  BarChart3, 
  Package, 
  ShoppingCart, 
  ArrowRight,
  Star,
  Clock,
  Shield,
  Zap,
  TrendingUp,
  CheckCircle,
  Play,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react'

export default function EnhancedHomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-xl flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--color-text-primary)]">RestaurantOS</h1>
                <p className="text-xs text-[var(--color-text-secondary)]">Complete Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm">Get Started</Button>
                </SignUpButton>
              </SignedOut>
              
              <SignedIn>
                <Link href="/admin">
                  <Button>
                    <Monitor className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Admin Portal</span>
                    <span className="sm:hidden">Portal</span>
                  </Button>
                </Link>
              </SignedIn>
              
              {/* Quick Order Button */}
              <Link href="/order">
                <Button size="sm" className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]">
                  <Smartphone className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Quick Order</span>
                  <span className="sm:hidden">Order</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 lg:py-24">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-[var(--color-success-bg)] text-[var(--color-success)] rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4 mr-2" />
                #1 Restaurant Management Platform
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[var(--color-text-primary)] mb-6 leading-tight">
                Complete Restaurant
                <span className="block bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
                  Management System
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Streamline your restaurant operations with our comprehensive platform. 
                Handle inventory, orders, recipes, and analytics all in one place.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button size="lg" className="w-full sm:w-auto">
                      <Play className="w-5 h-5 mr-2" />
                      Start Free Trial
                    </Button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Sign In
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </SignInButton>
                </SignedOut>
                
                <SignedIn>
                  <Link href="/admin">
                    <Button size="lg" className="w-full sm:w-auto">
                      <Monitor className="w-5 h-5 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <Play className="w-5 h-5 mr-2" />
                    Watch Demo
                  </Button>
                </SignedIn>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-[var(--color-text-secondary)]">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-[var(--color-success)] mr-2" />
                    14-day free trial
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-[var(--color-success)] mr-2" />
                    Bank-level security
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-[var(--color-success)] mr-2" />
                    1000+ restaurants
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative lg:order-last">
              <div className="relative bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-2xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  {/* Dashboard Preview Cards */}
                  <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <ShoppingCart className="w-5 h-5" />
                        <TrendingUp className="w-4 h-4 text-green-300" />
                      </div>
                      <p className="text-2xl font-bold">124</p>
                      <p className="text-xs opacity-80">Orders Today</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="w-5 h-5" />
                        <TrendingUp className="w-4 h-4 text-green-300" />
                      </div>
                      <p className="text-2xl font-bold">$2.8k</p>
                      <p className="text-xs opacity-80">Revenue</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Clock className="w-5 h-5" />
                        <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                      </div>
                      <p className="text-2xl font-bold">8</p>
                      <p className="text-xs opacity-80">Active Orders</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Package className="w-5 h-5" />
                        <CheckCircle className="w-4 h-4 text-green-300" />
                      </div>
                      <p className="text-2xl font-bold">98%</p>
                      <p className="text-xs opacity-80">Stock Level</p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-white/20 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[var(--color-background-secondary)]">
        <div className="container">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-[var(--color-primary-bg)] text-[var(--color-primary)] rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Powerful Features
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-text-primary)] mb-6">
              Everything You Need to Run Your Restaurant
            </h2>
            <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-3xl mx-auto">
              From inventory tracking to order management, we've got every aspect of your restaurant covered
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-[var(--color-surface)] border-[var(--color-border)] hover:shadow-lg transition-all duration-200 group">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 bg-[var(--color-surface)] border-y border-[var(--color-border)]">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-primary)] mb-2">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base text-[var(--color-text-secondary)] font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-text-primary)] mb-6">
              Ready to Transform Your Restaurant?
            </h2>
            <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
              Join thousands of restaurants already using RestaurantOS to streamline their operations and boost efficiency
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Play className="w-5 h-5 mr-2" />
                    Get Started Today
                  </Button>
                </SignUpButton>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Globe className="w-5 h-5 mr-2" />
                  View Live Demo
                </Button>
              </SignedOut>
              
              <SignedIn>
                <Link href="/admin">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Monitor className="w-5 h-5 mr-2" />
                    Access Your Dashboard
                  </Button>
                </Link>
              </SignedIn>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-[var(--color-text-secondary)]">
              <div className="flex items-center">
                <div className="flex -space-x-1 mr-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] border-2 border-[var(--color-surface)] flex items-center justify-center">
                      <Star className="w-3 h-3 text-white fill-current" />
                    </div>
                  ))}
                </div>
                <span>Loved by 1000+ restaurants</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-[var(--color-success)]" />
                <span>Enterprise-grade security</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-[var(--color-success)]" />
                <span>24/7 support available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--color-surface)] border-t border-[var(--color-border)] py-12">
        <div className="container">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-xl flex items-center justify-center mr-3">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--color-text-primary)]">RestaurantOS</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">Complete Management System</p>
              </div>
            </div>
            <p className="text-[var(--color-text-secondary)] mb-6">
              Empowering restaurants worldwide with modern management tools
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              © 2024 RestaurantOS. All rights reserved. Built with ❤️ for restaurant success.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: Package,
    title: 'Smart Inventory Management',
    description: 'Real-time stock tracking with automated alerts, supplier management, and waste reduction analytics'
  },
  {
    icon: ChefHat,
    title: 'Recipe & Menu Control',
    description: 'Create and manage recipes with automatic ingredient calculations and cost analysis'
  },
  {
    icon: ShoppingCart,
    title: 'Seamless Order Processing',
    description: 'Streamline orders from table to kitchen with real-time updates and mobile optimization'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Comprehensive insights into sales, inventory turnover, and performance metrics'
  },
  {
    icon: Users,
    title: 'Staff Management',
    description: 'Manage roles, permissions, schedules, and track staff performance efficiently'
  },
  {
    icon: Clock,
    title: 'Real-time Operations',
    description: 'Live order tracking, table management, and instant notifications across all devices'
  }
]

const stats = [
  { value: '1000+', label: 'Happy Restaurants' },
  { value: '50k+', label: 'Orders Processed' },
  { value: '99.9%', label: 'Uptime Guarantee' },
  { value: '24/7', label: 'Support Available' }
]