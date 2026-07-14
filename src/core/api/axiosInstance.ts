import axios, { AxiosInstance } from 'axios';
import { tokenService } from '../utils/token';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (v: string) => void;
  reject:  (e: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

const axiosInstance: AxiosInstance = axios.create({
  baseURL:  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1',
  timeout:  15000,
  headers:  {
    'Content-Type': 'application/json', // always JSON — never overridden
    'Accept':       'application/json',
  },
});

// ── Request interceptor ──────────────────────────────
axiosInstance.interceptors.request.use((config) => {
  // Attach auth token
  const token = tokenService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Force Content-Type to always be application/json
  // Prevents accidental multipart/form-data from FormData usage
  config.headers['Content-Type'] = 'application/json';

  return config;
});

// ── Response interceptor (refresh token) ────────────
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(original);
        });
      }

      original._retry  = true;
      isRefreshing     = true;

      try {
        const refreshToken = tokenService.getRefreshToken();
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        );
        const { access_token, refresh_token } = data.data;
        tokenService.setTokens(access_token, refresh_token);
        processQueue(null, access_token);
        original.headers.Authorization = `Bearer ${access_token}`;
        return axiosInstance(original);
      } catch (err) {
        processQueue(err, null);
        tokenService.clearTokens();
        window.location.href = '/auth/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;