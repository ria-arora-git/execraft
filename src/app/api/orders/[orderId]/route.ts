import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const { status } = await req.json()

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id: params.orderId },
      data: { status },
      include: {
        table: true,
        items: {
          include: {
            menuItem: true
          }
        }
      }
    })

    // If order is paid, check if table can be marked as available
    if (status === 'PAID') {
      const otherActiveOrders = await prisma.order.findMany({
        where: {
          tableId: order.tableId,
          status: { not: 'PAID' },
          id: { not: params.orderId }
        }
      })

      if (otherActiveOrders.length === 0) {
        await prisma.table.update({
          where: { id: order.tableId },
          data: { status: 'AVAILABLE' }
        })
      }
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
