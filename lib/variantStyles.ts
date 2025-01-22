// lib/variantStyles.ts
import { MaintenanceType } from '@/types/maintenance';

export const variantStyles: Record<MaintenanceType, string> = {
  destructive: 'bg-red-600',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
  maintenance: 'bg-orange-500',
};
