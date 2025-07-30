import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const rows = await prisma.menuItemIngredient.findMany({
    include: { menuItem: true, inventoryItem: true }
  })
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const row = await prisma.menuItemIngredient.create({ data: body })
  return NextResponse.json(row)
}
