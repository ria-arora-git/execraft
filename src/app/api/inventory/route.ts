import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl || new URL(req.url)
    const id = url.searchParams.get('id')

    if (id) {
      // Return all recipes using this inventory item
      const recipes = await prisma.menuItemIngredient.findMany({
        where: { inventoryItemId: id },
        include: { menuItem: true }
      })
      return NextResponse.json({
        usedIn: recipes.map((i) => i.menuItem.name)
      })
    }

    // Return all inventory items if no id param
    const items = await prisma.inventoryItem.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching inventory or usage:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory or usage' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, unit, quantity, minStock } = await req.json()

    if (!name || !unit || quantity === undefined || minStock === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (quantity < 0 || minStock < 0) {
      return NextResponse.json({ error: 'Quantity values must be non-negative' }, { status: 400 })
    }

    // Fetch or infer restaurant - adjust as needed for your app context
    const restaurant = await prisma.restaurant.findFirst()
    if (!restaurant) {
      return NextResponse.json({ error: 'No restaurant found' }, { status: 400 })
    }

    const newItem = await prisma.inventoryItem.create({
      data: {
        name,
        unit,
        quantity,
        minStock,
        restaurantId: restaurant.id,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(newItem)
  } catch (error) {
    console.error('Error creating inventory item:', error)
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, quantityChange } = await req.json()

    if (!id || typeof quantityChange !== 'number') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const item = await prisma.inventoryItem.findUnique({ where: { id } })
    if (!item) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    const newQuantity = item.quantity + quantityChange
    if (newQuantity < 0) {
      return NextResponse.json({ error: 'Resulting quantity cannot be negative' }, { status: 400 })
    }

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: {
        quantity: newQuantity,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating inventory:', error)
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const id = (req.nextUrl || new URL(req.url)).searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing item ID' }, { status: 400 })
  }
  try {
    // Optional: Check if inventory item is used in any recipes before deleting
    const usageCount = await prisma.menuItemIngredient.count({
      where: { inventoryItemId: id }
    })

    if (usageCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete inventory item because it is used in one or more recipes. Remove it from recipes first.' },
        { status: 400 }
      )
    }

    // Proceed with deletion if safe
    await prisma.inventoryItem.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting inventory item:', error)
    return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 })
  }
}
