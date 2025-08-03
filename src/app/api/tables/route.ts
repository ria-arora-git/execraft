import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
     const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.restaurantId) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

    const tables = await prisma.table.findMany({
      where: { restaurantId: user.restaurantId },
      orderBy: { number: 'asc' },
    })
    return NextResponse.json(tables)
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
     const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.restaurantId) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

    const { number, capacity } = await req.json()

    if (typeof number !== 'number' || typeof capacity !== 'number' || capacity < 1) {
      return NextResponse.json({ error: 'Invalid table number or capacity' }, { status: 400 })
    }

    const existing = await prisma.table.findFirst({
      where: { number, restaurantId: user.restaurantId },
    })
    if (existing) return NextResponse.json({ error: 'Table number already exists' }, { status: 409 })

    const token = Math.random().toString(36).slice(2, 12).toUpperCase() // Unique code for QR

    const newTable = await prisma.table.create({
      data: {
        number,
        capacity,
        status: 'AVAILABLE',
        token,
        restaurantId: user.restaurantId,
      },
    })

    return NextResponse.json(newTable)
  } catch (error) {
    console.error('Error creating table:', error)
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
     const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id, number, capacity, status } = await req.json()

    if (!id || typeof number !== 'number' || typeof capacity !== 'number' || !['AVAILABLE', 'OCCUPIED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid update data' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.restaurantId) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

    const table = await prisma.table.findUnique({ where: { id } })
    if (!table || table.restaurantId !== user.restaurantId) {
      return NextResponse.json({ error: 'Table not found or unauthorized' }, { status: 404 })
    }

    const existing = await prisma.table.findFirst({
      where: {
        number,
        restaurantId: user.restaurantId,
        NOT: { id },
      },
    })
    if (existing) return NextResponse.json({ error: 'Table number already in use' }, { status: 409 })

    const updated = await prisma.table.update({
      where: { id },
      data: { number, capacity, status },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating table:', error)
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing table id' }, { status: 400 })

     const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.restaurantId) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

    const table = await prisma.table.findUnique({ where: { id } })
    if (!table || table.restaurantId !== user.restaurantId) {
      return NextResponse.json({ error: 'Table not found or unauthorized' }, { status: 404 })
    }

    // Optional: prohibit deletion when active orders exist - implement as needed

    await prisma.table.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting table:', error)
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 })
  }
}
