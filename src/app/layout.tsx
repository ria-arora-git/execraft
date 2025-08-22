import React from 'react'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import ThemeProvider from '@/lib/ThemeProvider'
import { Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import './globals.css'

// ============================================================================
// FONTS
// ============================================================================
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

// ============================================================================
// METADATA
// ============================================================================
export const metadata = {
  title: {
    default: 'RestaurantOS - Complete Restaurant Management',
    template: '%s | RestaurantOS',
  },
  description: 'Modern restaurant management system with inventory, orders, menu management, and comprehensive analytics.',
  keywords: [
    'restaurant management',
    'inventory management',
    'order management',
    'menu management',
    'restaurant POS',
    'restaurant software',
    'table management',
    'restaurant analytics'
  ],
  authors: [{ name: 'RestaurantOS Team' }],
  creator: 'RestaurantOS',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'RestaurantOS - Complete Restaurant Management',
    description: 'Modern restaurant management system with inventory, orders, menu management, and comprehensive analytics.',
    siteName: 'RestaurantOS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RestaurantOS - Complete Restaurant Management',
    description: 'Modern restaurant management system with inventory, orders, menu management, and comprehensive analytics.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

// ============================================================================
// VIEWPORT
// ============================================================================

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3B82F6' },
    { media: '(prefers-color-scheme: dark)', color: '#1E3A8A' },
  ],
}

// ============================================================================
// ROOT LAYOUT COMPONENT
// ============================================================================

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={cn(
        'h-full scroll-smooth antialiased',
        inter.variable,
        jetbrainsMono.variable
      )}
      suppressHydrationWarning
    >
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Theme color meta tags */}
        <meta name="theme-color" content="#3B82F6" />
        <meta name="msapplication-navbutton-color" content="#3B82F6" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        {/* Prevent FOUC (Flash of Unstyled Content) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('restaurant-theme');
                  if (theme) {
                    const { mode } = JSON.parse(theme);
                    if (mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                      document.documentElement.classList.add('dark');
                    }
                  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans text-foreground',
          'selection:bg-primary/20 selection:text-primary-foreground',
          'text-rendering-optimize-legibility',
          'overflow-x-hidden'
        )}
        suppressHydrationWarning
      >
        <ClerkProvider
          appearance={{
            baseTheme: undefined,
            elements: {
              formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
              card: 'bg-card border-border shadow-soft',
              headerTitle: 'text-foreground',
              headerSubtitle: 'text-muted-foreground',
              socialButtonsBlockButton: 'border-border text-foreground hover:bg-accent',
              formFieldLabel: 'text-foreground',
              formFieldInput: 'bg-background border-border text-foreground focus:ring-primary',
              footerActionLink: 'text-primary hover:text-primary/80',
              identityPreviewText: 'text-foreground',
              identityPreviewEditButton: 'text-primary hover:text-primary/80',
            },
            variables: {
              colorPrimary: '#3B82F6',
              colorDanger: '#EF4444',
              colorSuccess: '#10B981',
              colorWarning: '#F59E0B',
              colorNeutral: '#6B7280',
            },
          }}
        >
          <ThemeProvider
            defaultTheme="restaurant"
            defaultMode="system"
            storageKey="restaurant-theme"
          >
            {/* Skip to content link for accessibility */}
            <a
              href="#main-content"
              className={cn(
                'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
                'bg-primary text-primary-foreground px-4 py-2 rounded-md',
                'z-tooltip font-medium transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
              )}
            >
              Skip to content
            </a>
            {/* Main content */}
            <div className="relative flex min-h-screen flex-col">
              <main id="main-content" className="flex-1">
                {children}
              </main>
            </div>
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: '',
                style: {},
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#ffffff',
                  },
                },
                loading: {
                  duration: Infinity,
                  iconTheme: {
                    primary: '#3B82F6',
                    secondary: '#ffffff',
                  },
                },
              }}
              containerClassName="z-toast"
            />
            {/* If you need custom styles, put them in globals.css instead of styled-jsx here */}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
