export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRestaurantContext } from '@/lib/restaurant-context'

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

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: { restaurant: true },
    })

    if (!table) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }

    const restaurantId = table.restaurantId

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
          restaurantId,
          status: 'ACTIVE',
        },
      })
    }

    const menuItemIds = items.map((item: any) => item.menuItemId)

    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        restaurantId,
      },
      include: {
        ingredients: {
          include: {
            inventoryItem: true,
          },
        },
      },
    })

    if (menuItems.length !== menuItemIds.length) {
      return NextResponse.json({ error: 'One or more menu items are invalid' }, { status: 400 })
    }

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

    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          tableId,
          restaurantId,
          sessionId: session.id,
          customerName,
          customerPhone: customerPhone ?? null,
          total,
          notes: notes ?? null,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: { include: { menuItem: true } },
          table: true,
        },
      })

      // Deduct inventory for each menu item
      for (const item of items) {
        const menuItem = menuItems.find(mi => mi.id === item.menuItemId)!

        for (const ingredient of menuItem.ingredients) {
          const requiredQuantity = ingredient.quantity * item.quantity

          const currentInventory = await tx.inventoryItem.findUnique({
            where: { id: ingredient.inventoryItemId },
          })

          if (!currentInventory || currentInventory.quantity < requiredQuantity) {
            throw new Error(`Insufficient inventory for ${currentInventory?.name || 'ingredient'}`)
          }

          await tx.inventoryItem.update({
            where: { id: ingredient.inventoryItemId },
            data: {
              quantity: currentInventory.quantity - requiredQuantity,
            },
          })

          await tx.inventoryChangeLog.create({
            data: {
              inventoryItemId: ingredient.inventoryItemId,
              changeAmount: -requiredQuantity,
              changeType: 'ORDER',
              orderId: order.id,
            },
          })

          const updatedInventory = currentInventory.quantity - requiredQuantity
          if (updatedInventory <= currentInventory.minStock) {
            const existingAlert = await tx.stockAlert.findFirst({
              where: {
                inventoryItemId: ingredient.inventoryItemId,
                alertType: 'LOW_STOCK',
                acknowledged: false,
              },
            })

            if (!existingAlert) {
              await tx.stockAlert.create({
                data: {
                  inventoryItemId: ingredient.inventoryItemId,
                  alertType: 'LOW_STOCK',
                  threshold: currentInventory.minStock,
                  message: `${currentInventory.name} running low (${updatedInventory} ${currentInventory.unit})`,
                },
              })
            }
          }
        }
      }

      // Update table status to OCCUPIED upon order creation
      await tx.table.update({
        where: { id: tableId },
        data: { status: 'OCCUPIED' },
      })

      return order
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error placing order:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { restaurantId } = await getRestaurantContext()
    const body = await req.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing order ID or status' }, { status: 400 })
    }

    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'SERVED', 'PAID', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const existingOrder = await prisma.order.findUnique({ where: { id } })
    if (!existingOrder || existingOrder.restaurantId !== restaurantId) {
      return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 })
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: { include: { menuItem: true } }, table: true },
    })

    // After updating order status, check if table still has active orders
    const activeOrdersCount = await prisma.order.count({
      where: {
        tableId: updatedOrder.tableId,
        status: { notIn: ['PAID', 'CANCELLED'] },
      },
    })

    // Update table status accordingly
    await prisma.table.update({
      where: { id: updatedOrder.tableId },
      data: { status: activeOrdersCount > 0 ? 'OCCUPIED' : 'AVAILABLE' },
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'Unauthorized or failed to update order status' },
      { status: 401 }
    )
  }
}

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `ORD-${timestamp}-${randomStr}`
}
