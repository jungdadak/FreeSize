import { create } from 'zustand';
import axios from '@/lib/axios';
import { isAxiosError } from 'axios';

interface User {
  id: number;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  verifyAuth: () => Promise<void>;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  setUser: (user) => set({ user }),

  clearError: () => set({ error: null }),

  verifyAuth: async () => {
    try {
      const res = await axios.get('/api/auth/verify');
      set({ user: res.data.user });
      return res.data.user;
    } catch (error) {
      set({ user: null });
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      const res = await axios.get('/api/auth/profile');
      set({ user: res.data.user });
    } catch {
      set({ user: null });
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      await axios.post('/api/auth/login', { email, password });
      const profileRes = await axios.get('/api/auth/profile');
      set({
        user: profileRes.data.user,
        loading: false,
        error: null,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        set({
          error: error.response.data.message || 'Login failed',
          loading: false,
          user: null,
        });
      } else {
        set({
          error: 'Login failed',
          loading: false,
          user: null,
        });
      }
      throw error;
    }
  },

  signup: async (email: string, password: string, name?: string) => {
    set({ loading: true, error: null });
    try {
      const signupResponse = await axios.post('/api/auth/signup', {
        email,
        password,
        name,
      });
      console.log('Signup response:', signupResponse.data);

      set({
        user: signupResponse.data.user,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Detailed signup error in store:', error);
      if (isAxiosError(error)) {
        set({
          error: error.response?.data?.message || '회원가입에 실패했습니다.',
          loading: false,
          user: null,
        });
      } else {
        set({
          error: '회원가입 중 오류가 발생했습니다.',
          loading: false,
          user: null,
        });
      }
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await axios.post('/api/auth/logout');
      set({
        user: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      set({
        user: null,
        loading: false,
        error: 'Logout failed',
      });
    }
  },
}));

export default useAuthStore;
