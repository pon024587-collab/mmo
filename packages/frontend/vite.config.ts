import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: process.env['VITE_API_URL'] ?? 'http://backend:4000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: parseInt(process.env['PORT'] ?? '3000'),
    host: '0.0.0.0',
    allowedHosts: ['all', 'frontend-production-9b5b.up.railway.app'],
    proxy: {
      '/api': {
        target: process.env['VITE_API_URL'] ?? 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  define: {
    __API_URL__: JSON.stringify(process.env['VITE_API_URL'] ?? ''),
  },
})
