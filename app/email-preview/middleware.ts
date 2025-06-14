import { NextRequest, NextResponse } from 'next/server';

const isDev = process.env.NODE_ENV === 'development';

export function middleware(request: NextRequest) {
  // Only allow access in development mode
  if (!isDev) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/email-preview/:path*',
}; 