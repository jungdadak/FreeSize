// app/api/auth/check-email/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return NextResponse.json({
      available: !existingUser,
      message: existingUser
        ? '이미 사용 중인 이메일입니다.'
        : '사용 가능한 이메일입니다.',
    });
  } catch (error) {
    console.error('Email check error:', error);
    return NextResponse.json(
      { message: '이메일 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
