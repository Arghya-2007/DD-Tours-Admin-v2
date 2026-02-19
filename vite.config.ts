import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // When you call /api locally, Vite secretly forwards it to Render
      '/api': {
        target: 'https://dd-tours-backend-v2.onrender.com/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false, // Allows it to work over http://localhost
      }
    }
  }
})