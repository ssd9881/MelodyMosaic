import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

export default defineConfig({
  plugins: [react()],
  envPrefix: 'VITE_',
  server: {
    proxy: {
      // Proxy all requests starting with /api to the Flask backend
      '/api': {
        target: 'http://127.0.0.1:5000', // Your backend URL
        changeOrigin: true,
        secure: false, // Only set to false if you are using HTTP in development
      },
    },
  },
})
