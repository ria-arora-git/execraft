import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRestaurantContext } from '@/lib/restaurant-context'

export async function GET(req: NextRequest, { params }: { params: { tableId: string } }) {
  try {
    const { restaurantId } = await getRestaurantContext()

    const orders = await prisma.order.findMany({
      where: {
        tableId: params.tableId,
        restaurantId,
        status: { notIn: ['PAID', 'CANCELLED'] }
      },
      include: {
        items: { include: { menuItem: true } },
        table: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching table orders:', error)
    return NextResponse.json({ error: 'Unauthorized or failed to fetch orders' }, { status: 401 })
  }
}
