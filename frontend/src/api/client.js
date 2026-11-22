import axios from 'axios';

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL || ''}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If a saved token has expired, clear it and send the person to the login page.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem('cb_token')) {
      localStorage.removeItem('cb_token');
      localStorage.removeItem('cb_user');
      window.location.assign('/login');
    }
    return Promise.reject(err);
  }
);

export default api;
