import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = [
    '/',
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/how-it-works',
    '/docs',
    '/pricing',
    '/terms',
    '/privacy',
    '/api/test-db',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the route is public
    const isPublicRoute = publicRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    // Allow public routes and static files
    if (isPublicRoute || pathname.startsWith('/_next') || pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // For protected routes, check for Firebase auth token in cookie
    const firebaseToken = request.cookies.get('firebase-token');

    if (!firebaseToken) {
        // Redirect to sign-in if not authenticated
        const signInUrl = new URL('/sign-in', request.url);
        signInUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
