export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { tableId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.restaurantId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const orders = await prisma.order.findMany({
      where: {
        tableId: params.tableId,
        restaurantId: user.restaurantId, 
      },
      include: {
        items: {
          include: { menuItem: true }
        },
        session: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders by table:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
