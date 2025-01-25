// hooks/useMaintenance.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaintenanceBanner } from '@/types/maintenance';

const MAINTENANCE_KEY = ['maintenance'];

const fetchMaintenance = async () => {
  const res = await fetch('/api/admin/maintenance');
  if (!res.ok) throw new Error('Failed to fetch maintenance status');
  return res.json() as Promise<MaintenanceBanner>;
};

export function useMaintenance() {
  const queryClient = useQueryClient();

  const {
    data: banner,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: MAINTENANCE_KEY,
    queryFn: fetchMaintenance,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const { mutate: updateBanner, isPending: isUpdating } = useMutation({
    mutationFn: async (newBanner: Partial<MaintenanceBanner>) => {
      const res = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBanner),
      });
      if (!res.ok) throw new Error('Failed to update maintenance status');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(MAINTENANCE_KEY, data);
    },
  });

  return {
    banner,
    isLoading,
    isError,
    error,
    updateBanner,
    isUpdating,
  };
}
