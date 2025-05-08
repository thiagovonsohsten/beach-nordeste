import axios from 'axios';
import { toast } from 'sonner';

// Configuração base do axios
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login se não estiver autenticado
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status === 400) {
      // Mostrar mensagem de erro para requisições inválidas
      toast.error(error.response.data.message || 'Erro na requisição');
    }
    return Promise.reject(error);
  }
);

export default api; 