'use client';

import { useRef } from 'react';
import { Menu, X, ArrowUpLeft, Home, User, Plus } from 'lucide-react';
import { useState, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFileStore, FileItem } from '@/store/fileStore';
import { FILE_CONFIG } from '@/configs/file.config';
import { useSession } from 'next-auth/react';
import LogoutButton from '../Btn/LogoutButton';
import SignInButton from '../Btn/SignInButton';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface MobileNavProps {
  navItems: NavItem[];
}

const MobileNav: React.FC<MobileNavProps> = ({ navItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const files = useFileStore((state) => state.files);
  const addFile = useFileStore((state) => state.addFile);
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateFile = (file: File): boolean => {
    if (!FILE_CONFIG.validTypes.includes(file.type)) {
      setError(
        `Sorry, only ${FILE_CONFIG.validTypes
          .map((type) => type.split('/')[1].toUpperCase())
          .join(', ')} files are supported.`
      );
      return false;
    }
    if (file.size > FILE_CONFIG.maxSize) {
      setError(`File size must be less than ${FILE_CONFIG.maxSizeInMB}MB.`);
      return false;
    }
    return true;
  };

  const isDuplicate = (file: File): boolean => {
    return files.some(
      (item) => item.file.name === file.name && item.file.size === file.size
    );
  };

  const exceedsFileLimit = (newFilesCount: number): boolean => {
    return files.length + newFilesCount > FILE_CONFIG.maxImageCount;
  };

  const processFile = (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    if (isDuplicate(file)) {
      setError(`File "${file.name}" is already selected.`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const fileItem: FileItem = {
      file,
      previewUrl,
      dimensions: null,
      processingOption: null,
    };
    addFile(fileItem);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError('');

    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newFilesCount = selectedFiles.length;
      if (exceedsFileLimit(newFilesCount)) {
        setError(
          `You can only upload up to ${FILE_CONFIG.maxImageCount} files.`
        );
        return;
      }

      for (let i = 0; i < selectedFiles.length; i++) {
        processFile(selectedFiles[i]);
      }
      router.push('/preview');
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

      <input
        type="file"
        ref={inputRef}
        className="hidden"
        onChange={handleChange}
        accept={FILE_CONFIG.validTypes.join(',')}
        multiple
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
        <nav className="h-full mt-10 flex flex-col items-center px-6">
          <ul className="flex flex-col items-center gap-8 mb-12">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex flex-col items-center gap-2 transition-colors duration-200
                    ${
                      item.href === '/admin'
                        ? 'text-yellow-400 hover:text-yellow-300'
                        : 'hover:text-blue-500'
                    }`}
                >
                  {item.icon}
                  <span className="text-lg">{item.label}</span>
                </Link>
              </li>
            ))}
            <li>
              <div
                className="flex justify-center items-center"
                onClick={() => setIsOpen(false)}
              >
                {session ? <LogoutButton /> : <SignInButton />}
              </div>
            </li>
          </ul>

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
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Link>
        </div>

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
          {error && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-2 py-1 rounded text-xs">
              {error}
            </div>
          )}
        </div>

        <div className="flex-1 flex justify-center">
          <Link href="/profile" className="flex flex-col items-center gap-1">
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
