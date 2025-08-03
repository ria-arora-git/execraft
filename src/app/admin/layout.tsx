import { Navigation } from '@/components/ui/Navigation'
import { AlertsManager } from '@/components/AlertsManager'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-blueDark">
      <Navigation />
      <AlertsManager />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}