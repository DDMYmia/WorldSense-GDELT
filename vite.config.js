import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({ 
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          leaflet: ['leaflet', 'react-leaflet']
        },
        assetFileNames: 'assets/[name]-v3.0-[hash][extname]',
        chunkFileNames: 'assets/[name]-v3.0-[hash].js',
        entryFileNames: 'assets/[name]-v3.0-[hash].js'
      }
    }
  },
  server: {
    port: 5173,
    host: true
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['leaflet', 'react-leaflet']
  }
})


