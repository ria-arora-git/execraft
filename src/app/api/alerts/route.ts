export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRestaurantContext } from "@/lib/restaurant-context";

export async function GET() {
  try {
    const { restaurantId } = await getRestaurantContext();

    const alerts = await prisma.stockAlert.findMany({
      where: {
        acknowledged: false,
        inventoryItem: { restaurantId },
      },
      include: { inventoryItem: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { restaurantId } = await getRestaurantContext();
    const { id, acknowledged } = await req.json();

    if (!id || typeof acknowledged !== "boolean") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Verify alert ownership
    const alert = await prisma.stockAlert.findUnique({
      where: { id },
      include: { inventoryItem: true },
    });

    if (!alert || alert.inventoryItem.restaurantId !== restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, {status: 403});
    }

    const updatedAlert = await prisma.stockAlert.update({
      where: { id },
      data: { acknowledged },
    });

    return NextResponse.json(updatedAlert);
  } catch (error) {
    console.error("Failed to update alert:", error);
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}
