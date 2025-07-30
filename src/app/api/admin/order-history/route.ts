import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const date = url.searchParams.get('date')
  const skip = parseInt(url.searchParams.get('skip') ?? '0')
  const take = parseInt(url.searchParams.get('take') ?? '20')

  let dateFilter = {}
  if (date) {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)
    dateFilter = { createdAt: { gte: start, lte: end } }
  }

  const orders = await prisma.order.findMany({
    where: dateFilter,
    include: { table: true },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  })

  return NextResponse.json(orders)
}
