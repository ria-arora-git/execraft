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

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get today's orders properly
    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
        },
      },
    });

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Get active orders count (not PAID or CANCELLED)
    const activeOrdersCount = await prisma.order.count({
      where: {
        status: {
          notIn: ['PAID', 'CANCELLED'],
        },
      },
    });

    // Get low stock items
    const lowStockItems = await prisma.inventoryItem.findMany({
      where: {
        quantity: {
          lte: prisma.inventoryItem.fields.minStock,
        },
      },
    });

    const data = {
      todayOrders: todayOrders.length,
      todayRevenue,
      lowStockCount: lowStockItems.length,
      activeOrdersCount,
      totalMenuItems: await prisma.menuItem.count(),
      totalInventoryItems: await prisma.inventoryItem.count(),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
