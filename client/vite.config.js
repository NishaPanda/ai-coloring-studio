import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy: any request from the frontend starting with /api
    // is forwarded to the backend at localhost:5000.
    //
    // WHY? Without this, the browser would block cross-origin requests
    // (CORS errors) during development. The proxy makes it look like
    // both frontend and backend are on the same origin.
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
