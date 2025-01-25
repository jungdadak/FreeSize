// types/maintenance.ts
export type MaintenanceType =
  | 'destructive'
  | 'warning'
  | 'info'
  | 'maintenance';

export interface MaintenanceBanner {
  isActive: boolean;
  message: string;
  type: MaintenanceType;
}
