// app/api/admin/maintenance/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  // GET은 모든 사용자가 접근 가능하도록
  const banner = await prisma.maintenanceBanner.findFirst();
  return NextResponse.json(banner);
}

export async function POST(req: Request) {
  const session = await auth();

  // 관리자 권한 체크
  if (!session || session.user.role !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }

  const { isActive, message, type } = await req.json();

  // type 필드 유효성 검사
  const validTypes = ['destructive', 'warning', 'info', 'maintenance'];
  if (!validTypes.includes(type)) {
    return new Response('Invalid maintenance type', { status: 400 });
  }

  const banner = await prisma.maintenanceBanner.upsert({
    where: { id: 1 },
    update: { isActive, message, type }, // type 추가
    create: { isActive, message, type }, // type 추가
  });

  return NextResponse.json(banner);
}
