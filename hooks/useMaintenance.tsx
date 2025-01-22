// hooks/useMaintenance.tsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MaintenanceType } from '@/types/maintenance';

interface MaintenanceBanner {
  id: number;
  isActive: boolean;
  message: string;
  type: MaintenanceType;
  updatedAt: string;
}

interface UpdateMaintenanceData {
  isActive: boolean;
  message: string;
  type: MaintenanceType;
}

export const useMaintenance = () => {
  const queryClient = useQueryClient();

  const {
    data: banner,
    isLoading,
    isError,
    error,
  } = useQuery<MaintenanceBanner, Error>({
    queryKey: ['maintenance'],
    queryFn: async () => {
      const res = await fetch('/api/admin/maintenance');
      if (!res.ok) throw new Error('Failed to fetch maintenance status');
      return res.json();
    },
  });

  const mutation = useMutation<MaintenanceBanner, Error, UpdateMaintenanceData>(
    {
      mutationFn: async (data: UpdateMaintenanceData) => {
        const res = await fetch('/api/admin/maintenance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update maintenance status');
        return res.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      },
    }
  );

  return {
    banner,
    isLoading,
    isError,
    error,
    updateBanner: mutation.mutate,
    isUpdating: mutation.isPending, // React Query v5에서는 isPending 사용
  };
};
