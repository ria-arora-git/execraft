import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Clerk auth: only authenticated users
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all "active" (open/unpaid) orders
    const activeOrders = await prisma.order.findMany({
      where: {
        status: {
          notIn: ['PAID', 'CANCELLED'],
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        table: true,
        items: {
          include: { menuItem: true },
        },
        session: true,
      },
    });

    return NextResponse.json(activeOrders);
  } catch (error) {
    console.error('Error fetching active orders:', error);
    return NextResponse.json({ error: 'Failed to fetch active orders' }, { status: 500 });
  }
}
