// components/Navbar/index.tsx

'use client';

import { Home, User, RocketIcon } from 'lucide-react';
import Link from 'next/link';
import DarkModeToggler from '../DarkModeToggler';
import MobileNav from './MobileNav';
import SignInButton from '../Btn/SignInButton';
import LogoutButton from '../Btn/LogoutButton'; // LogoutButton 추가
import Logo from '../Logo';
import useAuthStore from '@/store/authStore'; // Zustand 스토어 임포트

const navItems = [
  {
    href: '/quickstart',
    label: 'Quick Start',
    icon: <RocketIcon className="w-5 h-5" />,
  },
  { href: '/', label: 'Home', icon: <Home className="w-8 h-8" /> },
  { href: '/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
];

export default function Navbar() {
  const user = useAuthStore((state) => state.user); // 사용자 상태 가져오기

  return (
    <>
      <header
        className="
          fixed top-0 inset-x-0 h-16 z-50
          bg-white dark:bg-[#111111]
          transition-colors duration-200
        "
      >
        <div
          className="
            container mx-auto h-full px-6
            flex items-center justify-between
          "
        >
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <ul className="flex items-center gap-4">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 hover:text-blue-500 transition-colors duration-200"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {/* 조건부 렌더링: 로그인 상태에 따라 버튼 표시 */}
            {user ? <LogoutButton /> : <SignInButton />}
            <DarkModeToggler />
          </nav>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-4">
            <DarkModeToggler />
            <MobileNav />
          </div>
        </div>
      </header>
      {/* Spacers for fixed elements */}
      <div className="h-16 md:h-0" /> {/* Top navbar spacer */}
    </>
  );
}
