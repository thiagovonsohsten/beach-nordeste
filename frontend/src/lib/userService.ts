import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'FUNCIONARIO';
  avatar?: string;
}

export const userService = {
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/users/change-password', {
      currentPassword,
      newPassword,
    });
  },
}; 