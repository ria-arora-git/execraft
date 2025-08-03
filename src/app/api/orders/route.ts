import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() 
    const { tableId, customerName, customerPhone, items, notes } = body

    if (!tableId || !customerName || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid order information' },
        { status: 400 }
      )
    }

    // Validate table existence and get restaurant info
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: { restaurant: true },
    })

    if (!table) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }

    // Find or create active session for the table
    let session = await prisma.tableSession.findFirst({
      where: {
        tableId,
        status: 'ACTIVE',
      },
    })
    if (!session) {
      session = await prisma.tableSession.create({
        data: {
          tableId,
          restaurantId: table.restaurantId,
          status: 'ACTIVE',
        },
      })
    }

    // Fetch menu items info for price calculation and validation
    const menuItemIds = items.map((item: any) => item.menuItemId)
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds }
      },
    })

    if (menuItems.length !== menuItemIds.length) {
      return NextResponse.json({ error: 'One or more menu items are invalid' }, { status: 400 })
    }

    // Build order items and calculate total price
    let total = 0
    const orderItemsData = items.map((item: any) => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId)!
      total += menuItem.price * item.quantity
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
        notes: item.notes ?? null,
      }
    })

    // Create the order with items
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        tableId,
        restaurantId: table.restaurantId,
        sessionId: session.id,
        customerName,
        customerPhone: customerPhone ?? null,
        total,
        notes: notes ?? null,
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: { include: { menuItem: true } },
        table: true,
      },
    })

    // Optionally, implement inventory deduction and alerts here (not shown)

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error placing order:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}


// Simple helper to generate order number strings
function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `ORD-${timestamp}-${randomStr}`
}
