import api from './api';
import type { User } from '../types/auth/user';
import type { Token } from '../types/auth/token';

export const authService = {
  async login(email: string, password: string): Promise<Token> {
    return api.post('/auth/login', { email, password });
  },
  
  async register(username: string, email: string, password: string): Promise<Token> {
    return api.post('/auth/register', { username, email, password });
  },
  
  async logout(token: string): Promise<void> {
    return api.post('/auth/logout', { token });
  },
  
  async refreshToken(refreshToken: string): Promise<Token> {
    return api.post('/auth/refresh-token', { refreshToken });
  },
  
  async getUserProfile(): Promise<User> {
    return api.get('/user/profile');
  },
  
  async updateUserProfile(userData: Partial<User>): Promise<User> {
    return api.put('/user/profile', userData);
  },
  
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return api.post('/user/change-password', { currentPassword, newPassword });
  },
  
  async requestPasswordReset(email: string): Promise<void> {
    return api.post('/auth/forgot-password', { email });
  },
  
  async resetPassword(token: string, newPassword: string): Promise<void> {
    return api.post('/auth/reset-password', { token, newPassword });
  }
};