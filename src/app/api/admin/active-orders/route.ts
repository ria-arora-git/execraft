import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRestaurantContext } from '@/lib/restaurant-context'

export async function GET() {
  try {
    const { restaurantId } = await getRestaurantContext()

    const tables = await prisma.table.findMany({
      where: {
        restaurantId,
        orders: {
          some: { 
            status: { notIn: ['PAID', 'CANCELLED'] },
            restaurantId
          }
        }
      },
      include: { 
        orders: {
          where: {
            restaurantId,
            status: { notIn: ['PAID', 'CANCELLED'] }
          }
        }
      },
    })

    return NextResponse.json(tables)
  } catch (error) {
    console.error('Error fetching active orders tables:', error)
    return NextResponse.json(
      { error: 'Unauthorized or failed to fetch tables with active orders' },
      { status: 401 }
    )
  }
}
