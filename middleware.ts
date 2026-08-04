import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /propiedades routes
  if (pathname.startsWith('/propiedades')) {
    const sessionCookie = request.cookies.get('arrigone-session');

    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const isValid = await verifySessionToken(sessionCookie.value);
    if (!isValid) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('arrigone-session');
      return response;
    }
  }

  // Redirect root to /propiedades or /login
  if (pathname === '/') {
    const sessionCookie = request.cookies.get('arrigone-session');
    if (sessionCookie?.value) {
      const isValid = await verifySessionToken(sessionCookie.value);
      if (isValid) {
        return NextResponse.redirect(new URL('/propiedades', request.url));
      }
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/propiedades/:path*'],
};
