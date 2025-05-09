import api from './api';
import { toast } from 'sonner';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    try {
      console.log('Tentando login com:', credentials.email);
      const response = await api.post('/auth/login', credentials);
      console.log('Resposta do login:', response.data);
      
      const { token, user } = response.data;
      if (!token || !user) {
        throw new Error('Resposta inválida do servidor');
      }
      
      localStorage.setItem('token', token);
      return user;
    } catch (error: any) {
      console.error('Erro no login:', error);
      if (error.response) {
        console.error('Resposta do servidor:', error.response.data);
        throw new Error(error.response.data.message || 'Erro ao fazer login');
      } else if (error.request) {
        console.error('Erro na requisição:', error.request);
        throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
      } else {
        console.error('Erro:', error.message);
        throw new Error('Erro ao processar a requisição');
      }
    }
  },

  async register(data: RegisterData) {
    try {
      const response = await api.post('/auth/register', data);
      const { token, user } = response.data;
      if (!token || !user) {
        throw new Error('Resposta inválida do servidor');
      }
      localStorage.setItem('token', token);
      return user;
    } catch (error: any) {
      console.error('Erro no registro:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Erro ao registrar');
      } else if (error.request) {
        throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
      } else {
        throw new Error('Erro ao processar a requisição');
      }
    }
  },

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error: any) {
    console.error('Erro no login:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Erro ao fazer login');
    } else if (error.request) {
      throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
    } else {
      throw new Error('Erro ao processar a requisição');
    }
  }
};

export const register = async (name: string, email: string, password: string) => {
  try {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  } catch (error: any) {
    console.error('Erro no registro:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Erro ao registrar');
    } else if (error.request) {
      throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
    } else {
      throw new Error('Erro ao processar a requisição');
    }
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
}; 