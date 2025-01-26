'use client';

import { Home, User, RocketIcon, BarChart } from 'lucide-react';
import Link from 'next/link';
import DarkModeToggler from '../DarkModeToggler';
import MobileNav from './MobileNav';
import { useSession } from 'next-auth/react';
import Logo from '../Logo';
import SignInButton from '../Btn/SignInButton';
import LogoutButton from '../Btn/LogoutButton';

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
          href: '/admin',
          label: 'Dashboard',
          icon: <BarChart className="w-5 h-5" />,
        },
      ]
    : []),
];

export default function Navbar() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const navItemsWithAdmin = getNavItems(isAdmin);

  return (
    <>
      <header
        className={`
          fixed top-0 inset-x-0 h-16 z-50
          ${
            isAdmin
              ? 'bg-gradient-to-r from-blue-900 to-purple-900 text-white'
              : 'bg-white dark:bg-[#2A2E2D]'
          }
          transition-colors duration-200
        `}
      >
        <div className="container mx-auto h-full pl-2 pr-6 flex items-center justify-between">
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
                        item.href === '/admin'
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
            {session?.user ? (
              <>
                <span
                  className={`mr-4 ${
                    isAdmin
                      ? 'text-yellow-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {isAdmin ? '👑 ' : ''}
                  {session.user.name || session.user.email?.split('@')[0]}
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
    </>
  );
}
