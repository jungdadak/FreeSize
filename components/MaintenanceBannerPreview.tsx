// components/MaintenanceBannerPreview.tsx
'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { MaintenanceType } from '@/types/maintenance';
import { variantStyles } from '@/lib/variantStyles';

interface MaintenanceBannerPreviewProps {
  isActive: boolean;
  message: string;
  type?: MaintenanceType;
}

export default function MaintenanceBannerPreview({
  isActive,
  message,
  type = 'warning',
}: MaintenanceBannerPreviewProps) {
  if (!isActive) return null;

  return (
    <Alert
      variant="destructive"
      className={cn(
        'rounded-none border-none text-white ',
        variantStyles[type]
      )}
    >
      <div className="container mx-auto flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <div>
          <AlertTitle>서비스 점검 안내</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
