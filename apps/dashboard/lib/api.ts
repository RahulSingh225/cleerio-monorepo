import axios from 'axios';
import { useAuthStore } from '@/store/use-auth-store';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1',
  withCredentials: true,
});

// Request Interceptor to attach tenant context
api.interceptors.request.use((config) => {
  // We use useAuthStore.getState() to avoid hook rule issues in interceptors
  const { user } = useAuthStore.getState();
  
  if (user?.tenantId) {
    config.headers['x-tenant-id'] = user.tenantId;
  }
  
  // Also pass the code if we want the backend to have more options
  // (In our current system, tenantId UUID is the primary choice for the filter)
  // We might want to save tenantCode in the store as well during login
  
  return config;
}, (error) => {
  return Promise.reject(error);
});
