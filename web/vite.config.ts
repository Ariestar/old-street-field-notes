import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // GitHub Pages 项目站路径：https://ariestar.github.io/old-street-field-notes/
  base: '/old-street-field-notes/',
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
