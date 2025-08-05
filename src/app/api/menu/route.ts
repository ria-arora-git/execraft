export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRestaurantContext } from "@/lib/restaurant-context";
import { getPublicRestaurantByTableToken } from "@/lib/restaurant-context";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tableToken = url.searchParams.get('tableToken');
    
    let restaurantId: string;
    
    if (tableToken) {
      // Public access - get restaurant from table token
      const { restaurantId: publicRestaurantId } = await getPublicRestaurantByTableToken(tableToken);
      restaurantId = publicRestaurantId;
    } else {
      // Admin access - use auth context
      const context = await getRestaurantContext();
      restaurantId = context.restaurantId;
    }

    const menuItems = await prisma.menuItem.findMany({
      where: { restaurantId },
      orderBy: [
        { category: "asc" },
        { name: "asc" },
      ],
    });
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { restaurantId } = await getRestaurantContext()
    const body = await req.json();
    const { name, description, price, prepTime, category, image } = body;

    if (
      !name ||
      !description ||
      price === undefined ||
      price === null ||
      !category
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: Number(price),
        prepTime: prepTime !== undefined ? Number(prepTime) : null,
        category,
        image: image ?? null,
        restaurantId,
      },
    });

    return NextResponse.json(newItem);
  } catch (error) {
    console.error("Error creating menu item:", error);
    return NextResponse.json(
      { error: "Unauthorized or failed to create menu item" },
      { status: 401 }
    );
  }
}
