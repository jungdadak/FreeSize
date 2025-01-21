import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';

const useProtected = (requiredRole: 'USER' | 'ADMIN' | null = null) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        const response = await axios.get('/api/auth/profile');
        const user = response.data.user;

        if (!user || (requiredRole && user.role !== requiredRole)) {
          router.push('/auth/login');
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Access verification failed:', error);
        router.push('/auth/login');
      }
    };

    verifyAccess();
  }, [requiredRole, router]);

  return loading;
};

export default useProtected;
