import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { tableId: string } }) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json([])

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.restaurantId) return NextResponse.json([])

    const orders = await prisma.order.findMany({
      where: {
        tableId: params.tableId,
        restaurantId: user.restaurantId
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
    return NextResponse.json([])
  }
}
