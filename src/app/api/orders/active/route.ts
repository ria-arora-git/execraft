export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Orders with status NOT PAID (active)
    const activeOrders = await prisma.order.findMany({
      where: {
        status: {
          not: 'PAID',
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        table: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(activeOrders);
  } catch (error) {
    console.error('Error fetching active orders:', error);
    return NextResponse.json({ error: 'Failed to fetch active orders' }, { status: 500 });
  }
}
