import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing inventory item ID' }, { status: 400 })
    }

    // Find which menu items use this inventory item
    const usage = await prisma.menuItemIngredient.findMany({
      where: { inventoryItemId: id },
      include: { menuItem: true },
    })

    return NextResponse.json({
      usedIn: usage.map((u) => u.menuItem?.name ?? ''),
    })
  } catch (error) {
    console.error('Error fetching inventory usage:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory usage' },
      { status: 500 }
    )
  }
}
