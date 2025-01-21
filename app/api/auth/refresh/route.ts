// app/api/auth/refresh/route.ts
import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { authenticate } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { userSelect } from '@/types/user';

export async function POST(request: NextRequest) {
  const currentUser = authenticate(request);

  if (!currentUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: userSelect,
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const newToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    const response = NextResponse.json(
      { message: 'Token refreshed successfully', token: newToken },
      { status: 200 }
    );

    response.cookies.set('auth-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
