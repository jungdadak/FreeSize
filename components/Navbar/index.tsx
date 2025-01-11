// components/Navbar/index.tsx
import { Home, User, LogIn } from 'lucide-react';
import Link from 'next/link';
import DarkModeToggler from '../DarkModeToggler';
import MobileNav from './MobileNav';

const navItems = [
  { href: '/', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { href: '/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  { href: '/login', label: 'Login', icon: <LogIn className="w-5 h-5" /> },
];

export default function Navbar() {
  return (
    <>
      <header
        className="fixed top-0 inset-x-0 h-16 z-50
        bg-white dark:bg-[#111111]
        border-b border-gray-100 dark:border-gray-800
        transition-colors duration-200"
      >
        <div
          className="container mx-auto h-full px-6
          flex items-center justify-between"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-semibold">Brand</span>
          </Link>

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
      <div className="h-16" /> {/* Top navbar spacer */}
      <div className="h-16 md:h-0" /> {/* Bottom mobile navigation spacer */}
    </>
  );
}
