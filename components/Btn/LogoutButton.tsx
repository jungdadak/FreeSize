// components/Btn/LogoutButton.tsx
'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import useToastStore from '@/store/toastStore';

const LogoutButton = () => {
  const showToast = useToastStore((state) => state.showToast);

  const handleLogout = () => {
    showToast('로그아웃 되었습니다.', 'info');
    // 토스트가 표시될 시간을 주기 위해 약간의 지연 추가
    setTimeout(() => {
      signOut({ callbackUrl: '/' });
    }, 1000); // 토스트가 어느 정도 보일 시간
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      className="flex items-center gap-2"
    >
      <LogOut className="w-4 h-4" />
      <span>log out</span>
    </Button>
  );
};

export default LogoutButton;
