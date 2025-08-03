import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Aggregate data
    const totalOrders = await prisma.order.count();
    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
        },
      },
    });

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    
    const lowStockCount = await prisma.inventoryItem.count({
      where: {
        quantity: {
          lte: prisma.inventoryItem.fields.minStock,
        },
      },
    });
    
    const activeOrdersCount = await prisma.order.count({
      where: {
        status: {
          not: 'PAID',
        },
      },
    });

    const totalMenuItems = await prisma.menuItem.count();
    const totalInventoryItems = await prisma.inventoryItem.count();

    const data = {
      totalOrders,
      todayRevenue,
      lowStockCount,
      activeOrdersCount,
      totalMenuItems,
      totalInventoryItems,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
