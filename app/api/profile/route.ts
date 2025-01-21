//app/api/profile/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth';
import prisma from '@/lib/prisma';

const profileSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
} as const;

export async function GET(request: NextRequest) {
  const auth = authenticate(request);

  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userData = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: profileSelect,
    });

    if (!userData) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
