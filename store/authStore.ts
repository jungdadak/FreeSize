// store/authStore.ts

import { create } from 'zustand'; // Named import
import { persist, createJSONStorage } from 'zustand/middleware'; // Named imports
import axios from '@/lib/axios'; // Custom Axios instance
import { isAxiosError } from 'axios'; // Import isAxiosError directly
import { jwtDecode } from 'jwt-decode'; // Named import

// 사용자 정보 인터페이스
interface User {
  userId: number;
  email: string;
  role: 'USER' | 'ADMIN';
}

// 인증 상태 인터페이스
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

// Zustand 스토어 생성
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      // 로그인 함수
      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const res = await axios.post('/api/auth/login', { email, password });
          const { token } = res.data;
          const decoded = jwtDecode<{
            userId: number;
            email: string;
            role: 'USER' | 'ADMIN';
          }>(token);
          set({
            token,
            user: {
              userId: decoded.userId,
              email: decoded.email,
              role: decoded.role,
            },
            loading: false,
          });
        } catch (error: unknown) {
          if (isAxiosError(error) && error.response) {
            // Use isAxiosError directly
            set({
              error: error.response.data.message || 'Login failed',
              loading: false,
            });
          } else {
            set({ error: 'Login failed', loading: false });
          }
          console.error('Login error:', error);
        }
      },

      // 회원가입 함수
      signup: async (email: string, password: string, name?: string) => {
        set({ loading: true, error: null });
        try {
          const res = await axios.post('/api/auth/signup', {
            email,
            password,
            name,
          });
          const { token } = res.data;
          const decoded = jwtDecode<{
            userId: number;
            email: string;
            role: 'USER' | 'ADMIN';
          }>(token);
          set({
            token,
            user: {
              userId: decoded.userId,
              email: decoded.email,
              role: decoded.role,
            },
            loading: false,
          });
        } catch (error: unknown) {
          if (isAxiosError(error) && error.response) {
            // Use isAxiosError directly
            set({
              error: error.response.data.message || 'Signup failed',
              loading: false,
            });
          } else {
            set({ error: 'Signup failed', loading: false });
          }
          console.error('Signup error:', error);
        }
      },

      // 로그아웃 함수
      logout: () => {
        set({ token: null, user: null });
      },
    }),
    {
      name: 'auth-storage', // unique name for localStorage
      storage: createJSONStorage(() => localStorage), // using createJSONStorage for correct typing
      partialize: (state: AuthState) => ({
        token: state.token,
        user: state.user,
      }), // only persist token and user
    }
  )
);

export default useAuthStore;
