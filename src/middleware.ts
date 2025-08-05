import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/admin(.*)']);
// Add exclusion for the select organization page:
const isSelectOrgRoute = createRouteMatcher(['/admin/select-organization']);

export default clerkMiddleware(async (auth, req) => {
  // Allow access to select-org page regardless of orgId
  if (isSelectOrgRoute(req)) {
    return NextResponse.next();
  }

  if (isProtectedRoute(req)) {
    await auth.protect();

    const { orgId } = await auth(); // always get the current orgId
    if (!orgId) {
      // Only redirect if NOT already on select organization page
      return NextResponse.redirect(new URL('/admin/select-organization', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // You may want to mirror your old array + catch api public endpoints as well
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
