import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '../lib/api';

export function useApiQuery<T>(
  key: string[],
  url: string,
  options?: Omit<UseQueryOptions<T, AxiosError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, AxiosError>({
    queryKey: key,
    queryFn: async () => {
      const response = await api.get(url);
      return response.data;
    },
    ...options,
  });
}

export function useApiMutation<T, V>(
  url: string,
  options?: Omit<UseMutationOptions<T, AxiosError, V>, 'mutationFn'>
) {
  return useMutation<T, AxiosError, V>({
    mutationFn: async (data) => {
      const response = await api.post(url, data);
      return response.data;
    },
    ...options,
  });
}

export function useApiPut<T, V>(
  url: string,
  options?: Omit<UseMutationOptions<T, AxiosError, V>, 'mutationFn'>
) {
  return useMutation<T, AxiosError, V>({
    mutationFn: async (data) => {
      const response = await api.put(url, data);
      return response.data;
    },
    ...options,
  });
}

export function useApiDelete<T>(
  url: string,
  options?: Omit<UseMutationOptions<T, AxiosError, void>, 'mutationFn'>
) {
  return useMutation<T, AxiosError, void>({
    mutationFn: async () => {
      const response = await api.delete(url);
      return response.data;
    },
    ...options,
  });
} 