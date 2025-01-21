// app/api/users/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { userSelect } from '@/types/user';

export async function GET(request: NextRequest) {
  const user = authenticate(request);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: userSelect,
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = authenticate(request);

  // 인증 및 권한 확인
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const { email, password, name, role } = await request.json();

    // 입력값 유효성 검사
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!['ADMIN', 'USER'].includes(role)) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }

    // 이메일 중복 체크
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 409 }
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
      select: userSelect,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);

    // 예상치 못한 오류 처리
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
