// hooks/useRequireAuth.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';

export function useRequireAuth(requiredRole?: 'ADMIN' | 'USER') {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
    const verify = async () => {
      await checkAuth();

      if (!user) {
        router.replace('/auth/login');
        return;
      }

      if (requiredRole && user.role !== requiredRole) {
        router.replace('/');
      }
    };

    verify();
  }, [user, requiredRole, router, checkAuth]);

  return user;
}
