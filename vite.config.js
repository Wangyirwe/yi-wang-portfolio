import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['three'],
  },
  server: {
    host: true,
    strictPort: true,
    allowedHosts: true,
    watch: {
      ignored: ['**/public/video/**', '**/public/fonts/**'],
    },
  },
})
