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
        target: 'http://centralkitchen-001-site1.mtempurl.com/',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})