import { ProcessMethod } from '@/types';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

export const PROCESS_METHODS: ProcessMethod[] = [
  { id: 'method1', label: 'Method 1' },
  { id: 'method2', label: 'Method 2' },
];
