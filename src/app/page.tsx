import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-blueDark flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-bold text-white mb-6 text-center">
        Restaurant Management System
      </h1>
      <p className="text-slate-400 mb-8 max-w-lg text-center">
        Professional restaurant ordering and management system
      </p>
      <div className="flex flex-col md:flex-row gap-6">
        <Link href="/order/demo123" className="bg-blueBase px-8 py-6 rounded-2xl hover:bg-slate-800 transition w-64 text-center text-white font-semibold">
          Customer Ordering
        </Link>
        <Link href="/admin" className="bg-accent px-8 py-6 rounded-2xl hover:bg-bluePri transition w-64 text-center text-white font-semibold">
          Admin Dashboard
        </Link>
      </div>
    </div>
  )
}
