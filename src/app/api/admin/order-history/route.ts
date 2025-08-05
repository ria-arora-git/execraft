import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRestaurantContext } from '@/lib/restaurant-context'

export async function GET() {
  try {
    const { restaurantId } = await getRestaurantContext()

    const orders = await prisma.order.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { menuItem: true } },
        table: true
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Failed to fetch order history:', error)
    return NextResponse.json({ error: 'Unauthorized or failed to fetch order history' }, { status: 401 })
  }
}
