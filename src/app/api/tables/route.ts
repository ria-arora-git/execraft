import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRestaurantContext } from '@/lib/restaurant-context'

export async function GET() {
  try {
    const { restaurantId } = await getRestaurantContext()

    const tables = await prisma.table.findMany({
      where: { restaurantId },
      orderBy: { number: 'asc' },
    })
    return NextResponse.json(tables)
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json({ error: 'Unauthorized or failed to fetch tables' }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { restaurantId } = await getRestaurantContext()
    const { number, capacity } = await req.json()

    if (typeof number !== 'number' || typeof capacity !== 'number' || capacity < 1) {
      return NextResponse.json({ error: 'Invalid table number or capacity' }, { status: 400 })
    }

    const existing = await prisma.table.findFirst({
      where: { number, restaurantId },
    })
    if (existing) return NextResponse.json({ error: 'Table number already exists' }, { status: 409 })

    const token = Math.random().toString(36).slice(2, 12).toUpperCase()

    const newTable = await prisma.table.create({
      data: {
        number,
        capacity,
        status: 'AVAILABLE',
        token,
        restaurantId,
      },
    })

    return NextResponse.json(newTable)
  } catch (error) {
    console.error('Error creating table:', error)
    return NextResponse.json({ error: 'Unauthorized or failed to create table' }, { status: 401 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { restaurantId } = await getRestaurantContext()
    const id = req.nextUrl.searchParams.get('id')
    
    if (!id) return NextResponse.json({ error: 'Missing table id' }, { status: 400 })

    const table = await prisma.table.findUnique({ where: { id } })
    if (!table || table.restaurantId !== restaurantId) {
      return NextResponse.json({ error: 'Table not found or unauthorized' }, { status: 404 })
    }

    // Check for active orders
    const activeOrdersCount = await prisma.order.count({
      where: {
        tableId: id,
        status: { notIn: ['PAID', 'CANCELLED'] }
      }
    })

    if (activeOrdersCount > 0) {
      return NextResponse.json({ error: 'Cannot delete table with active orders' }, { status: 400 })
    }

    await prisma.table.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting table:', error)
    return NextResponse.json({ error: 'Unauthorized or failed to delete table' }, { status: 401 })
  }
}
