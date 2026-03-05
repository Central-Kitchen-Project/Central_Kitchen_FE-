import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://meinamfpt-001-site1.ltempurl.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})