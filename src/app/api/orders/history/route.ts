import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dateFilter = searchParams.get('date')
  const skip = Number(searchParams.get('skip')) || 0
  const take = Number(searchParams.get('take')) || 20

  const where = dateFilter
    ? {
        createdAt: {
          gte: new Date(dateFilter + 'T00:00:00.000Z'),
          lte: new Date(dateFilter + 'T23:59:59.999Z'),
        },
      }
    : {}

  const orders = await prisma.order.findMany({
    where,
    include: {
      table: true,
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  })

  return NextResponse.json(orders)
}
