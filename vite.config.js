import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // This line tells Vite to use relative paths so it loads correctly on GitHub Pages
  base: '/aquamind-ai/', 
  plugins: [react()],
  server: {
    port: 5173,
    host: true, 
  },
  preview: {
    port: 4173,
    host: true,
  },
})