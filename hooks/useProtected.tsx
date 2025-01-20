// hooks/useProtected.ts
import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';

const useProtected = (requiredRole: 'USER' | 'ADMIN' | null = null) => {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      router.push('/');
      return;
    }
  }, [user, requiredRole, router]);
};

export default useProtected;
