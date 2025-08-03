export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = req.nextUrl ?? new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      // Return menu items (recipes) that use this inventory item
      const usage = await prisma.menuItemIngredient.findMany({
        where: { inventoryItemId: id },
        include: { menuItem: true },
      });
      return NextResponse.json({
        usedIn: usage.map((u) => u.menuItem?.name ?? ""),
      });
    }

    // Otherwise, return all inventory items with any unacknowledged alerts
    const items = await prisma.inventoryItem.findMany({
      orderBy: { name: "asc" },
      include: {
        alerts: { where: { acknowledged: false } },
      },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, unit, quantity, minStock } = await req.json();

    if (
      !name ||
      !unit ||
      typeof quantity !== "number" ||
      typeof minStock !== "number"
    )
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );

    if (quantity < 0 || minStock < 0)
      return NextResponse.json(
        { error: "Values must be non-negative" },
        { status: 400 }
      );

    if (!/^[a-zA-Z]{1,10}$/.test(unit.trim()))
      return NextResponse.json(
        { error: "Unit must be text (e.g. kg, pcs)" },
        { status: 400 }
      );

    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant)
      return NextResponse.json({ error: "No restaurant found" }, { status: 400 });

    const newItem = await prisma.inventoryItem.create({
      data: {
        name,
        unit,
        quantity,
        minStock,
        restaurantId: restaurant.id,
        updatedAt: new Date(),
      },
    });

    // Create alert if necessary
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
    console.error("Error creating inventory item:", error);
    return NextResponse.json(
      { error: "Failed to create inventory item" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, quantityChange } = await req.json();

    if (!id || typeof quantityChange !== "number")
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const item = await prisma.inventoryItem.findUnique({ where: { id } });

    if (!item)
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 });

    const newQuantity = item.quantity + quantityChange;

    if (newQuantity < 0)
      return NextResponse.json({ error: "Resulting quantity cannot be negative" }, { status: 400 });

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
        userId,
      },
    });

    // Create alert if stock is low
    if (newQuantity <= item.minStock) {
      const existingAlert = await prisma.stockAlert.findFirst({
        where: {
          inventoryItemId: id,
          alertType: "LOW_STOCK",
          acknowledged: false,
        },
      });

      if (!existingAlert) {
        await prisma.stockAlert.create({
          data: {
            inventoryItemId: id,
            alertType: "LOW_STOCK",
            threshold: item.minStock,
            message: `${item.name} running low (${newQuantity} ${item.unit})`,
          },
        });
      }
    }

    return NextResponse.json({ message: "Inventory updated" });
  } catch (error) {
    console.error("Error updating inventory:", error);
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = req.nextUrl ?? new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const usageCount = await prisma.menuItemIngredient.count({
      where: { inventoryItemId: id },
    });

    if (usageCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete inventory item; it is used in one or more recipes.",
        },
        { status: 400 }
      );
    }

    await prisma.inventoryItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return NextResponse.json(
      { error: "Failed to delete inventory item" },
      { status: 500 }
    );
  }
}
