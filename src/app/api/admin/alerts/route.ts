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

    // Fetch unacknowledged alerts
    const alerts = await prisma.stockAlert.findMany({
      where: {
        acknowledged: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        inventoryItem: true,
      },
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { alertId, acknowledged } = body;

    if (!alertId || typeof acknowledged !== 'boolean')
      return new Response(JSON.stringify({ error: 'Missing or invalid fields' }), { status: 400 });

    const updatedAlert = await prisma.stockAlert.update({
      where: { id: alertId },
      data: { acknowledged },
    });

    return new Response(JSON.stringify(updatedAlert));
  } catch (error) {
    console.error('Failed to update alert:', error);
    return new Response(JSON.stringify({ error: 'Failed to update alert' }), { status: 500 });
  }
}
