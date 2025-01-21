// lib/auth.ts
import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: number;
  email: string;
  role: 'USER' | 'ADMIN';
  iat: number;
  exp: number;
}

/**
 * JWT를 HTTP-Only 쿠키에서 추출하고 검증합니다.
 * @param request Next.js Request 객체
 * @returns DecodedToken 또는 null
 */
export function authenticate(request: NextRequest): DecodedToken | null {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * 특정 역할을 가진 사용자만 접근할 수 있도록 권한을 부여합니다.
 * @param allowedRoles 허용된 역할 배열
 * @returns 사용자 정보 또는 403 Forbidden 응답
 */
export function authorize(allowedRoles: ('USER' | 'ADMIN')[]) {
  return (request: NextRequest): DecodedToken | NextResponse => {
    const user = authenticate(request);
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    return user;
  };
}
