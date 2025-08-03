import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { name, description, price, prepTime, category, image } = data;

    if (!name || !description || price === undefined || !category)
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });

    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        price: Number(price),
        prepTime: prepTime ?? null,
        category,
        image: image || null,
      },
    });

    return new Response(JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to update menu item:', error);
    return new Response(JSON.stringify({ error: 'Failed to update menu item' }), { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check active orders referencing menu item
    const activeOrders = await prisma.orderItem.findFirst({
      where: {
        menuItemId: id,
        order: {
          NOT: {
            status: 'PAID',
          },
        },
      },
    });

    if (activeOrders) {
      return new Response(
        JSON.stringify({ error: 'Cannot delete menu item referenced in active orders.' }),
        { status: 400 }
      );
    }

    // Remove recipe ingredients
    await prisma.menuItemIngredient.deleteMany({
      where: { menuItemId: id },
    });

    // Delete menu item
    await prisma.menuItem.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error('Failed to delete menu item:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete menu item' }), { status: 500 });
  }
}
