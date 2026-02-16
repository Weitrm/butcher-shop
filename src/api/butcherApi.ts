import axios from 'axios';


const resolveTimeout = (rawValue: unknown, fallback: number): number => {
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const butcherApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: resolveTimeout(import.meta.env.VITE_API_TIMEOUT_MS, 12000),
});


butcherApi.interceptors.request.use((config) => {

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    
  }

  return config;
})

export { butcherApi };
