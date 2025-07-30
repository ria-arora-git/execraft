import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const items = await prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const item = await prisma.inventoryItem.create({ data })
  return NextResponse.json(item)
}

export async function PUT(req: NextRequest) {
  const data = await req.json()
  const item = await prisma.inventoryItem.update({ where: { id: data.id }, data })
  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id')!
  await prisma.inventoryItem.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
