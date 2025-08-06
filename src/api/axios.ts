import axios from "axios";
const BASE_URL = import.meta.env.VITE_WP_DOMAIN;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: false 
});

// Add request interceptor to handle origin
axiosInstance.interceptors.request.use(
  (config) => {
    // Add origin header based on current host
    const origin = window.location.origin;
    if (origin.includes('localhost:5173') || origin.includes('boissonsolutionx.ca')) {
      config.headers['Origin'] = origin;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;

export { isAxiosError } from 'axios';
