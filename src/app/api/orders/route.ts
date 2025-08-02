import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { tableToken, items, customerName, customerPhone, notes } = await req.json()

    if (!tableToken || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid input' }, { status: 400 })
    }

    const table = await prisma.table.findUnique({
      where: { token: tableToken }
    })

    if (!table) {
      return NextResponse.json({ error: 'Invalid table token' }, { status: 400 })
    }

    let total = 0
    const orderItemsData = []

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } })
      if (!menuItem) {
        return NextResponse.json({ error: `Menu item not found: ${item.menuItemId}` }, { status: 400 })
      }
      if (!item.quantity || item.quantity <= 0) {
        return NextResponse.json({ error: `Invalid quantity for item: ${menuItem.name}` }, { status: 400 })
      }
      const price = menuItem.price
      total += price * item.quantity
      orderItemsData.push({
        menuItemId: menuItem.id,
        quantity: item.quantity,
        price,
        notes: item.notes ?? null
      })
    }

    // Deduct stock from inventory based on recipes
    for (const orderItem of orderItemsData) {
      const ingredients = await prisma.menuItemIngredient.findMany({
        where: { menuItemId: orderItem.menuItemId }
      })
      for (const ingredient of ingredients) {
        await prisma.inventoryItem.update({
          where: { id: ingredient.inventoryItemId },
          data: {
            quantity: {
              decrement: ingredient.quantity * orderItem.quantity
            },
            updatedAt: new Date()
          }
        })
      }
    }

    // Create a new table session
    const session = await prisma.tableSession.create({
      data: {
        tableId: table.id,
        restaurantId: table.restaurantId,
        status: 'ACTIVE'
      }
    })

    const orderNumber = `ORD-${Date.now()}-${table.number}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        tableId: table.id,
        restaurantId: table.restaurantId,
        sessionId: session.id,
        customerName: customerName || `Table ${table.number}`,
        customerPhone: customerPhone || null,
        status: 'PENDING',
        total,
        notes: notes || null,
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: { include: { menuItem: true } },
        table: true
      }
    })

    // Update table status
    await prisma.table.update({
      where: { id: table.id },
      data: { status: 'OCCUPIED' }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error placing order:', error)
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}
