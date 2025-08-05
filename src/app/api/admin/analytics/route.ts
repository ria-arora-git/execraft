export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRestaurantContext } from '@/lib/restaurant-context';

export async function GET() {
  try {
    const { restaurantId } = await getRestaurantContext()

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get today's orders for this restaurant only
    const todayOrders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: {
          gte: startOfDay,
        },
      },
    });

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Get active orders count for this restaurant
    const activeOrdersCount = await prisma.order.count({
      where: {
        restaurantId,
        status: {
          notIn: ['PAID', 'CANCELLED'],
        },
      },
    });

    // Get low stock items for this restaurant
    const lowStockItems = await prisma.inventoryItem.findMany({
      where: {
        restaurantId,
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
      totalMenuItems: await prisma.menuItem.count({ where: { restaurantId } }),
      totalInventoryItems: await prisma.inventoryItem.count({ where: { restaurantId } }),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json({ error: 'Unauthorized or failed to fetch analytics' }, { status: 401 });
  }
}
