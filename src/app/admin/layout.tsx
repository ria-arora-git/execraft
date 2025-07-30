import AdminNavbar from '@/components/ui/AdminNavbar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-blueDark flex flex-col">
      {/* Your responsive admin top navbar */}
      <AdminNavbar />

      {/* The page content below the navbar */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
