import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // 兼容根域名部署（如 EdgeOne Pages）与 GitHub Pages 子路径
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          maplibre: ['maplibre-gl'],
          motion: ['framer-motion'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
})
