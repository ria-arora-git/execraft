import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const alerts = await prisma.stockAlert.findMany({
    where: { acknowledged: false },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(alerts)
}
