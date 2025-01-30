import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    if (request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/products', request.url));
    }
    const protectedRoutes = ['/admin'];
    const session = request.cookies.get('next-auth.session-token'); // Replace with actual session check
    if (!session && protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return NextResponse.next();
}