import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  try {
    const tables = await prisma.table.findMany({
      where: {
        orders: {
          some: { status: { not: 'PAID' } }
        }
      },
      include: { orders: true },
    })

    return NextResponse.json(tables)
  } catch (error) {
    console.error('Error fetching active orders tables:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tables with active orders' },
      { status: 500 }
    )
  }
}
