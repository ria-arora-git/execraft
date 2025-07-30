import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const tables = await prisma.table.findMany({
    where: { orders: { some: { status: { not: 'PAID' } } } },
    include: { orders: true },
  })
  return NextResponse.json(tables)
}
