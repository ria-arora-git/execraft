export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = req.nextUrl || new URL(req.url);
    const menuItemId = url.searchParams.get("menuItemId");

    const where = menuItemId ? { menuItemId } : {};

    const recipes = await prisma.menuItemIngredient.findMany({
      where,
      include: {
        menuItem: true,
        inventoryItem: true,
      },
      orderBy: [
        { menuItem: { name: "asc" } },
        { inventoryItem: { name: "asc" } },
      ],
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
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

    const { menuItemId, inventoryItemId, quantity } = await req.json();

    if (!menuItemId || !inventoryItemId || quantity <= 0)
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400 }
      );

    // Preventing duplicate ingredient entry
    const exists = await prisma.menuItemIngredient.findUnique({
      where: {
        menuItemId_inventoryItemId: {
          menuItemId,
          inventoryItemId,
        },
      },
    });

    if (exists)
      return NextResponse.json(
        { error: "Ingredient already exists for this menu item" },
        { status: 400 }
      );

    const newIngredient = await prisma.menuItemIngredient.create({
      data: {
        menuItemId,
        inventoryItemId,
        quantity,
      },
    });

    return NextResponse.json(newIngredient);
  } catch (error) {
    console.error("Error creating recipe ingredient:", error);
    return NextResponse.json(
      { error: "Failed to add ingredient" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.menuItemIngredient.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recipe ingredient:", error);
    return NextResponse.json(
      { error: "Failed to delete ingredient" },
      { status: 500 }
    );
  }
}
