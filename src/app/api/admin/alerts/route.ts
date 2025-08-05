export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRestaurantContext } from '@/lib/restaurant-context'

export async function GET() {
  try {
    const { restaurantId } = await getRestaurantContext()

    const alerts = await prisma.stockAlert.findMany({
      where: { 
        inventoryItem: { restaurantId }
      },
      include: { inventoryItem: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({ error: 'Unauthorized or failed to fetch alerts' }, { status: 401 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { restaurantId } = await getRestaurantContext()
    const body = await req.json()
    const { id, acknowledged } = body

    if (!id || typeof acknowledged !== 'boolean') {
      return NextResponse.json({ error: 'Missing alert ID or acknowledged status' }, { status: 400 })
    }

    // Verify alert belongs to restaurant
    const alert = await prisma.stockAlert.findUnique({
      where: { id },
      include: { inventoryItem: true }
    })

    if (!alert || alert.inventoryItem.restaurantId !== restaurantId) {
      return NextResponse.json({ error: 'Alert not found or unauthorized' }, { status: 404 })
    }

    // Update alert acknowledgement status
    const updatedAlert = await prisma.stockAlert.update({
      where: { id },
      data: { acknowledged },
    })

    return NextResponse.json(updatedAlert)
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json({ error: 'Unauthorized or failed to update alert' }, { status: 401 })
  }
}
