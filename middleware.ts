// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // Admin 페이지 접근 제어
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const user = authenticate(request);

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // Protected 페이지 접근 제어
  if (request.nextUrl.pathname.startsWith('/profile')) {
    const user = authenticate(request);

    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*'],
};
