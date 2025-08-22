import './globals.css'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'
import { getCSSVariables, ACTIVE_THEME } from '@/lib/theme-config'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'RestaurantOS - Complete Restaurant Management',
  description: 'Modern restaurant management system with inventory, orders, and analytics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Apply theme variables to CSS
  const themeVars = getCSSVariables(ACTIVE_THEME)

  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <style dangerouslySetInnerHTML={{
            __html: `
              :root {
                ${Object.entries(themeVars)
                  .map(([key, value]) => `${key}: ${value};`)
                  .join('\n                ')}
              }
            `
          }} />
        </head>
        <body className={inter.className}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
              },
              success: {
                style: {
                  background: 'var(--color-success-bg)',
                  color: 'var(--color-success)',
                  border: '1px solid var(--color-success-border)',
                },
              },
              error: {
                style: {
                  background: 'var(--color-error-bg)',
                  color: 'var(--color-error)',
                  border: '1px solid var(--color-error-border)',
                },
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  )
}