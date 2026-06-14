import * as SecureStore from 'expo-secure-store';
import { api } from './api';
import { User } from '@/types';

interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  async restoreSession(): Promise<AuthResponse> {
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) throw new Error('No session');
    const user = await api.get<User>('/auth/me');
    return { user, token };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>('/auth/login', { email, password });
    await SecureStore.setItemAsync('auth_token', data.token);
    return data;
  }

  async loginWithGoogle(): Promise<AuthResponse> {
    // Firebase Google sign-in returns an idToken — send to backend to verify
    // TODO: Implement Firebase Google sign-in flow
    // const { idToken } = await GoogleSignin.signIn();
    // const data = await api.post<AuthResponse>('/auth/google', { idToken });
    // await SecureStore.setItemAsync('auth_token', data.token);
    // return data;
    throw new Error('Google sign-in not yet implemented');
  }

  async signup(email: string, password: string, name: string): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>('/auth/signup', { email, password, name });
    await SecureStore.setItemAsync('auth_token', data.token);
    return data;
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      await SecureStore.deleteItemAsync('auth_token');
    }
  }
}

export const authService = new AuthService();
