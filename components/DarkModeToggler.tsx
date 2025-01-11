'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function DarkModeToggler() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false); // 서버 렌더링을 위한 기본값

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    document.cookie = `theme=${newTheme}; max-age=${3600 * 24 * 400}`;
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
        text-gray-600 dark:text-gray-400
        transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 hover:text-amber-500 transition-colors" />
      ) : (
        <Moon className="w-5 h-5 hover:text-blue-500 transition-colors" />
      )}
    </button>
  );
}
