// components/MaintenanceBanner.tsx
'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useMaintenance } from '@/hooks/useMaintenance';
import { cn } from '@/lib/utils';

export default function MaintenanceBanner() {
  const { banner, isLoading } = useMaintenance();
  const BANNER_HEIGHT = 'h-[64px]'; // 82px에서 64px로 수정

  if (isLoading) {
    return (
      <div
        className={cn(BANNER_HEIGHT, 'mt-16 bg-transparent')}
        aria-hidden="true"
      />
    );
  }

  if (!banner?.isActive) {
    return <div className={cn(BANNER_HEIGHT, 'mt-16')} aria-hidden="true" />;
  }

  return (
    <Alert
      variant={banner.type}
      className={cn('rounded-none border-none mt-16', BANNER_HEIGHT)}
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
