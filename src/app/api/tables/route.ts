import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10)

export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { number: 'asc' }
    })
    return NextResponse.json(tables)
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { number, capacity } = body

    if (!number || !capacity) {
      return NextResponse.json({ error: 'Number and capacity are required' }, { status: 400 })
    }

    // Check if table number is unique
    const existing = await prisma.table.findUnique({ where: { number } })
    if (existing) {
      return NextResponse.json({ error: 'Table number already exists' }, { status: 400 })
    }

    // Generate a unique token for the table (URL-safe)
    const token = nanoid()

    const table = await prisma.table.create({
      data: {
        number,
        capacity,
        status: 'AVAILABLE',
        token,
        restaurantId: 'default-restaurant-id' // Replace with actual restaurant ID or setup logic
      }
    })

    return NextResponse.json(table)
  } catch (error) {
    console.error('Error creating table:', error)
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 })
  }
}
