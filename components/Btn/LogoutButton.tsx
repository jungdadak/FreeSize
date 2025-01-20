// components/Btn/LogoutButton.tsx

'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';

const LogoutButton: React.FC = () => {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="
        border px-2 py-1 rounded-md hover:border-dotted hover:text-black hover:bg-white flex gap-3
      "
    >
      <LogOut /> <span>Logout</span>
    </button>
  );
};

export default LogoutButton;
