import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // bind to 0.0.0.0 so it's reachable from your phone on the same WiFi
  },
  preview: {
    port: 4173,
    host: true,
  },
})
