import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { tableId: string } }) {
  const tableId = params.tableId

  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: {
      orders: {
        where: { status: { not: 'PAID' } },
        include: { items: { include: { menuItem: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!table) {
    return new Response('Not found', { status: 404 })
  }

  return NextResponse.json({ orders: table.orders, table: { number: table.number, id: table.id } })
}
