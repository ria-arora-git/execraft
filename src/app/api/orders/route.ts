import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import ShortUniqueId from "short-uuid";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = req.nextUrl || new URL(req.url);
    const status = url.searchParams.get("status");

    const whereClause = status ? { status: status as any } : {};

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: { include: { menuItem: true } },
        table: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tableId, customerName, customerPhone, items, notes } = await req.json();

    if (!tableId || !customerName || !items?.length)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: { restaurant: true },
    });

    if (!table)
      return NextResponse.json({ error: "Table not found" }, { status: 404 });

    // Find or create active session for this table
    let session = await prisma.tableSession.findFirst({
      where: { tableId, status: "ACTIVE" },
    });

    if (!session) {
      session = await prisma.tableSession.create({
        data: {
          tableId,
          restaurantId: table.restaurantId,
          status: "ACTIVE",
        },
      });
    }

    const menuItemIds = items.map((i: any) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    let total = 0;

    const orderItemsData = items.map((item: any) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      if (!menuItem) throw new Error(`Menu item not found: ${item.menuItemId}`);

      const itemTotal = menuItem.price * item.quantity;
      total += itemTotal;

      return {
        menuItemId: menuItem.id,
        quantity: item.quantity,
        price: menuItem.price,
        notes: item.notes ?? null,
      };
    });

    const order = await prisma.order.create({
      data: {
        orderNumber: ShortUniqueId().generate(),
        tableId,
        restaurantId: table.restaurantId,
        sessionId: session.id,
        customerName,
        customerPhone: customerPhone ?? null,
        total,
        notes: notes ?? null,
        items: { create: orderItemsData },
      },
      include: {
        items: { include: { menuItem: true } },
        table: true,
      },
    });

    await reduceInventory(order);

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();
    if (!id || !status)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const validStatuses = ["PENDING", "PREPARING", "READY", "SERVED", "PAID", "CANCELLED"];
    if (!validStatuses.includes(status))
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: { include: { menuItem: true } },
        table: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

async function reduceInventory(order: any) {
  try {
    const orderData = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                ingredients: { include: { inventoryItem: true } },
              },
            },
          },
        },
      },
    });

    if (!orderData) return;

    const inventoryAdjustments: Record<string, number> = {};

    for (const orderItem of orderData.items) {
      for (const ingredient of orderItem.menuItem.ingredients) {
        const reduction = ingredient.quantity * orderItem.quantity;
        inventoryAdjustments[ingredient.inventoryItemId] = (inventoryAdjustments[ingredient.inventoryItemId] ?? 0) + reduction;
      }
    }

    for (const [inventoryId, qty] of Object.entries(inventoryAdjustments)) {
      const invItem = await prisma.inventoryItem.findUnique({ where: { id: inventoryId } });
      if (!invItem) continue;

      if (invItem.quantity < qty) continue;

      const newQty = invItem.quantity - qty;

      await prisma.inventoryItem.update({
        where: { id: inventoryId },
        data: {
          quantity: newQty,
          updatedAt: new Date(),
        },
      });

      await prisma.inventoryChangeLog.create({
        data: {
          inventoryItemId: inventoryId,
          changeAmount: -qty,
          changeType: "ORDER",
          orderId: order.id,
        },
      });

      if (newQty <= invItem.minStock) {
        // Check for existing unacknowledged alert
        const existingAlert = await prisma.stockAlert.findFirst({
          where: {
            inventoryItemId: inventoryId,
            alertType: "LOW_STOCK",
            acknowledged: false,
          },
        });

        if (!existingAlert) {
          await prisma.stockAlert.create({
            data: {
              inventoryItemId: inventoryId,
              alertType: "LOW_STOCK",
              threshold: invItem.minStock,
              message: `${invItem.name} running low (${newQty} ${invItem.unit})`,
              acknowledged: false,
              whatsappSent: false,
            },
          });
        }
      }
    }
  } catch (error) {
    console.error("Error reducing inventory:", error);
  }
}
