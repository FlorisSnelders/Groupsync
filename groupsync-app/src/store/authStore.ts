import { create } from 'zustand';
import { User } from '@/types';
import { authService } from '@/services/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  initialized: false,
  loading: false,
  error: null,

  initialize: async () => {
    try {
      const { user, token } = await authService.restoreSession();
      set({ user, token, initialized: true });
    } catch {
      set({ initialized: true });
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await authService.login(email, password);
      set({ user, token, loading: false });
    } catch (error: any) {
      set({ error: error.message ?? 'Login failed', loading: false });
      throw error;
    }
  },

  loginWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await authService.loginWithGoogle();
      set({ user, token, loading: false });
    } catch (error: any) {
      set({ error: error.message ?? 'Google login failed', loading: false });
      throw error;
    }
  },

  signup: async (email: string, password: string, name: string) => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await authService.signup(email, password, name);
      set({ user, token, loading: false });
    } catch (error: any) {
      set({ error: error.message ?? 'Signup failed', loading: false });
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, token: null });
  },

  updateUser: (updates: Partial<User>) => {
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...updates } });
    }
  },

  clearError: () => set({ error: null }),
}));
