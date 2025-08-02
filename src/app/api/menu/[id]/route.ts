import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, description, price, prepTime, category, image } = await req.json()

    if (!name || !description || !price || !prepTime || !category) {
      return NextResponse.json({ error: 'All fields except image are required' }, { status: 400 })
    }

    const menuItem = await prisma.menuItem.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price: parseFloat(price),
        prepTime: parseInt(prepTime),
        category,
        image: image || null
      }
    })

    return NextResponse.json(menuItem)
  } catch (error) {
    console.error('Error updating menu item:', error)
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if menu item is used in any active orders
    const activeOrders = await prisma.orderItem.findMany({
      where: {
        menuItemId: params.id,
        order: {
          status: { not: 'PAID' }
        }
      }
    })

    if (activeOrders.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete menu item that is in active orders' 
      }, { status: 400 })
    }

    // Delete related recipe ingredients first
    await prisma.menuItemIngredient.deleteMany({
      where: { menuItemId: params.id }
    })

    // Delete the menu item
    await prisma.menuItem.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 })
  }
}
