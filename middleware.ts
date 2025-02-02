import { auth } from './auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAdminUser = req.auth?.user?.role === 'ADMIN';
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  const isAuthRoute =
    req.nextUrl.pathname.startsWith('/auth/login') ||
    req.nextUrl.pathname.startsWith('/auth/signup');
  const isProfileRoute = req.nextUrl.pathname.startsWith('/profile');
  // 프로필 페이지 접근 제어
  if (isProfileRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
  // 이미 로그인한 사용자가 로그인/회원가입 페이지 접근 시 리다이렉트
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 관리자 페이지 접근 제어
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    if (!isAdminUser) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // 기본적으로 요청을 허용
  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*', '/auth/login', '/auth/signup', '/profile/:path*'],
};
