import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json([])

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.restaurantId) return NextResponse.json([])

    const alerts = await prisma.stockAlert.findMany({
      where: { inventoryItem: { restaurantId: user.restaurantId } },
      include: { inventoryItem: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json([])
  }
}
