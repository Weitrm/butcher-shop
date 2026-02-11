import axios from 'axios';


const butcherApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 8000,
});


butcherApi.interceptors.request.use((config) => {

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    
  }

  return config;
})

export { butcherApi };
