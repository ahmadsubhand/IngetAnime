import axios from 'axios';
import csrfService from '../services/csrf.service';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const method = config.method?.toUpperCase();

  if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = await csrfService.getCsrfToken();
    config.headers['x-csrf-token'] = csrfToken;
  }

  return config;
});

export default api;
