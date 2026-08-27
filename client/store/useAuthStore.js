import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initializeAuth: async () => {
    if (typeof window === 'undefined') return;
    const storedToken = localStorage.getItem('eduquery_token');
    const storedUser = localStorage.getItem('eduquery_user');

    if (storedToken && storedUser) {
      try {
        set({ token: storedToken, user: JSON.parse(storedUser), isAuthenticated: true });
        // Verify with backend
        const res = await api.get('/auth/me');
        if (res.data.success) {
          set({ user: res.data.data });
          localStorage.setItem('eduquery_user', JSON.stringify(res.data.data));
        }
      } catch (err) {
        console.warn('Session expired or invalid, logging out');
        get().logout();
      }
    }
    set({ isLoading: false });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data.data;

      localStorage.setItem('eduquery_token', token);
      localStorage.setItem('eduquery_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return { success: true, user };
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  register: async (name, email, password, role = 'student') => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      const { user, token } = res.data.data;

      localStorage.setItem('eduquery_token', token);
      localStorage.setItem('eduquery_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return { success: true, user };
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('eduquery_token');
      localStorage.removeItem('eduquery_user');
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },
}));
