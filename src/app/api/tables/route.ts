import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tables = await prisma.table.findMany({
      orderBy: { number: 'asc' },
    });

    return NextResponse.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { number, capacity } = await req.json();

    if (!number || !capacity || capacity < 1) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }

    // Check if table number already exists
    const existingTable = await prisma.table.findUnique({
      where: { number },
    });
    if (existingTable) {
      return NextResponse.json({ error: 'Table number already exists' }, { status: 400 });
    }

    // Generate token for the table (e.g., unique string)
    const token = Math.random().toString(36).substr(2, 10).toUpperCase();

    // Assuming single restaurant for now
    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant)
      return NextResponse.json({ error: 'No restaurant found' }, { status: 400 });

    const table = await prisma.table.create({
      data: {
        number,
        capacity,
        status: 'AVAILABLE',
        token,
        restaurantId: restaurant.id,
      },
    });

    return NextResponse.json(table);
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, number, capacity, status } = await req.json();

    if (!id || !number || !capacity || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate status in enum
    const validStatus = ['AVAILABLE', 'OCCUPIED'];
    if (!validStatus.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedTable = await prisma.table.update({
      where: { id },
      data: {
        number,
        capacity,
        status,
      },
    });

    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // Optionally, check for sessions/orders before deleting

    await prisma.table.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 });
  }
}
