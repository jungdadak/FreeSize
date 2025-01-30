// components/MaintenanceBanner.tsx
'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useMaintenance } from '@/hooks/useMaintenance';
import { cn } from '@/lib/utils';

export default function MaintenanceBanner() {
  const { banner, isLoading } = useMaintenance();
  const BANNER_HEIGHT = 'h-16'; // h-[64px] 대신 Tailwind 기본 클래스 사용

  if (isLoading) {
    return (
      <div
        className={cn(BANNER_HEIGHT, 'bg-transparent')} // mt-16 제거
        aria-hidden="true"
      />
    );
  }

  if (!banner?.isActive) {
    return <div className={cn(BANNER_HEIGHT)} aria-hidden="true" />; // mt-16 제거
  }

  return (
    <Alert
      variant={banner.type}
      className={cn('rounded-none border-none', BANNER_HEIGHT)} // mt-16 제거
    >
      <div className="container mx-auto flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <div>
          <AlertTitle>서비스 점검 안내</AlertTitle>
          <AlertDescription>{banner.message}</AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
