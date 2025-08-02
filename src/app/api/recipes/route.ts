import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const recipes = await prisma.menuItemIngredient.findMany({
    include: { menuItem: true, inventoryItem: true },
    orderBy: { menuItem: { name: 'asc' } }
  })
  return NextResponse.json(recipes)
}

export async function POST(req: NextRequest) {
  const { menuItemId, inventoryItemId, quantity } = await req.json()

  if (!menuItemId || !inventoryItemId || !quantity) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  // Prevent duplicates    
  const exists = await prisma.menuItemIngredient.findFirst({
    where: { menuItemId, inventoryItemId }
  })

  if (exists) {
    return NextResponse.json({ error: 'Ingredient already added to this menu item' }, { status: 400 })
  }

  const ingredient = await prisma.menuItemIngredient.create({
    data: { menuItemId, inventoryItemId, quantity },
    include: { menuItem: true, inventoryItem: true }
  })

  return NextResponse.json(ingredient)
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  await prisma.menuItemIngredient.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
