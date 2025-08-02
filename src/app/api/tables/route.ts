import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { number: 'asc' },
      include: {
        orders: {
          where: { status: { not: 'PAID' } },
          select: { id: true, status: true, total: true }
        }
      }
    })
    return NextResponse.json(tables)
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { number, capacity } = await req.json()

    if (!number || !capacity) {
      return NextResponse.json({ error: 'Number and capacity are required' }, { status: 400 })
    }

    const existingTable = await prisma.table.findUnique({
      where: { number: parseInt(number) }
    })

    if (existingTable) {
      return NextResponse.json({ error: 'Table number already exists' }, { status: 400 })
    }

    const restaurant = await prisma.restaurant.findFirst()
    if (!restaurant) {
      return NextResponse.json({ error: 'No restaurant found' }, { status: 400 })
    }

    const token = `tbl_${number}_${nanoid(8)}`

    const table = await prisma.table.create({
      data: {
        number: parseInt(number),
        capacity: parseInt(capacity),
        status: 'AVAILABLE',
        token,
        restaurantId: restaurant.id
      }
    })

    return NextResponse.json(table)
  } catch (error) {
    console.error('Error creating table:', error)
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Table ID is required' }, { status: 400 })
    }

    const activeOrders = await prisma.order.findMany({
      where: {
        tableId: id,
        status: { not: 'PAID' }
      }
    })

    if (activeOrders.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete table with active orders' 
      }, { status: 400 })
    }

    await prisma.table.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting table:', error)
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 })
  }
}
