// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userSelect } from '@/types/user';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    console.log('Signup request received:', { email, name }); // 비밀번호는 로그에 남기지 않음

    // 1. 사용자 생성 단계
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER',
      },
      select: userSelect,
    });
    console.log('User created successfully:', user.id);

    // 2. JWT 토큰 생성 단계
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );
    console.log('JWT token generated');

    // 3. 응답 생성 및 쿠키 설정
    const response = NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );

    // 4. 쿠키 설정
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60,
    });
    console.log('Cookie set successfully');

    return response;
  } catch (error) {
    console.error('Detailed signup error:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
