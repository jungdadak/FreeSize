'use client';
import SignInButton from '../Btn/SignInButton';
import { useRef } from 'react';
import { useBlobUpload } from '@/hooks/useBlobUpload';
import {
  Menu,
  X,
  ArrowUpLeft,
  Home,
  User,
  Plus,
  RocketIcon,
} from 'lucide-react';
import { useState, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: '/quickstart',
    label: 'Quick Start',
    icon: <RocketIcon className="w-8 h-8 bg-red-600 p-1 rounded-md" />,
  },
  { href: '/', label: 'Home', icon: <Home className="w-6 h-6" /> },
  { href: '/profile', label: 'Profile', icon: <User className="w-6 h-6" /> },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { handleFileUpload } = useBlobUpload();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const onUploadClick = () => {
    inputRef.current?.click();
  };

  if (!mounted) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-lg transition-colors duration-400"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="hover:bg-gray-100 dark:hover:bg-gray-800 w-8 h-8 border border-gray-500 rounded-md p-1" />
        ) : (
          <Menu className="hover:bg-gray-100 dark:hover:bg-gray-800 w-8 h-8 p-1 rounded-md" />
        )}
      </button>

      {/* Hidden file input */}
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        onChange={handleChange}
        accept="image/jpeg,image/png"
      />

      {/* Mobile Dropdown Menu */}
      <div
        className={`
          fixed inset-x-0 top-16 md:hidden
          bg-white dark:bg-[#111111]
          transition-all duration-500 ease-out
          ${
            isOpen
              ? 'translate-y-0 opacity-100 visible scale-y-100'
              : '-translate-y-5 opacity-0 invisible scale-y-95'
          }
        `}
      >
        <nav className="h-full flex flex-col items-center px-6 pt-20 pb-32">
          <ul className="flex flex-col items-center gap-8 mb-12">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex flex-col items-center gap-2 hover:text-blue-500 transition-colors duration-200"
                >
                  {item.icon}
                  <span className="text-lg">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex justify-center items-center">
            <SignInButton />
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="absolute bottom-0 right-8
              w-14 h-14 
              rounded-full
              flex items-center justify-center
              shadow-lg hover:shadow-xl
              transform hover:scale-110 active:scale-95
              transition-all duration-200"
            aria-label="Close menu"
          >
            <ArrowUpLeft />
          </button>
        </nav>
      </div>

      {/* Mobile Footer Navigation */}
      <div
        className="fixed bottom-0 inset-x-0 h-16 md:hidden
        bg-white dark:bg-[#111111]
        border-t border-gray-100 dark:border-gray-800
        flex items-center justify-around px-6"
      >
        <div className="flex-1 flex justify-center">
          <Link href="/" className="flex flex-col items-center gap-1">
            {navItems[1].icon}
            <span className="text-xs">{navItems[1].label}</span>
          </Link>
        </div>

        {/* Center Upload Button */}
        <div className="flex-1 flex justify-center -mt-8">
          <button
            onClick={onUploadClick}
            className="w-14 h-14 rounded-full 
              bg-gradient-to-r from-blue-500 to-purple-500
              hover:from-blue-600 hover:to-purple-600
              flex items-center justify-center
              shadow-lg hover:shadow-xl
              transform hover:scale-105
              transition-all duration-200"
            aria-label="Upload content"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex-1 flex justify-center">
          <Link href="/profile" className="flex flex-col items-center gap-1">
            {navItems[2].icon}
            <span className="text-xs">{navItems[2].label}</span>
          </Link>
        </div>
      </div>
    </>
  );
}
