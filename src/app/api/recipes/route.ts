export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRestaurantContext } from '@/lib/restaurant-context'

export async function GET() {
  try {
    const { restaurantId } = await getRestaurantContext()

    // Fetch recipe ingredients (MenuItemIngredient) scoped by restaurant
    const recipeIngredients = await prisma.menuItemIngredient.findMany({
      where: {
        menuItem: { restaurantId }
      },
      include: {
        menuItem: true,
        inventoryItem: true
      },
      orderBy: {
        menuItem: { name: 'asc' }
      }
    })

    return NextResponse.json(recipeIngredients)
  } catch (error) {
    console.error('Failed to fetch recipes:', error)
    return NextResponse.json({ error: 'Unauthorized or failed to fetch recipes' }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { restaurantId } = await getRestaurantContext()
    const body = await req.json()
    console.log('POST /api/recipes body:', body)

    const { menuItemId, inventoryItemId, quantity } = body

    // Validation
    if (!menuItemId || !inventoryItemId || typeof quantity !== 'number' || quantity <= 0) {
      console.error('Invalid input:', body)
      return NextResponse.json(
        { error: 'Missing or invalid fields: menuItemId, inventoryItemId, and positive quantity required' },
        { status: 400 }
      )
    }

    // Verify menu item belongs to this restaurant
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId }
    })

    if (!menuItem || menuItem.restaurantId !== restaurantId) {
      return NextResponse.json({ error: 'Menu item not found or unauthorized' }, { status: 404 })
    }

    // Verify inventory item belongs to this restaurant
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId }
    })

    if (!inventoryItem || inventoryItem.restaurantId !== restaurantId) {
      return NextResponse.json({ error: 'Inventory item not found or unauthorized' }, { status: 404 })
    }

    // Check if this combination already exists
    const existingIngredient = await prisma.menuItemIngredient.findUnique({
      where: {
        menuItemId_inventoryItemId: {
          menuItemId,
          inventoryItemId
        }
      }
    })

    if (existingIngredient) {
      return NextResponse.json({ error: 'This ingredient is already added to this menu item' }, { status: 409 })
    }

    // Create the recipe ingredient
    const newRecipeIngredient = await prisma.menuItemIngredient.create({
      data: {
        menuItemId,
        inventoryItemId,
        quantity
      },
      include: {
        menuItem: true,
        inventoryItem: true
      }
    })

    return NextResponse.json(newRecipeIngredient)
  } catch (error) {
    console.error('Failed to add recipe ingredient:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { restaurantId } = await getRestaurantContext()
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing ingredient ID' }, { status: 400 })
    }

    // Verify the ingredient belongs to this restaurant
    const ingredient = await prisma.menuItemIngredient.findUnique({
      where: { id },
      include: { menuItem: true }
    })

    if (!ingredient || ingredient.menuItem.restaurantId !== restaurantId) {
      return NextResponse.json({ error: 'Ingredient not found or unauthorized' }, { status: 404 })
    }

    await prisma.menuItemIngredient.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete recipe ingredient:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
