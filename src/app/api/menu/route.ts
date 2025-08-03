import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const menuItems = await prisma.menuItem.findMany({
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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
      return NextResponse.json({ error: "No restaurant found" }, { status: 400 });
    }

    const newItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: Number(price),
        prepTime: prepTime !== undefined ? Number(prepTime) : null,
        category,
        image: image ?? null,
        restaurantId: restaurant.id,
      },
    });

    return NextResponse.json(newItem);
  } catch (error) {
    console.error("Error creating menu item:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}
