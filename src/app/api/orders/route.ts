import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { tableToken, items, total } = await req.json()
  const table = await prisma.table.findUnique({ where: { token: tableToken } })
  if (!table) return NextResponse.json({ error: 'Invalid table' }, { status: 404 })

  // Create session if needed (exercise: expand if you want sessions)
  const order = await prisma.order.create({
    data: {
      orderNumber: 'ORD-' + Date.now(),
      tableId: table.id,
      restaurantId: table.restaurantId,
      sessionId: '', // fill if you wire up sessions
      customerName: `Table ${table.number}`,
      status: 'PENDING',
      total,
      items: { create: items },
    },
  })
  return NextResponse.json({ success: true, order })
}
