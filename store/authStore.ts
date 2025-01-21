// store/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from '@/lib/axios';
import { isAxiosError } from 'axios';

// 사용자 정보 인터페이스
import { Prisma } from '@prisma/client';

type UserProfile = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    role: true;
  };
}>;

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Zustand 스토어 생성
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,

      // 로그인 함수
      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          // 서버에 로그인 요청 (JWT는 HTTP-Only 쿠키에 설정됨)
          await axios.post('/api/auth/login', { email, password });

          // 로그인 성공 후 사용자 정보 가져오기
          const profileRes = await axios.get('/api/profile');
          set({
            user: profileRes.data.user,
            loading: false,
          });
        } catch (error: unknown) {
          if (isAxiosError(error) && error.response) {
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
          // 서버에 회원가입 요청 (JWT는 HTTP-Only 쿠키에 설정됨)
          await axios.post('/api/auth/signup', { email, password, name });

          // 회원가입 성공 후 사용자 정보 가져오기
          const profileRes = await axios.get('/api/profile');
          set({
            user: profileRes.data.user,
            loading: false,
          });
        } catch (error: unknown) {
          if (isAxiosError(error) && error.response) {
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

      logout: async () => {
        try {
          await axios.post('/api/auth/logout');
          set({ user: null }); // API 성공 후에 상태 초기화
        } catch (error) {
          console.error('Logout error:', error);
          // 에러가 나더라도 로컬 상태는 초기화
          set({ user: null });
        }
      },
    }),
    {
      name: 'auth-storage', // unique name for localStorage
      storage: createJSONStorage(() => localStorage), // using createJSONStorage for correct typing
      partialize: (state: AuthState) => ({
        user: state.user,
      }), // only persist user
    }
  )
);

export default useAuthStore;
