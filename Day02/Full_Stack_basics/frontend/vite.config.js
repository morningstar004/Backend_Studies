import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    // proxy configuration to forward requests starting with '/api' to the backend server running on localhost:5000
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
  ,
  plugins: [react()],
})
