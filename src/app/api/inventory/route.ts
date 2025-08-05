export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRestaurantContext } from "@/lib/restaurant-context";

export async function GET(req: NextRequest) {
  try {
    const { restaurantId } = await getRestaurantContext();
    const url = req.nextUrl ?? new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      // Return where ingredient is used (for deletion warning)
      const usage = await prisma.menuItemIngredient.findMany({
        where: {
          inventoryItemId: id,
          menuItem: { restaurantId },
        },
        include: { menuItem: true },
      });
      return NextResponse.json({
        usedIn: usage.map((u) => u.menuItem?.name ?? ""),
      });
    }

    // Return all inventory items with unacknowledged alerts
    const items = await prisma.inventoryItem.findMany({
      where: { restaurantId },
      orderBy: { name: "asc" },
      include: {
        alerts: {
          where: { acknowledged: false },
        },
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    return NextResponse.json(
      { error: "Unauthorized or failed to fetch inventory" },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { restaurantId } = await getRestaurantContext();
    const { name, unit, quantity, minStock } = await req.json();

    if (!name || !unit || quantity == null || minStock == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (quantity < 0 || minStock < 0) {
      return NextResponse.json({ error: "Values must be non-negative" }, { status: 400 });
    }

    if (!/^[a-zA-Z]{1,10}$/.test(unit.trim())) {
      return NextResponse.json({ error: "Unit must be alphabetic (e.g., pcs, kg)" }, { status: 400 });
    }

    const newItem = await prisma.inventoryItem.create({
      data: {
        name,
        unit,
        quantity,
        minStock,
        restaurantId,
        updatedAt: new Date(),
      },
    });

    // Create alert if already below threshold
    if (quantity <= minStock) {
      await prisma.stockAlert.create({
        data: {
          inventoryItemId: newItem.id,
          alertType: "LOW_STOCK",
          threshold: minStock,
          message: `${name} running low (${quantity} ${unit})`,
        },
      });
    }

    return NextResponse.json(newItem);
  } catch (error) {
    console.error("Failed to create inventory item:", error);
    return NextResponse.json(
      { error: "Unauthorized or failed to create inventory item" },
      { status: 401 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { restaurantId } = await getRestaurantContext();
    const { id, quantityChange } = await req.json();

    if (!id || typeof quantityChange !== "number") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const item = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!item || item.restaurantId !== restaurantId) {
      return NextResponse.json({ error: "Item not found or unauthorized" }, { status: 404 });
    }

    const newQuantity = item.quantity + quantityChange;
    if (newQuantity < 0) {
      return NextResponse.json({ error: "Resulting quantity cannot be negative" }, { status: 400 });
    }

    await prisma.inventoryItem.update({
      where: { id },
      data: { quantity: newQuantity, updatedAt: new Date() },
    });

    // Log the change
    await prisma.inventoryChangeLog.create({
      data: {
        inventoryItemId: id,
        changeAmount: quantityChange,
        changeType: "MANUAL",
      },
    });

    // Check for existing unacknowledged alerts
    const existingAlert = await prisma.stockAlert.findFirst({
      where: {
        inventoryItemId: id,
        alertType: "LOW_STOCK",
        acknowledged: false,
      },
    });

    // Create alert if below threshold and no existing alert
    if (newQuantity <= item.minStock && !existingAlert) {
      await prisma.stockAlert.create({
        data: {
          inventoryItemId: id,
          alertType: "LOW_STOCK",
          threshold: item.minStock,
          message: `${item.name} running low (${newQuantity} ${item.unit})`,
        },
      });
    }

    return NextResponse.json({ message: "Inventory updated" });
  } catch (error) {
    console.error("Failed to update inventory:", error);
    return NextResponse.json({ error: "Unauthorized or failed to update inventory" }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { restaurantId } = await getRestaurantContext();
    const id = req.nextUrl?.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const item = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!item || item.restaurantId !== restaurantId) {
      return NextResponse.json({ error: "Item not found or unauthorized" }, { status: 404 });
    }

    const usageCount = await prisma.menuItemIngredient.count({ where: { inventoryItemId: id } });
    if (usageCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete; ingredient is used in recipes." },
        { status: 400 }
      );
    }

    await prisma.inventoryItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete inventory:", error);
    return NextResponse.json({ error: "Unauthorized or failed to delete inventory" }, { status: 401 });
  }
}
