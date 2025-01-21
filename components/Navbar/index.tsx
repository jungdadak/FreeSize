'use client';

import { useEffect } from 'react';
import { Home, User, RocketIcon, BarChart } from 'lucide-react';
import Link from 'next/link';
import axios from '@/lib/axios';
import DarkModeToggler from '../DarkModeToggler';
import MobileNav from './MobileNav';
import SignInButton from '../Btn/SignInButton';
import LogoutButton from '../Btn/LogoutButton';
import Logo from '../Logo';
import useAuthStore from '@/store/authStore';

const getNavItems = (isAdmin: boolean) => [
  {
    href: '/quickstart',
    label: 'Quick Start',
    icon: <RocketIcon className="w-5 h-5" />,
  },
  { href: '/', label: 'Home', icon: <Home className="w-8 h-8" /> },
  { href: '/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ...(isAdmin
    ? [
        {
          href: '/admin/dashboard',
          label: 'Dashboard',
          icon: <BarChart className="w-5 h-5" />,
        },
      ]
    : []),
];

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  // 주기적으로 로그인된 사용자의 권한만 확인
  useEffect(() => {
    if (!user) return; // 로그인된 사용자만 권한 확인

    const verifyAuth = async () => {
      try {
        const response = await axios.get('/api/auth/verify');
        const serverUser = response.data.user;

        // 서버의 사용자 정보와 클라이언트 상태가 불일치하는 경우에만 업데이트
        if (user?.role !== serverUser?.role || user?.id !== serverUser?.id) {
          setUser(serverUser);
        }
      } catch {
        // 검증 실패시 로그아웃
        setUser(null);
      }
    };

    verifyAuth();
    const interval = setInterval(verifyAuth, 5 * 60 * 1000); // 5분마다 재검증

    return () => clearInterval(interval);
  }, [user, setUser]);

  const navItemsWithAdmin = getNavItems(user?.role === 'ADMIN');

  return (
    <>
      <header
        className={`
          fixed top-0 inset-x-0 h-16 z-50
          ${
            user?.role === 'ADMIN'
              ? 'bg-gradient-to-r from-blue-900 to-purple-900 text-white'
              : 'bg-white dark:bg-[#111111]'
          }
          transition-colors duration-200
        `}
      >
        <div className="container mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex-shrink-0">
            <Logo />
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <ul className="flex items-center gap-4">
              {navItemsWithAdmin.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 transition-colors duration-200
                      ${
                        item.href === '/admin/dashboard'
                          ? 'text-yellow-400 hover:text-yellow-300'
                          : 'hover:text-blue-500'
                      }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {user ? (
              <>
                <span
                  className={`mr-4 ${
                    user.role === 'ADMIN'
                      ? 'text-yellow-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {user.role === 'ADMIN' ? '👑 ' : ''}
                  {user.name || user.email.split('@')[0]}
                </span>
                <LogoutButton />
              </>
            ) : (
              <SignInButton />
            )}
            <DarkModeToggler />
          </nav>

          <div className="flex md:hidden items-center gap-4">
            <DarkModeToggler />
            <MobileNav navItems={navItemsWithAdmin} />
          </div>
        </div>
      </header>
      <div className="h-16 md:h-0" />
    </>
  );
}
