import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function getRestaurantContext() {
  const { userId, orgId } = await auth()
  
  if (!userId || !orgId) {
    throw new Error('Unauthorized: No user or organization context')
  }

  // Find or create restaurant for this organization
  let restaurant = await prisma.restaurant.findUnique({
    where: { clerkOrgId: orgId }
  })

  if (!restaurant) {
    // Create restaurant for new organization
    restaurant = await prisma.restaurant.create({
      data: {
        name: `Restaurant ${orgId.slice(-6)}`,
        clerkOrgId: orgId,
      }
    })
  }

  return {
    userId,
    orgId,
    restaurantId: restaurant.id,
    restaurant
  }
}

export async function getPublicRestaurantByTableToken(token: string) {
  const table = await prisma.table.findUnique({
    where: { token },
    include: { restaurant: true }
  })
  
  if (!table) {
    throw new Error('Invalid table token')
  }
  
  return {
    table,
    restaurant: table.restaurant,
    restaurantId: table.restaurantId
  }
}
