import axios from 'axios';

// ─── Axios Instance ───────────────────────────────────────────────────────────
//
// Instead of writing the full backend URL in every API call, we create a
// single Axios "instance" configured with:
//   - baseURL: the root URL of our backend (from the .env file)
//   - headers: default Content-Type for JSON requests
//
// Usage in any component or page:
//   import api from '../services/api';
//   const response = await api.get('/test');
//   const response = await api.post('/auth/login', { email, password });
//
// ─────────────────────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Automatically attach the JWT token to every request if the user is logged in.
// The token is stored in localStorage after login.
// We'll use this properly in Phase 3 (Authentication).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
