import { create } from 'zustand';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1',
  withCredentials: true,
});

interface AuthState {
  user: any | null;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  setUser: (user: any) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { data } = response.data;
    set({ user: data.user, isAuthenticated: true });
  },
  logout: () => {
    // Should call API to clear cookie
    set({ user: null, isAuthenticated: false });
  },
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/profile');
      const { data } = response.data;
      set({ user: data, isAuthenticated: true });
    } catch (err) {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
