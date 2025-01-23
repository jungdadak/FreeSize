// components/MaintenanceBanner.tsx
'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useMaintenance } from '@/hooks/useMaintenance';
import { cn } from '@/lib/utils';

export default function MaintenanceBanner() {
  const { banner } = useMaintenance();

  if (!banner?.isActive) return null;

  return (
    <Alert
      variant={banner.type} // variant 속성 추가
      className={cn('rounded-none border-none mt-16')}
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
