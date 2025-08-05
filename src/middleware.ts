import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect admin routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  const { userId } = await auth();
  
  // Auto-create user in database if authenticated and doesn't exist
  if (userId) {
    try {
      const user = await auth.user;
      if (user?.emailAddresses?.[0]?.emailAddress) {
        const existingUser = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (!existingUser) {
          // Find or create default restaurant
          let restaurant = await prisma.restaurant.findFirst();
          if (!restaurant) {
            restaurant = await prisma.restaurant.create({
              data: { name: 'Default Restaurant' }
            });
          }

          // Create user
          await prisma.user.create({
            data: {
              id: userId,
              email: user.emailAddresses[0].emailAddress,
              restaurantId: restaurant.id,
            }
          });
        }
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
