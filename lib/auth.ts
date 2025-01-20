// lib/auth.ts
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: number;
  email: string;
  role: 'USER' | 'ADMIN';
  iat: number;
  exp: number;
}

export async function authenticate(
  request: Request
): Promise<DecodedToken | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
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

export function authorize(allowedRoles: ('USER' | 'ADMIN')[]) {
  return async (request: Request) => {
    const user = await authenticate(request);
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    return user;
  };
}
