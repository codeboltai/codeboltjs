import axios, { AxiosInstance, AxiosError } from 'axios';

const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return (window as any).env?.backendUrl || window.location.origin;
  }
  return 'http://localhost:12345';
};

const apiClient: AxiosInstance = axios.create({
  baseURL: `${getBaseUrl()}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const setApiBaseUrl = (url: string) => {
  apiClient.defaults.baseURL = `${url}/api`;
};

export default apiClient;
