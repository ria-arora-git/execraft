import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/',
    '/sign-in',
    '/sign-up',
    '/admin/:path*',
    '/api/:path*',
    '/api/orders/public',
    '/api/webhook',
  ],
};
