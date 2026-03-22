import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: false,
    proxy: {
      // Proxy SMS API to avoid CORS issues and keyword blockers
      '/api/otp': {
        target: 'https://www.fast2sms.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/otp/, '/dev/bulkV2'),
        secure: true,
      },
    },
  },
})
