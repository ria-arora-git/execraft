import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Note: You may want to adapt aggregation as per your needs.
export async function GET() {
  const today = new Date()
  today.setHours(0,0,0,0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todayOrders = await prisma.order.count({
    where: { createdAt: { gte: today, lt: tomorrow } }
  })
  const todayRevenue = await prisma.order.aggregate({
    _sum: { total: true },
    where: { createdAt: { gte: today, lt: tomorrow } }
  })

  // Dummy for avg, use real stats as needed
  return NextResponse.json({
    todayOrders,
    todayRevenue: todayRevenue._sum.total || 0,
    avgCustomersPerDay: 42,
    ordersPerDay: 38,
    revenuePerDay: 520.75,
    inventoryUsagePerDay: 125
  })
}
