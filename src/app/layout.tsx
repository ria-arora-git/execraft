import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import AdminNavbar from '@/components/AdminNavbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Restaurant Management System',
  description: 'Manage your restaurant efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#162346',
              color: '#fff',
              border: '1px solid #3B82F6',
            },
          }}
        />
      </body>
    </html>
  )
}
