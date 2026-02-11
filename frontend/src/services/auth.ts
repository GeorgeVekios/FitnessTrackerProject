import api from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  profilePictureUrl?: string;
}

export const authService = {
  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get('/api/auth/me');
      return response.data.user;
    } catch (error) {
      return null;
    }
  },

  // Login with Google (redirect)
  loginWithGoogle() {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  },

  // Logout
  async logout(): Promise<void> {
    await api.post('/api/auth/logout');
  },
};
